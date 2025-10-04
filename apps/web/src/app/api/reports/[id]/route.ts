import { auth } from '@/auth';
import { db } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';


 
export const GET = auth(function GET(req) {
  if (req.auth) return NextResponse.json(req.auth)
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})

export const PATCH = auth(async function PATCH(
    req,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!req.auth) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const id = (await params).id;

    try {
        
        const { status } = await req.json();
        console.log("id", id)
        console.log("status", status)
        if (!id || !status) {
            return NextResponse.json({ error: "Report ID and status are required" }, { status: 400 });
        }
        
        // Ensure status is one of the allowed values
        const allowedStatus = ["new", "processing", "completed", "pending"];
        if (!allowedStatus.includes(status)) {
            return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
        }

        const reportRef = db.collection('reports').doc(id);
        
        await reportRef.update({ status });

        return NextResponse.json({ message: `Report ${id} status updated to ${status}`}, { status: 200 });

    } catch (error) {
        console.error(`Error updating report ${id}:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});


/**
 * DELETE /api/reports/[id]
 * Deletes a specific report.
 */
export const DELETE = auth(async function DELETE(
    req,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!req.auth) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const id = (await params).id;

    try {
        
        if (!id) {
            return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
        }

        await db.collection('reports').doc(id).delete();

        return NextResponse.json({ message: `Report ${id} deleted successfully` }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting report ${id}:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
