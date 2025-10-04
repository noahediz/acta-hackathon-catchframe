export type Report = {
  id: string
  email?: string
  consoleLogs: string
  description: string
  metadata: string
  processedVideoUrl?: string
  status: "pending" | "processing" | "completed" | "fixed"
  timestamp: {
    seconds: number
    nanoseconds: number
  }
}
