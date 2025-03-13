"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Plus, Search, MoreHorizontal, Filter, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample appointments
const appointments = [
  {
    id: "appointment_1",
    title: "Initial Discovery Call",
    description: "Discuss requirements and pain points",
    startTime: "2023-04-20T15:00:00Z",
    endTime: "2023-04-20T15:30:00Z",
    leadName: "John Smith",
    leadId: "lead_1",
    location: "Zoom Meeting",
    status: "SCHEDULED",
  },
  {
    id: "appointment_2",
    title: "Product Demo",
    description: "Showcase product features",
    startTime: "2023-04-25T14:00:00Z",
    endTime: "2023-04-25T15:00:00Z",
    leadName: "John Smith",
    leadId: "lead_1",
    location: "Google Meet",
    status: "CONFIRMED",
  },
  {
    id: "appointment_3",
    title: "Follow-up Discussion",
    description: "Address questions after demo",
    startTime: "2023-04-15T11:00:00Z",
    endTime: "2023-04-15T11:30:00Z",
    leadName: "Sarah Johnson",
    leadId: "lead_2",
    location: "Phone Call",
    status: "COMPLETED",
  },
  {
    id: "appointment_4",
    title: "Contract Review",
    description: "Go through contract details",
    startTime: "2023-04-28T10:00:00Z",
    endTime: "2023-04-28T11:00:00Z",
    leadName: "Michael Brown",
    leadId: "lead_3",
    location: "Office Meeting",
    status: "SCHEDULED",
  },
  {
    id: "appointment_5",
    title: "Onboarding Session",
    description: "Initial onboarding and setup",
    startTime: "2023-04-18T13:00:00Z",
    endTime: "2023-04-18T14:30:00Z",
    leadName: "Emily Davis",
    leadId: "lead_4",
    location: "Zoom Meeting",
    status: "CANCELLED",
  },
]

// Status badge mapping
const getStatusBadge = (status: string) => {
  const statusMap: Record<
    string,
    { label: string; variant: "default" | "outline" | "secondary" | "destructive" | undefined }
  > = {
    SCHEDULED: { label: "Scheduled", variant: "secondary" },
    CONFIRMED: { label: "Confirmed", variant: "default" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
    COMPLETED: { label: "Completed", variant: "outline" },
    RESCHEDULED: { label: "Rescheduled", variant: "secondary" },
  }

  const status_info = statusMap[status] || { label: status, variant: "outline" }
  return <Badge variant={status_info.variant}>{status_info.label}</Badge>
}

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <Button asChild>
          <Link href="/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuCheckboxItem checked>Show all appointments</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Only upcoming</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Only completed</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Select defaultValue="upcoming">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming first</SelectItem>
            <SelectItem value="past">Past first</SelectItem>
            <SelectItem value="lead">Lead name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">
                  <Link href={`/appointments/${appointment.id}`} className="hover:underline">
                    {appointment.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">{appointment.description}</p>
                </TableCell>
                <TableCell>
                  <Link href={`/leads/${appointment.leadId}`} className="hover:underline">
                    {appointment.leadName}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div>{new Date(appointment.startTime).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {new Date(appointment.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{appointment.location}</TableCell>
                <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

