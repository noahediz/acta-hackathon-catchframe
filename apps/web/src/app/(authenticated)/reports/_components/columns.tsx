"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis } from "lucide-react"
import { Report } from "@/types/report"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"


export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "timestamp",
    header: "Time",
    cell: ({ row }) => {
      const timestamp = row.original.timestamp
      console.log("timestamp", timestamp)
      const date = new Date(timestamp._seconds * 1000).toLocaleString()
      console.log("date", date)
      return date
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      const statusConfig = {
        pending: { label: "Pending", className: "bg-blue-500 hover:bg-blue-600" },
        processing: { label: "Processing", className: "bg-yellow-500 hover:bg-yellow-600" },
        completed: { label: "Completed", className: "bg-green-500 hover:bg-green-600" },
        fixed: { label: "Fixed", className: "bg-green-500 hover:bg-green-600" },
      }

      const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "" }

      return (
        <Badge className={config.className}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="max-w-[300px] truncate">
          {description}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string | undefined
      return <div>{email || "Not provided"}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const report = row.original

      const handleStatusChange = async (newStatus: "pending" | "processing" | "completed" | "fixed") => {
        try {
          const response = await fetch(`/api/reports/${report.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
          })

          if (!response.ok) {
            throw new Error('Failed to update status')
          }

          window.location.reload()
        } catch (error) {
          console.error('Error updating status:', error)
        }
      }

      const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this report?')) {
          return
        }

        try {
          const response = await fetch(`/api/reports/${report.id}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            throw new Error('Failed to delete report')
          }

          window.location.reload()
        } catch (error) {
          console.error('Error deleting report:', error)
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                redirect(`/reports/${report.id}`)
              }}
            >
              Open details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('processing')}>
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('fixed')}>
                  Fixed
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              Delete report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
