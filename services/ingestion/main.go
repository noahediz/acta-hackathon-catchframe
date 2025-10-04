package ingestion

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
	"cloud.google.com/go/storage"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"github.com/google/uuid"
)

// Global variables for our clients and config
var (
	storageClient   *storage.Client
	firestoreClient *firestore.Client
	pubsubClient    *pubsub.Client
	pubsubTopic     *pubsub.Topic

	gcpProjectID      = os.Getenv("GOOGLE_CLOUD_PROJECT")
	rawBucketName     = "catchframe-raw-uploads"
	reportsCollection = "reports"
	topicID           = "reports-to-process"
)

// Rruns once on service startup to initialize Google Cloud clients
func init() {
	functions.HTTP("IngestionService", ingestionHandler)

	ctx := context.Background()
	var err error

	storageClient, err = storage.NewClient(ctx)
	if err != nil {
		log.Fatalf("Failed to create storage client: %v", err)
	}

	firestoreClient, err = firestore.NewClient(ctx, gcpProjectID)
	if err != nil {
		log.Fatalf("Failed to create firestore client: %v", err)
	}

	pubsubClient, err = pubsub.NewClient(ctx, gcpProjectID)
	if err != nil {
		log.Fatalf("Failed to create pubsub client: %v", err)
	}
	pubsubTopic = pubsubClient.Topic(topicID)
}

// Report defines the data structure for a report document in Firestore
type Report struct {
	ID          string    `firestore:"id"`
	Status      string    `firestore:"status"`
	Timestamp   time.Time `firestore:"timestamp"`
	Description string    `firestore:"description"`
	ConsoleLogs string    `firestore:"consoleLogs"`
	Metadata    string    `firestore:"metadata"`
	// MODIFICATION: Added Email field with 'omitempty' tag.
	// This ensures it's only stored in Firestore if the string is not empty.
	Email string `firestore:"email,omitempty"`
}

func ingestionHandler(w http.ResponseWriter, r *http.Request) {

	// Check if the request method is POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx := context.Background()

	// Parse the incoming form
	// 32 << 20 sets a limit of 32MB for the uploaded data
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, "Could not parse multipart form", http.StatusBadRequest)
		return
	}

	// Get the individual parts of the form
	file, header, err := r.FormFile("video")
	if err != nil {
		http.Error(w, "Could not get video file from form", http.StatusBadRequest)
		return
	}
	defer file.Close() // Ensure the file is closed after the function finishes

	description := r.FormValue("description")
	consoleLogsJSON := r.FormValue("consoleLogs")
	metadataJSON := r.FormValue("metadata")
	// MODIFICATION: Get the optional email from the form.
	// If 'email' is not present, this will return an empty string "".
	email := r.FormValue("email")

	// Log recevied data
	log.Printf("Received file: %s", header.Filename)
	log.Printf("File size: %d bytes", header.Size)
	log.Printf("Description: %s", description)
	log.Printf("consoleLogsJSON: %s", consoleLogsJSON)
	log.Printf("metadataJSON: %s", metadataJSON)
	if email != "" {
		log.Printf("Email: %s", email)
	}

	// Generate a unique ID for this report. This is the primary key
	reportID := uuid.New().String()
	log.Printf("Processing new report: %s", reportID)

	// Save video file with generated primary key
	videoObjectName := reportID + ".webm"
	gcsWriter := storageClient.Bucket(rawBucketName).Object(videoObjectName).NewWriter(ctx)

	// Stream file directly from request to GCS.
	if _, err := io.Copy(gcsWriter, file); err != nil {
		http.Error(w, "Could not upload video file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Close writer to finalize upload.
	if err := gcsWriter.Close(); err != nil {
		http.Error(w, "Could not finalize video upload: "+err.Error(), http.StatusInternalServerError)
		return
	}
	log.Printf("Uploaded video: %s", videoObjectName)

	// Create firestore document
	newReport := Report{
		ID:          reportID,
		Status:      "pending",
		Timestamp:   time.Now(),
		Description: description,
		ConsoleLogs: consoleLogsJSON,
		Metadata:    metadataJSON,
		Email:       email,
	}

	// Create new firebase document
	_, err = firestoreClient.Collection(reportsCollection).Doc(reportID).Set(ctx, newReport)
	if err != nil {
		http.Error(w, "Failed to create firestore document: "+err.Error(), http.StatusInternalServerError)
		return
	}
	log.Printf("Created Firestore document for report: %s", reportID)

	// Publish message to Google Pub/Sub: Knative event
	result := pubsubTopic.Publish(ctx, &pubsub.Message{
		Data: []byte(reportID),
	})

	// Wait for the message to be successfully published
	if _, err := result.Get(ctx); err != nil {
		http.Error(w, "Failed to publish message: "+err.Error(), http.StatusInternalServerError)
		return
	}
	log.Printf("Published Pub/Sub message for report: %s", reportID)

	// Response to client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted) // 202 Accepted: request received, processing initiated.
	json.NewEncoder(w).Encode(map[string]string{"reportId": reportID})
}
