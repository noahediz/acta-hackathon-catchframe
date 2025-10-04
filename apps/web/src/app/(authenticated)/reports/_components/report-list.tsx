"use client"; // This is crucial! It tells Next.js to run this in the browser.

import { useState, useEffect } from 'react';
import { Report } from '@/app/api/reports/route'; // Import the type from your API file

export default function ReportsList() {
    // State to store the reports, loading status, and any potential errors
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Define an async function inside the effect to fetch the data
        const fetchReports = async () => {
            try {
                // Fetch data from your API endpoint
                const response = await fetch('/api/reports');

                // If the response is not ok (e.g., 401 Unauthorized, 500 Server Error), throw an error
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch reports');
                }

                // Parse the JSON data from the response
                const data: Report[] = await response.json();

                // Update the state with the fetched reports
                setReports(data);
            } catch (err) {
                // If an error occurs, check if it's an instance of Error
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unexpected error occurred.");
                }
            } finally {
                // Set loading to false once the fetch is complete (either success or error)
                setIsLoading(false);
            }
        };

        // Call the fetch function
        fetchReports();
    }, []); // The empty dependency array [] means this effect runs only once when the component mounts

    // Render a loading message while data is being fetched
    if (isLoading) {
        return <div>Loading reports...</div>;
    }

    // Render an error message if the fetch failed
    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    // Render the list of reports
    return (
        <div>
            <h1>All Bug Reports</h1>
            {reports.length === 0 ? (
                <p>No reports found.</p>
            ) : (
                <ul>
                    {reports.map((report) => (
                        <li key={report.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                            <p><strong>ID:</strong> {report.id}</p>
                            <p><strong>Description:</strong> {report.description}</p>
                            <p><strong>Status:</strong> {report.status}</p>
                            <p><strong>Email:</strong> {report.email || 'Not provided'}</p>
                            <p><strong>Timestamp:</strong> {new Date(report.timestamp.seconds * 1000).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

