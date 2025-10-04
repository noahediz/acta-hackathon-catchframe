import { auth } from '@/auth';
import { db } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

// This is the type definition for your report, matching your Go struct.
export interface Report {
    id: string;
    status: string;
    timestamp: FirebaseFirestore.Timestamp; // Firestore timestamp is a specific type
    description: string;
    consoleLogs: string;
    metadata: string;
    email?: string; // Optional field
}

/**
 * GET /api/reports
 * Fetches all reports from the Firestore collection for an authenticated user.
 */
export const GET = auth(async function GET(req) {
    if (req.auth) {
        try {
            const reportsRef = db.collection('reports');
            const snapshot = await reportsRef.get();

            if (snapshot.empty) {
                return NextResponse.json([], { status: 200 });
            }

            const reports: Report[] = [];
            snapshot.forEach(doc => {
                // Use a type assertion after getting the data
                const data = doc.data() as Omit<Report, 'id'>;
                reports.push({
                    id: doc.id,
                    ...data,
                });
            });

            // The data is automatically serialized to JSON, including the timestamp.
            return NextResponse.json(reports, { status: 200 });

        } catch (error) {
            console.error("Error fetching reports:", error);
            return NextResponse.json(
                { error: "Internal Server Error" }, 
                { status: 500 }
            );
        }
    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
});

