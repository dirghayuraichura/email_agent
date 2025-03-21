"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Search, MoreHorizontal, Filter, Mail, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { getEmails } from "./action"

// Define the email type
interface Email {
  id: string
  subject: string
  body: string
  htmlBody?: string | null
  sentAt?: Date | null
  receivedAt?: Date | null
  analyzed: boolean
  fromAccount?: {
    id: string
    name: string
    email: string
  } | null
  toAccount?: {
    id: string
    name: string
    email: string
  } | null
  lead?: {
    id: string
    name?: string | null
    email: string
  } | null
  attachments: Array<{
    id: string
    filename: string
    contentType: string
    size: number
    url: string
  }>
  createdAt: Date
  updatedAt: Date
}

export default function EmailsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [emails, setEmails] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'subject'>('newest')

  // Fetch emails
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const fetchedEmails = await getEmails({ filter })
        setEmails(fetchedEmails)
      } catch (error) {
        console.error("Error fetching emails:", error)
        toast({
          title: "Error",
          description: "Failed to load emails. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEmails()
  }, [toast, filter])

  // Filter emails by search query
  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (email.fromAccount?.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (email.toAccount?.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (email.lead?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Sort emails
  const sortedEmails = [...filteredEmails].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime()
    } else if (sortBy === 'oldest') {
      return new Date(a.sentAt || a.createdAt).getTime() - new Date(b.sentAt || b.createdAt).getTime()
    } else if (sortBy === 'subject') {
      return a.subject.localeCompare(b.subject)
    }
    return 0
  })

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const fetchedEmails = await getEmails({ filter })
      setEmails(fetchedEmails)
      toast({
        title: "Emails refreshed",
        description: "Your emails have been refreshed.",
      })
    } catch (error) {
      console.error("Error refreshing emails:", error)
      toast({
        title: "Error",
        description: "Failed to refresh emails. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button asChild>
            <Link href="/emails/compose">
              <Mail className="mr-2 h-4 w-4" />
              Compose
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
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
            <DropdownMenuCheckboxItem 
              checked={filter === 'all'} 
              onCheckedChange={() => setFilter('all')}
            >
              Show all emails
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={filter === 'sent'} 
              onCheckedChange={() => setFilter('sent')}
            >
              Only sent emails
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={filter === 'received'} 
              onCheckedChange={() => setFilter('received')}
            >
              Only received emails
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="subject">Subject (A-Z)</SelectItem>
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
              <TableHead>Subject</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Loading emails...</p>
                </TableCell>
              </TableRow>
            ) : sortedEmails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No emails found</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/emails/compose">Compose a new email</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              sortedEmails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium">
                    <Link href={`/emails/${email.id}`} className="hover:underline flex items-center">
                      {email.subject}
                      {email.attachments.length > 0 && <span className="ml-2 text-muted-foreground">📎</span>}
                    </Link>
                  </TableCell>
                  <TableCell>{email.fromAccount?.name || email.fromAccount?.email || "Unknown"}</TableCell>
                  <TableCell>{email.toAccount?.name || email.toAccount?.email || "Unknown"}</TableCell>
                  <TableCell>
                    {email.lead ? (
                      <Link href={`/leads/${email.lead.id}`} className="hover:underline">
                        {email.lead.name || email.lead.email}
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {email.sentAt 
                      ? new Date(email.sentAt).toLocaleDateString() 
                      : email.receivedAt 
                        ? new Date(email.receivedAt).toLocaleDateString()
                        : new Date(email.createdAt).toLocaleDateString()
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={email.analyzed ? "outline" : "secondary"}>
                      {email.analyzed ? "Analyzed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/emails/${email.id}`}>View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/emails/compose?replyTo=${email.id}`}>Reply</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/emails/compose?forward=${email.id}`}>Forward</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Analyze</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

