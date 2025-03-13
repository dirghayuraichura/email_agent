"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Reply, Forward, Trash2, Archive, Star, StarOff, Calendar, Bot, Download } from "lucide-react"

// Sample email data
const sampleEmail = {
  id: "email_3",
  subject: "Enterprise plan details",
  body: `Hi John,

Thank you for your interest in our enterprise plan. As discussed, here are the key features and pricing details:

## Enterprise Plan Features

- Unlimited email campaigns
- Advanced AI personalization
- Custom workflow builder
- Dedicated account manager
- Priority support
- Team collaboration tools
- Advanced analytics and reporting
- Custom integrations

## Pricing

The enterprise plan starts at $499/month with annual billing, or $599/month with monthly billing.

For your team size of 50+ users, we can offer a 15% discount on the annual plan.

## Next Steps

I've attached a detailed brochure with more information. Would you be available for a follow-up call this Thursday at 2 PM to discuss any questions you might have?

Looking forward to our call!

Best regards,
Sales Team`,
  sentAt: "2023-04-15T10:30:00Z",
  fromAccount: {
    name: "Sales Team",
    email: "sales@company.com",
  },
  toAccount: {
    name: "John Smith",
    email: "john.smith@example.com",
  },
  ccAccounts: [
    {
      name: "Support Team",
      email: "support@company.com",
    },
  ],
  leadId: "lead_1",
  leadName: "John Smith",
  analyzed: true,
  hasAttachments: true,
  attachments: [
    {
      name: "Enterprise_Plan_Brochure.pdf",
      size: "2.4 MB",
      type: "application/pdf",
    },
    {
      name: "Pricing_Comparison.xlsx",
      size: "1.1 MB",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  ],
  aiAnalysis: {
    sentiment: "Positive",
    keyTopics: ["Pricing", "Features", "Next Steps"],
    suggestedFollowUp: "Schedule the proposed call for Thursday",
    riskFactors: [],
    opportunities: ["Upsell team collaboration add-on", "Mention annual billing discount"],
  },
  labels: ["Important", "Enterprise", "Follow-up"],
}

export default function EmailDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [email, setEmail] = useState(sampleEmail)
  const [isStarred, setIsStarred] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  const handleReply = () => {
    toast({
      title: "Reply initiated",
      description: "Opening reply composer...",
    })
  }

  const handleForward = () => {
    toast({
      title: "Forward initiated",
      description: "Opening forward composer...",
    })
  }

  const handleDelete = () => {
    toast({
      title: "Email deleted",
      description: "The email has been moved to trash.",
    })
  }

  const handleArchive = () => {
    toast({
      title: "Email archived",
      description: "The email has been archived.",
    })
  }

  const handleToggleStar = () => {
    setIsStarred(!isStarred)
    toast({
      title: isStarred ? "Removed from starred" : "Added to starred",
      description: isStarred ? "Email removed from starred items." : "Email added to starred items.",
    })
  }

  const handleScheduleFollowUp = () => {
    toast({
      title: "Follow-up scheduled",
      description: "A follow-up has been scheduled for Thursday at 2 PM.",
    })
  }

  const handleAnalyzeEmail = () => {
    toast({
      title: "Email analyzed",
      description: "AI analysis has been updated for this email.",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/emails">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">View Email</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{email.subject}</CardTitle>
                <CardDescription>
                  From: {email.fromAccount.name} &lt;{email.fromAccount.email}&gt;
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleToggleStar}>
                  {isStarred ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                </Button>
                <Badge>{formatDate(email.sentAt)}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">To:</span> {email.toAccount.name} &lt;{email.toAccount.email}
                &gt;
              </div>
              {email.ccAccounts && email.ccAccounts.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">CC:</span>{" "}
                  {email.ccAccounts.map((cc) => `${cc.name} <${cc.email}>`).join(", ")}
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground">Lead:</span>{" "}
                <Link href={`/leads/${email.leadId}`} className="hover:underline">
                  {email.leadName}
                </Link>
              </div>

              {email.labels && email.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {email.labels.map((label) => (
                    <Badge key={label} variant="outline">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="whitespace-pre-wrap">{email.body}</div>

            {email.hasAttachments && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Attachments</h3>
                  <div className="flex flex-wrap gap-2">
                    {email.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-md border">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{attachment.size}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Download className="h-3 w-3" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReply}>
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </Button>
              <Button variant="outline" size="sm" onClick={handleForward}>
                <Forward className="mr-2 h-4 w-4" />
                Forward
              </Button>
              <Button variant="outline" size="sm" onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              <Button variant="outline" size="sm" variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleScheduleFollowUp}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" size="sm" onClick={handleAnalyzeEmail}>
                <Bot className="mr-2 h-4 w-4" />
                Analyze
              </Button>
            </div>
          </CardFooter>
        </Card>

        {email.aiAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Analysis</CardTitle>
              <CardDescription>Automated insights and recommendations for this email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Sentiment</h3>
                  <Badge
                    variant={
                      email.aiAnalysis.sentiment === "Positive"
                        ? "default"
                        : email.aiAnalysis.sentiment === "Negative"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {email.aiAnalysis.sentiment}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Key Topics</h3>
                  <div className="flex flex-wrap gap-1">
                    {email.aiAnalysis.keyTopics.map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Suggested Follow-up</h3>
                <p className="text-sm">{email.aiAnalysis.suggestedFollowUp}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Risk Factors</h3>
                  {email.aiAnalysis.riskFactors.length > 0 ? (
                    <ul className="text-sm list-disc pl-4">
                      {email.aiAnalysis.riskFactors.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No risk factors detected</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Opportunities</h3>
                  {email.aiAnalysis.opportunities.length > 0 ? (
                    <ul className="text-sm list-disc pl-4">
                      {email.aiAnalysis.opportunities.map((opportunity, index) => (
                        <li key={index}>{opportunity}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No opportunities detected</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

