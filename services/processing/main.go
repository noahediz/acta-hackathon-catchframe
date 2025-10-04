package processing

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	cloudevents "github.com/cloudevents/sdk-go/v2"
)

// MessagePublishedData contains the data from a Pub/Sub event
type MessagePublishedData struct {
	Message PubSubMessage `json:"message"`
}

// PubSubMessage is the payload of a Pub/Sub event
type PubSubMessage struct {
	Data []byte `json:"data"`
}

var (
	firestoreClient *firestore.Client
	storageClient   *storage.Client

	gcpProjectID         = os.Getenv("GOOGLE_CLOUD_PROJECT")
	reportsCollection    = "reports"
	rawUploadsBucketName = "catchframe-raw-uploads"
)

func init() {
	functions.CloudEvent("ProcessingService", ProcessingService)
	ctx := context.Background()
	var err error
	firestoreClient, err = firestore.NewClient(ctx, gcpProjectID)
	if err != nil {
		log.Fatalf("Failed to create firestore client: %v", err)
	}
	storageClient, err = storage.NewClient(ctx)
	if err != nil {
		log.Fatalf("Failed to create storage client: %v", err)
	}
}

// ProcessingService consumes a Pub/Sub message and finalizes the report document.
func ProcessingService(ctx context.Context, e cloudevents.Event) error {
	var msg MessagePublishedData
	if err := json.Unmarshal(e.Data(), &msg); err != nil {
		log.Printf("Error unmarshalling Pub/Sub message: %v", err)
		return err
	}

	reportID := string(msg.Message.Data)
	log.Printf("Finalizing report: %s", reportID)

	rawVideoFileName := reportID + ".webm"

	// The public URL is now the source of truth because the bucket itself is public.
	processedVideoURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", rawUploadsBucketName, rawVideoFileName)

	// Update the Firestore document with the final status and the direct video URL.
	_, err := firestoreClient.Collection(reportsCollection).Doc(reportID).Update(ctx, []firestore.Update{
		{Path: "status", Value: "completed"},
		{Path: "processedVideoUrl", Value: processedVideoURL},
	})
	if err != nil {
		log.Printf("Error updating firestore document %s: %v", reportID, err)
		return err
	}

	log.Printf("Successfully finalized report: %s. Status updated to 'completed'.", reportID)
	return nil
}
