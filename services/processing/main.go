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
	firestoreClient        *firestore.Client
	storageClient          *storage.Client
	gcpProjectID           = os.Getenv("GOOGLE_CLOUD_PROJECT")
	reportsCollection      = "reports"
	rawUploadsBucketName   = "catchframe-raw-uploads"
	processedReportsBucket = "catchframe-processed-reports"
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

	// Define source and destination objects in GCS.
	sourceObject := storageClient.Bucket(rawUploadsBucketName).Object(rawVideoFileName)
	destObject := storageClient.Bucket(processedReportsBucket).Object(rawVideoFileName)

	// Copy the object from the raw bucket to the processed bucket.
	copier := destObject.CopierFrom(sourceObject)
	if _, err := copier.Run(ctx); err != nil {
		return fmt.Errorf("failed to copy object: %w", err)
	}
	log.Printf("Successfully copied %s to bucket %s", rawVideoFileName, processedReportsBucket)

	// Delete the original object from the raw bucket.
	if err := sourceObject.Delete(ctx); err != nil {
		// Log the error but don't fail the function, as the copy succeeded.
		log.Printf("Warning: failed to delete source object %s: %v", rawVideoFileName, err)
	} else {
		log.Printf("Successfully deleted source object %s", rawVideoFileName)
	}

	// The public URL now points to the new object in the processed bucket.
	processedVideoURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", processedReportsBucket, rawVideoFileName)

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
