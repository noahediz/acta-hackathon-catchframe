import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getReportById } from '@/utils/getReportById';

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
    const report = await getReportById(params.id);

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Bug Report Details</CardTitle>
                            <CardDescription>ID: {report.id}</CardDescription>
                        </div>
                        <Badge variant={report.status === 'processing' ? 'default' : 'secondary'}>
                            {report.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left side: Video Player */}
                    <div>
                        <h3 className="font-semibold mb-2">Screen Recording</h3>
                        {report.processedVideoUrl ? (
                            <video
                                src={report.processedVideoUrl}
                                controls
                                className="w-full rounded-lg border bg-black"
                                preload="metadata"
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="w-full aspect-video flex items-center justify-center rounded-lg border bg-gray-100">
                                <p className="text-gray-500">Video not available.</p>
                            </div>
                        )}
                    </div>

                    {/* Right side: Report Details */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Description</h3>
                            <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md border">{report.description || 'No description provided.'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Timestamp</h3>
                            <p className="text-sm">{new Date(report.timestamp.seconds * 1000).toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Submitter Email</h3>
                            <p className="text-sm">{report.email || 'Not provided'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Console Logs</h3>
                            <pre className="text-xs text-gray-800 p-3 bg-gray-900 text-white rounded-md max-h-48 overflow-auto">
                                <code>{JSON.stringify(JSON.parse(report.consoleLogs), null, 2)}</code>
                            </pre>
                        </div>
                        <div>
                            <h3 className="font-semibold">Metadata</h3>
                            <pre className="text-xs p-3 bg-gray-100 rounded-md border max-h-48 overflow-auto">
                                <code>{JSON.stringify(JSON.parse(report.metadata), null, 2)}</code>
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
