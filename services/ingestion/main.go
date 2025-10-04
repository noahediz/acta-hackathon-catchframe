package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", handler)

	log.Println("Starting server on port", port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func handler(w http.ResponseWriter, r *http.Request) {

	// Check if the request method is POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

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

	// Log recevied data
	log.Printf("Received file: %s", header.Filename)
	log.Printf("File size: %d bytes", header.Size)
	log.Printf("Description: %s", description)

	// Return success message
	fmt.Fprintln(w, "Report received successfully!")
}
