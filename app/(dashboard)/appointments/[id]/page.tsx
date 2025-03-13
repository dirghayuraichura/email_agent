"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar, Clock, MapPin, User, Mail, Phone, Save, Trash2, Copy } from "lucide-react"

// Sample appointment data
const sampleAppointment = {
  id: "appointment_2",
  title: "Product Demo",
  description: "Showcase product features and discuss implementation options",
  startTime: "2023-04-25T14:00:00Z",
  endTime: "2023-04-25T15:00:00Z",
  leadId: "lead_1",
  leadName: "John Smith",
  leadEmail: "john.smith@example.com",
  leadPhone: "+1 (555) 123-4567",
  location: "Google Meet",
  meetingLink: "https://meet.google.com/abc-defg-hij",
  status: "CONFIRMED",
  notes:
    "John is particularly interested in the workflow automation features. Make sure to highlight the AI capabilities and integration options.",
  agenda: [
    "Introduction (5 min)",
    "Overview of key features (15 min)",
    "Workflow automation demo (20 min)",
    "Integration options (10 min)",
    "Q&A and next steps (10 min)",
  ],
  attendees: [
    {
      name: "John Smith",
      email: "john.smith@example.com",
      role: "Lead",
    },
    {
      name: "Sales Team",
      email: "sales@company.com",
      role: "Host",
    },
    {
      name: "Product Specialist",
      email: "product@company.com",
      role: "Presenter",
    },
  ],
}

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [appointment, setAppointment] = useState(sampleAppointment)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsEditing(false)
    toast({
      title: "Appointment updated",
      description: "The appointment has been updated successfully.",
    })
  }

  const handleDelete = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Appointment deleted",
      description: "The appointment has been deleted successfully.",
    })
  }

  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText(appointment.meetingLink)
    toast({
      title: "Meeting link copied",
      description: "The meeting link has been copied to your clipboard.",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/appointments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Appointment" : "Appointment Details"}
          </h1>
          <Badge
            variant={
              appointment.status === "CONFIRMED"
                ? "default"
                : appointment.status === "CANCELLED"
                  ? "destructive"
                  : appointment.status === "COMPLETED"
                    ? "outline"
                    : "secondary"
            }
          >
            {appointment.status}
          </Badge>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                {isLoading ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={appointment.title}
                      onChange={(e) => setAppointment({ ...appointment, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={appointment.description}
                      onChange={(e) => setAppointment({ ...appointment, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={new Date(appointment.startTime).toISOString().split("T")[0]}
                        onChange={(e) => {
                          const date = e.target.value
                          const startTime = new Date(appointment.startTime)
                          const newStartTime = new Date(date)
                          newStartTime.setHours(startTime.getHours(), startTime.getMinutes())

                          const endTime = new Date(appointment.endTime)
                          const newEndTime = new Date(date)
                          newEndTime.setHours(endTime.getHours(), endTime.getMinutes())

                          setAppointment({
                            ...appointment,
                            startTime: newStartTime.toISOString(),
                            endTime: newEndTime.toISOString(),
                          })
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={appointment.status}
                        onChange={(e) => setAppointment({ ...appointment, status: e.target.value })}
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="RESCHEDULED">Rescheduled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Time</label>
                      <Input
                        type="time"
                        value={new Date(appointment.startTime).toTimeString().slice(0, 5)}
                        onChange={(e) => {
                          const time = e.target.value
                          const [hours, minutes] = time.split(":").map(Number)
                          const newStartTime = new Date(appointment.startTime)
                          newStartTime.setHours(hours, minutes)
                          setAppointment({ ...appointment, startTime: newStartTime.toISOString() })
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Time</label>
                      <Input
                        type="time"
                        value={new Date(appointment.endTime).toTimeString().slice(0, 5)}
                        onChange={(e) => {
                          const time = e.target.value
                          const [hours, minutes] = time.split(":").map(Number)
                          const newEndTime = new Date(appointment.endTime)
                          newEndTime.setHours(hours, minutes)
                          setAppointment({ ...appointment, endTime: newEndTime.toISOString() })
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={appointment.location}
                      onChange={(e) => setAppointment({ ...appointment, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meeting Link</label>
                    <Input
                      value={appointment.meetingLink}
                      onChange={(e) => setAppointment({ ...appointment, meetingLink: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">{appointment.title}</h2>
                    <p className="text-muted-foreground mt-1">{appointment.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{formatDate(appointment.startTime)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{appointment.location}</p>
                        {appointment.meetingLink && (
                          <div className="flex items-center gap-1 mt-1">
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Join Meeting
                            </a>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCopyMeetingLink}>
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Copy link</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Agenda</h3>
                    <ul className="space-y-1 list-disc pl-5">
                      {appointment.agenda.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Notes</h3>
                    <p className="text-muted-foreground">{appointment.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendees</CardTitle>
              <CardDescription>People invited to this appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointment.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-muted-foreground">{attendee.email}</p>
                        <Badge variant="outline" className="mt-1">
                          {attendee.role}
                        </Badge>
                      </div>
                    </div>

                    {isEditing && index > 0 && (
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {isEditing && (
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      Add Attendee
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Link href={`/leads/${appointment.leadId}`} className="font-medium hover:underline">
                    {appointment.leadName}
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3" />
                    <span>{appointment.leadEmail}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" />
                    <span>{appointment.leadPhone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/leads/${appointment.leadId}`}>View Lead Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/emails/compose?to=${appointment.leadEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Reschedule
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Send Reminder
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

