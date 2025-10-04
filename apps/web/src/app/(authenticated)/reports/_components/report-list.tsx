"use client"

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { getColumns } from './columns'
import { Report } from '@/types/report'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

export default function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refresh, setRefresh] = useState<boolean>(false)

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reports')
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data: Report[] = await response.json()
      setReports(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [refresh])

  const handleStatusChange = async (id: string, newStatus: Report["status"]) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update status')
      // Update local state without reload
      setReports(prev =>
        prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
      )
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    try {
      const response = await fetch(`/api/reports/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete report')
      // Remove from state
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  const columns = getColumns({ onStatusChange: handleStatusChange, onDelete: handleDelete })

  return (
    <div className="space-y-4">
      <div className='flex items-end justify-between'>
        <div>
          <h1 className="text-xl font-semibold">Bug Reports</h1>
          <p className="text-muted-foreground text-sm">
            Manage and track all bug reports
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setRefresh(!refresh)}>
          <RotateCcw />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center ">
          <p className="text-muted-foreground text-sm">Loading reports...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={reports} />
      )}
    </div>
  )
}
