# https://docs.docker.com/guides/golang/build-images/

FROM golang:1.25-alpine
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /processing-service
CMD ["/processing-service"]