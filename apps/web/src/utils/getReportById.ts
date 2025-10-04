import { Report } from '@/app/api/reports/route';
import { db } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';

export interface ReportWithVideo extends Report {
  processedVideoUrl: string;
}

export async function getReportById(id: string): Promise<ReportWithVideo> {
  const docRef = db.collection('reports').doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    notFound();
  }

  // Get the report data from the document.
  const reportData = docSnap.data();

  return {
    id: docSnap.id,
    ...reportData,
  } as ReportWithVideo;
}

