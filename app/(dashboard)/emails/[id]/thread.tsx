"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronUp, 
  Forward, 
  Reply, 
  Paperclip, 
  FileText, 
  CornerDownRight,
  MessageSquare,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getEmailThread } from "../action"

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
  htmlBody?: string | null
  sentAt?: Date | null
  receivedAt?: Date | null
  analyzed: boolean
  messageId?: string | null
  threadId?: string | null
  parentMessageId?: string | null
  fromAccount?: {
    id: string
    name: string | null
    email: string
  } | null
  toAccount?: {
    id: string
    name: string | null
    email: string
  } | null
  lead?: {
    id: string
    name?: string | null
    email: string
  } | null
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
}

interface EmailThreadProps {
  initialEmailId: string
  threadId: string
}

export default function EmailThread({ initialEmailId, threadId }: EmailThreadProps) {
  const router = useRouter()
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedEmails, setExpandedEmails] = useState<Record<string, boolean>>({})

  // Fetch thread emails
  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true)
        const threadEmails = await getEmailThread(threadId)
        setEmails(threadEmails as Email[])
        
        // Auto-expand the current email
        const expanded: Record<string, boolean> = {}
        threadEmails.forEach(email => {
          expanded[email.id] = email.id === initialEmailId
        })
        setExpandedEmails(expanded)
      } catch (error) {
        console.error("Error fetching email thread:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchThread()
  }, [initialEmailId, threadId])

  const toggleEmailExpand = (emailId: string) => {
    setExpandedEmails(prev => ({
      ...prev,
      [emailId]: !prev[emailId]
    }))
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  // Get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  // Determine if email is from the user's account
  const isSentByUser = (email: Email): boolean => {
    return email.fromAccount !== null && email.fromAccount !== undefined
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No emails found</h3>
        <p className="text-muted-foreground">This thread may have been deleted or you don't have access.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {emails.map((email, index) => (
        <Card key={email.id} className={`overflow-hidden transition-all ${email.id === initialEmailId ? 'border-primary shadow-md' : ''}`}>
          <div 
            className="flex items-start p-4 cursor-pointer"
            onClick={() => toggleEmailExpand(email.id)}
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10 mr-4 mt-1">
              <AvatarImage src={`https://avatar.vercel.sh/${email.fromAccount?.email || email.lead?.email || 'user'}`} />
              <AvatarFallback>
                {getInitials(email.fromAccount?.name || email.lead?.name || email.fromAccount?.email?.split('@')[0] || '?')}
              </AvatarFallback>
            </Avatar>
            
            {/* Email header */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <div className="font-medium truncate">
                  {email.fromAccount?.name || email.lead?.name || email.fromAccount?.email?.split('@')[0] || 'Unknown'}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {email.sentAt ? formatDistanceToNow(new Date(email.sentAt), { addSuffix: true }) : 'Date unknown'}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground truncate">
                To: {email.toAccount?.email || 'Unknown recipient'}
              </div>
              
              {/* Show parent reference if it's a reply in collapsed view */}
              {!expandedEmails[email.id] && email.parentMessageId && (
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <CornerDownRight className="h-3 w-3 mr-1" />
                  <span>Reply to previous message</span>
                </div>
              )}
              
              {/* Preview or collapsed indicator */}
              {!expandedEmails[email.id] && (
                <div className="mt-2 text-sm line-clamp-2">
                  {email.body.slice(0, 150)}
                  {email.body.length > 150 && '...'}
                </div>
              )}
              
              {/* Attachment indicator in collapsed view */}
              {!expandedEmails[email.id] && email.attachments.length > 0 && (
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3 mr-1" />
                  <span>{email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            
            {/* Expand/Collapse button */}
            <Button variant="ghost" size="icon" className="ml-2">
              {expandedEmails[email.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Expanded email content */}
          {expandedEmails[email.id] && (
            <>
              <Separator />
              
              {/* Email body */}
              <div className="p-4">
                {email.htmlBody ? (
                  <div dangerouslySetInnerHTML={{ __html: email.htmlBody }} />
                ) : (
                  <div className="whitespace-pre-wrap">{email.body}</div>
                )}
              </div>
              
              {/* Attachments */}
              {email.attachments.length > 0 && (
                <>
                  <Separator />
                  <div className="p-4">
                    <h4 className="text-sm font-medium mb-2">Attachments</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {email.attachments.map(attachment => (
                        <div 
                          key={attachment.id}
                          className="flex items-center p-2 border rounded-md hover:bg-muted/50"
                        >
                          <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{attachment.filename}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.size)}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={attachment.url} target="_blank" rel="noopener noreferrer">
                              <Paperclip className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Actions */}
              <Separator />
              <div className="p-4 flex justify-between items-center">
                <div>
                  {email.lead && (
                    <Badge variant="outline" className="mr-2">
                      Lead: {email.lead.name || email.lead.email}
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/emails/compose?replyTo=${email.id}`}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/emails/compose?forward=${email.id}`}>
                      <Forward className="h-4 w-4 mr-2" />
                      Forward
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      ))}
      
      {/* Compose reply button for the entire thread */}
      <div className="flex justify-center mt-6">
        <Button asChild>
          <Link href={`/emails/compose?replyTo=${emails[emails.length - 1]?.id}`}>
            <Reply className="h-4 w-4 mr-2" />
            Reply to Thread
          </Link>
        </Button>
      </div>
    </div>
  )
} 