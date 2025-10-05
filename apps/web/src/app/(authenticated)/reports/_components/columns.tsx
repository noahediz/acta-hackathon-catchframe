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

interface ColumnOptions {
  onStatusChange: (id: string, newStatus: Report["status"]) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function getColumns({ onStatusChange, onDelete }: ColumnOptions): ColumnDef<Report>[] {

  return [
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ row }) => {
        const timestamp = row.original.timestamp
        const seconds =
          "seconds" in timestamp ? timestamp.seconds : timestamp._seconds
        const date = new Date(seconds * 1000).toLocaleString()
        return <div className="font-medium w-12">{date}</div>
      },
      // Add this sorting function
      sortingFn: (rowA, rowB) => {
        const tsA = rowA.original.timestamp
        const tsB = rowB.original.timestamp
        const secondsA = "seconds" in tsA ? tsA.seconds : tsA._seconds
        const secondsB = "seconds" in tsB ? tsB.seconds : tsB._seconds
        
        // Compare the numerical seconds for accurate sorting
        return secondsA - secondsB
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const statusConfig = {
          pending: { label: "Pending", className: "bg-neutral-500/20 dark:bg-neutral-800/40 text-neutral-600" },
          new: { label: "New", className: "bg-blue-200 dark:bg-blue-800/40 text-blue-600" },
          processing: { label: "Processing", className: "bg-yellow-300/40 dark:bg-yellow-800/40 text-yellow-600" },
          completed: { label: "Completed", className: "bg-green-500/20 dark:bg-green-800/40 text-green-600" }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "" }
        return <div ><Badge className={config.className}>{config.label}</Badge></div>
      },
    },    
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate">
          {row.getValue("description") as string}
        </div>
      ),
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

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-8">
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => redirect(`/reports/${report.id}`)}>
                Open details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {["pending", "new", "processing", "completed"].map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onStatusChange(report.id, status as Report["status"])}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(report.id)}
                className="text-red-600"
              >
                Delete report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
