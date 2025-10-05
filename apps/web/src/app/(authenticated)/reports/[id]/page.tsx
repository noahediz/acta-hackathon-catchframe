import { getReportById } from "@/utils/getReportById"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Mail, Video, AlertCircle } from "lucide-react"
import { ReportActions } from "@/components/report-action"

// Define a type for the page props for better clarity
type ReportDetailPageProps = {
  params: { id: string }
}

// Define the structure of a single console log entry
type ConsoleLog = {
  level: "error" | "info" | "warn" | "log"
  timestamp: number
  message: string
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-neutral-500/20 dark:bg-neutral-800/40 text-neutral-600" },
  new: { label: "New", className: "bg-blue-200 dark:bg-blue-800/40 text-blue-600" },
  processing: { label: "Processing", className: "bg-yellow-300/40 dark:bg-yellow-800/40 text-yellow-600" },
  completed: { label: "Completed", className: "bg-green-500/20 dark:bg-green-800/40 text-green-600" },
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const report = await getReportById(params.id)

  // If the report is not found, you should handle that case
  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Report not found</h2>
          <p className="text-muted-foreground">The report you&lsquo;re looking for doesn&lsquo;t exist.</p>
        </div>
      </div>
    )
  }

  // Limit description to 30 characters
  const limitedDescription =
    report.description.length > 30 ? report.description.slice(0, 30) + "..." : report.description

  // Type the parsed console logs array
  const jsonconsolelogs: ConsoleLog[] = report.consoleLogs ? JSON.parse(report.consoleLogs) : []

  const Metadata = () => {
    // Use 'unknown' for safer JSON parsing
    const jsonResponse: unknown = JSON.parse(report.metadata)
    const prettyJson = JSON.stringify(jsonResponse, null, 2)
    return (
      <SyntaxHighlighter
        language="json"
        style={vscDarkPlus}
        customStyle={{
          overflow: "auto",
          fontSize: "0.875rem",
          borderRadius: "0.375rem",
          width: "100%",
          maxHeight: "60vh",
        }}
      >
        {prettyJson}
      </SyntaxHighlighter>
    )
  }

  return (
    <div className="w-full flex flex-col gap-6 ">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/reports">All Records</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{limitedDescription}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex gap-2 items-center">
            <h1 className="font-semibold text-2xl text-balance">Report Details</h1>
            <Badge
              className={
                statusConfig[report.status as keyof typeof statusConfig]?.className || statusConfig.pending.className
              }
            >
              {statusConfig[report.status as keyof typeof statusConfig]?.label || "Unknown"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">View and manage report information</p>
        </div>
        
        <ReportActions reportId={params.id} currentStatus={report.status} />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">

        <div className="space-y-2 border w-full">
          <div className="py-3 px-4 space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Description</p>  
            <p>{report.description}</p>
          </div>
          <Separator />
          <div className="py-3 px-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">E-Mail</p>  
            <p>{report.email || "Not provided"}</p>
          </div>
          <Separator />
          <div className="py-3 px-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">Timestamp</p>  
            <p>{report.timestamp ? report.timestamp.toDate().toLocaleString() : "No date"}</p>
          </div><Separator />
          <div className="py-3 px-4 space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Screen Recording</p>  
            <video controls className="w-full rounded-md border">
                  <source src={report.processedVideoUrl} type="video/webm" />
                  Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <div className="space-y-2 border w-full">
          <div className="py-3 px-4 space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Metadata</p>  
            <Metadata />
          </div>          
        </div>          

        <div className="space-y-2 border lg:col-span-2">
            <div className="py-3 px-4 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Console Logs</p>  
              {jsonconsolelogs.length > 0 ? (
                  jsonconsolelogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`font-mono ${
                        log.level === "error"
                          ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                          : log.level === "warn"
                            ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900"
                            : "text-foreground bg-muted"
                      } border p-3 text-xs rounded-md`}
                    >
                      <div className="flex sm:flex-row flex-col items-start gap-2">
                        <span className="text-muted-foreground shrink-0">
                          [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        <span className="font-semibold shrink-0">{log.level.toUpperCase()}:</span>
                        <span>{log.message}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No console logs recorded.</p>
                )}
            </div>          
          </div>

      </div>
    </div>
  )
}
