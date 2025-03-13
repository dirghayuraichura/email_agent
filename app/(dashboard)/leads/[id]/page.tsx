"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, Phone, Building, Calendar, Edit, MessageSquare, Clock, Tag } from "lucide-react"
import {  getLeadById } from "../action"

// Status badge mapping
const getStatusBadge = (status: string) => {
  const statusMap: Record<
    string,
    { label: string; variant: "default" | "outline" | "secondary" | "destructive" | undefined }
  > = {
    NEW: { label: "New", variant: "secondary" },
    CONTACTED: { label: "Contacted", variant: "outline" },
    QUALIFIED: { label: "Qualified", variant: "default" },
    NEGOTIATION: { label: "Negotiation", variant: undefined },
    CLOSED_WON: { label: "Closed Won", variant: "default" },
    CLOSED_LOST: { label: "Closed Lost", variant: "destructive" },
    NURTURING: { label: "Nurturing", variant: "outline" },
  }

  const status_info = statusMap[status] || { label: status, variant: "outline" }
  return <Badge variant={status_info.variant}>{status_info.label}</Badge>
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const [lead, setLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const leadData = await getLeadById(params.id)
        setLead(leadData)
      } catch (err) {
        setError("Failed to load lead data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLead()
  }, [params.id])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error || !lead) {
    return <div className="flex justify-center items-center min-h-screen">{error || "Lead not found"}</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/leads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
        {getStatusBadge(lead.status)}
        <div className="ml-auto flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{lead.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{lead.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{lead.company}</span>
            </div>
            <Separator />
            <div>
              <h3 className="mb-2 font-medium">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {lead.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm"> </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Source:</span>
                <span>{lead.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4 pt-4">
             

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(lead.emails || []).slice(0, 2).map((email: any) => (
                    <div key={email.id} className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{email.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(email.sentAt).toLocaleDateString()} - {email.fromAccount.name}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(lead.appointments || []).slice(0, 1).map((appointment: any) => (
                    <div key={appointment.id} className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.startTime).toLocaleDateString()} at{" "}
                          {new Date(appointment.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!lead.emails || lead.emails.length === 0) && (!lead.appointments || lead.appointments.length === 0) && (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm">{lead.notes}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emails" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Email Conversations</CardTitle>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Compose
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(lead.emails || []).length > 0 ? (
                    (lead.emails || []).map((email: any) => (
                      <Card key={email.id}>
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{email.subject}</CardTitle>
                              <CardDescription>
                                {email.fromAccount.name} &lt;{email.fromAccount.email}&gt;
                              </CardDescription>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(email.sentAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm">{email.preview}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No emails found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Scheduled Appointments</CardTitle>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(lead.appointments || []).length > 0 ? (
                    (lead.appointments || []).map((appointment: any) => (
                      <Card key={appointment.id}>
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{appointment.title}</CardTitle>
                            <Badge>{appointment.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(appointment.startTime).toLocaleDateString()} at{" "}
                              {new Date(appointment.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" - "}
                              {new Date(appointment.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No appointments scheduled</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Notes & Comments</CardTitle>
                  <Button>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Sales Team</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(lead.lastContactedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{lead.notes}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

