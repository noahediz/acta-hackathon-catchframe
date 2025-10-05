import { getReportById } from '@/utils/getReportById';
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

// Define a type for the page props for better clarity
type ReportDetailPageProps = {
  params: { id: string };
};

// Define the structure of a single console log entry
type ConsoleLog = {
  level: 'error' | 'info' | 'warn' | 'log';
  timestamp: number;
  message: string;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const report = await getReportById(params.id);

  // If the report is not found, you should handle that case
  if (!report) {
    return <div>Report not found.</div>;
  }

  // Limit description to 30 characters
  const limitedDescription = report.description.length > 30
    ? report.description.slice(0, 30) + "..."
    : report.description;

  // Type the parsed console logs array
  const jsonconsolelogs: ConsoleLog[] = report.consoleLogs ? JSON.parse(report.consoleLogs) : [];

  const Metadata = () => {
    // Use 'unknown' for safer JSON parsing
    const jsonResponse: unknown = JSON.parse(report.metadata);
    const prettyJson = JSON.stringify(jsonResponse, null, 2);
    return (
      <SyntaxHighlighter
        language="json"
        style={vscDarkPlus}
        customStyle={{
          overflow: "auto",
          fontSize: "0.875rem",
          borderRadius: "0.375rem",
          width: "100%",
          maxHeight: "60vh"
        }}
      >
        {prettyJson}
      </SyntaxHighlighter>
    );
  };

  return (
    <div className='w-full flex flex-col gap-6'>
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

      <div className='space-y-2'>
        <h1 className='font-semibold text-2xl'>Report Details</h1>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='space-y-6 bg-card p-6 rounded-lg border'>
          <div>
            <p className='text-sm text-muted-foreground'>Description</p>
            <p className='font-medium'>{report.description}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>E-Mail</p>
            <p>{report.email || 'Not provided'}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Timestamp</p>
            {/* Ensure timestamp exists before calling toDate() */}
            <p>{report.timestamp ? report.timestamp.toDate().toLocaleString() : 'No date'}</p>
          </div>
          {report.processedVideoUrl && (
            <div>
              <p className='text-sm text-muted-foreground'>Screen Recording</p>
              <video controls className="w-full max-w-[460px] rounded-md border mt-1">
                <source src={report.processedVideoUrl} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <div className='bg-card p-6 rounded-lg border'>
            <p className='text-sm text-muted-foreground mb-2'>Metadata</p>
            <Metadata />
          </div>
          <div className='bg-card p-6 rounded-lg border'>
            <p className='text-sm text-muted-foreground mb-2'>Console Logs</p>
            <div className='space-y-1 max-h-[60vh] overflow-y-auto'>
              {jsonconsolelogs.length > 0 ? jsonconsolelogs.map((log, idx) => (
                <p
                  key={idx}
                  className={`font-mono ${log.level === "error" ? "text-red-500" : "text-foreground"} bg-muted border p-2 text-xs rounded`}
                >
                  [{new Date(log.timestamp).toLocaleTimeString()}] {log.level.toUpperCase()}: {log.message}
                </p>
              )) : <p className='text-sm text-muted-foreground'>No console logs recorded.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}