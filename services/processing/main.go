package processing

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	cloudevents "github.com/cloudevents/sdk-go/v2"
)

// MessagePublishedData contains the data from a Pub/Sub event.
type MessagePublishedData struct {
	Message PubSubMessage `json:"message"`
}

// PubSubMessage is the payload of a Pub/Sub event.
type PubSubMessage struct {
	Data []byte `json:"data"`
}

var (
	firestoreClient        *firestore.Client
	storageClient          *storage.Client
	gcpProjectID           = os.Getenv("GOOGLE_CLOUD_PROJECT")
	reportsCollection      = "reports"
	rawUploadsBucketName   = "catchframe-raw-uploads"       // NEW: Name of the input bucket
	processedReportsBucket = "catchframe-processed-reports" // NEW: Name of the output bucket
)

func init() {
	// Register the Pub/Sub-triggered function.
	functions.CloudEvent("ProcessingService", ProcessingService)

	ctx := context.Background()
	var err error

	firestoreClient, err = firestore.NewClient(ctx, gcpProjectID)
	if err != nil {
		log.Fatalf("Failed to create firestore client: %v", err)
	}
}

// ProcessingService consumes a Pub/Sub message via a CloudEvent.
func ProcessingService(ctx context.Context, e cloudevents.Event) error {
	var msg MessagePublishedData
	if err := json.Unmarshal(e.Data(), &msg); err != nil {
		log.Printf("Error unmarshalling Pub/Sub message: %v", err)
		return err
	}

	reportID := string(msg.Message.Data)
	log.Printf("Received request to process report: %s", reportID)

	// Define temporary file paths.
	rawVideoFileName := reportID + ".webm"
	localRawPath := "/tmp/" + rawVideoFileName

	// Delete temporary raw files
	defer os.Remove(localRawPath)

	// Download raw video from GCS.
	rawObject := storageClient.Bucket(rawUploadsBucketName).Object(rawVideoFileName)
	rc, err := rawObject.NewReader(ctx)
	if err != nil {
		return fmt.Errorf("failed to create GCS reader: %w", err)
	}
	defer rc.Close()

	localFile, err := os.Create(localRawPath)
	if err != nil {
		return fmt.Errorf("failed to create local file: %w", err)
	}
	defer localFile.Close()

	if _, err := io.Copy(localFile, rc); err != nil {
		return fmt.Errorf("failed to copy GCS object to local file: %w", err)
	}
	log.Printf("Successfully downloaded raw video to %s", localRawPath)

	// Update the status in Firestore
	_, err = firestoreClient.Collection(reportsCollection).Doc(reportID).Update(ctx, []firestore.Update{
		{Path: "status", Value: "downloaded"},
	})
	if err != nil {
		log.Printf("Error updating firestore document %s: %v", reportID, err)
		return err
	}

	log.Printf("Report %s status updated to 'downloaded'.", reportID)
	return nil
}
