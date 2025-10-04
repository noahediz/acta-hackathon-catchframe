export type Report = {
  id: string
  email?: string
  consoleLogs: string
  description: string
  metadata: string
  processedVideoUrl?: string
  status: "pending" | "processing" | "completed" | "new"
  timestamp: FirestoreTimestamp
}

export type FirestoreTimestamp =
  | { seconds: number; nanoseconds: number }
  | { _seconds: number; _nanoseconds: number }
