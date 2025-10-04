package processing

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"cloud.google.com/go/firestore"
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
	firestoreClient *firestore.Client

	gcpProjectID      = os.Getenv("GOOGLE_CLOUD_PROJECT")
	reportsCollection = "reports"
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

	// For now, just update the status in Firestore to test the code
	_, err := firestoreClient.Collection(reportsCollection).Doc(reportID).Update(ctx, []firestore.Update{
		{Path: "status", Value: "completed"},
	})
	if err != nil {
		log.Printf("Error updating firestore document %s: %v", reportID, err)
		return err
	}

	log.Printf("Successfully processed report: %s. Status updated to 'completed'.", reportID)
	return nil
}
