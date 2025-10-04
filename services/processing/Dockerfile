FROM golang:1.25-alpine as builder
RUN apk add --no-cache build-base ffmpeg
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /processing-service .
FROM gcr.io/distroless/base-debian12
COPY --from=builder /processing-service /
COPY --from=builder /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=builder /lib /lib
COPY --from=builder /usr/lib /usr/lib
CMD ["/processing-service"]