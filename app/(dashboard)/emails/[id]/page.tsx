"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Forward, Reply, Trash2, FileText, Paperclip, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getEmail, analyzeEmailWithAI } from "../action"
import EmailThread from "./thread"

interface Attachment {
  id: string
  filename: string
  contentType: string
  size: number
  url: string
}

interface Email {
  id: string
  subject: string
  body: string
  htmlBody: string | null
  sentAt: Date | null
  receivedAt: Date | null
  analyzed: boolean
  fromAccount: {
    id: string
    name: string
    email: string
  } | null
  toAccount: {
    id: string
    name: string
    email: string
  } | null
  lead: {
    id: string
    name: string | null
    email: string
  } | null
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
  analysis?: {
    sentiment: string
    summary: string
    keyPoints: string[]
    actionItems: string[]
  }
  threadId?: string
}

export default function EmailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const emailId = params.id as string
        const fetchedEmail = await getEmail(emailId)
        setEmail(fetchedEmail as Email)
      } catch (err: any) {
        setError(err.message || "Failed to load email")
      } finally {
        setLoading(false)
      }
    }

    fetchEmail()
  }, [params.id, toast])

  const handleAnalyzeEmail = async () => {
    if (!email) return
    
    setAnalyzing(true)
    try {
      await analyzeEmailWithAI(email.id)
      
      // Refetch the email to get the analysis
      const updatedEmail = await getEmail(email.id)
      setEmail(updatedEmail as Email)
      
      toast({
        title: "Analysis complete",
        description: "The email has been analyzed successfully.",
      })
      
      // Switch to the analysis tab
      setActiveTab("analysis")
    } catch (error) {
      console.error("Error analyzing email:", error)
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Unknown date"
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading email...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">{error}</h2>
        <Button asChild className="mt-4">
          <Link href="/emails">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Emails
          </Link>
        </Button>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Email Not Found</h2>
        <p className="mt-2 text-muted-foreground">The email you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button asChild className="mt-4">
          <Link href="/emails">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Emails
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{email.subject}</h1>
      
      {/* Show email as part of a thread if threadId exists */}
      {email.threadId ? (
        <EmailThread initialEmailId={email.id} threadId={email.threadId} />
      ) : (
        /* Show single email if not part of a thread */
        <EmailThread initialEmailId={email.id} threadId={email.id} />
      )}
    </div>
  )
}

