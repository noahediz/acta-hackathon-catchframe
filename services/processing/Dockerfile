FROM golang:1.25.1 AS builder

# Install ffmpeg using Debian's package manager.
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory inside the container.
WORKDIR /app

# Copy go.mod and go.sum files to download dependencies first.
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application's source code.
COPY . .

# Build the application, creating a static binary.
# FIX: Explicitly set the target architecture to amd64 for cloud compatibility.
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /processing-service .

# ---

# Stage 2: The "Showroom" - Create the final, minimal production image.
# This stage is now compatible with the builder stage.
FROM gcr.io/distroless/base-debian11

# Copy the compiled Go binary from the 'builder' stage and set execute permissions.
COPY --from=builder --chmod=0755 /processing-service /

# Copy the ffmpeg binary itself from the 'builder' stage.
COPY --from=builder /usr/bin/ffmpeg /usr/bin/ffmpeg

# Copy the correct, compatible library dependencies from the Debian builder.
COPY --from=builder /lib /lib
COPY --from=builder /usr/lib /usr/lib

# Set the command to run when the container starts.
CMD ["/processing-service"]