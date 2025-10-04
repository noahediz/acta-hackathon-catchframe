"use client"

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { Report } from '@/types/report'

export default function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch reports')
        }

        const data: Report[] = await response.json()
        setReports(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unexpected error occurred.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Bug Reports</h1>
        <p className="text-muted-foreground text-sm">
          Manage and track all bug reports
        </p>
      </div>
      <DataTable columns={columns} data={reports} />
    </div>
  )
}
