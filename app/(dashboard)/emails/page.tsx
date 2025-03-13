"use client"

import { useState } from "react"
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

// Sample emails
const emails = [
  {
    id: "email_1",
    subject: "Introduction to our services",
    sentAt: "2023-04-10T09:30:00Z",
    fromAccount: {
      name: "Sales Team",
      email: "sales@company.com",
    },
    toAccount: {
      name: "John Smith",
      email: "john.smith@example.com",
    },
    leadName: "John Smith",
    analyzed: true,
    hasAttachments: false,
  },
  {
    id: "email_2",
    subject: "Re: Introduction to our services",
    sentAt: "2023-04-12T14:45:00Z",
    fromAccount: {
      name: "John Smith",
      email: "john.smith@example.com",
    },
    toAccount: {
      name: "Sales Team",
      email: "sales@company.com",
    },
    leadName: "John Smith",
    analyzed: true,
    hasAttachments: false,
  },
  {
    id: "email_3",
    subject: "Enterprise plan details",
    sentAt: "2023-04-15T10:30:00Z",
    fromAccount: {
      name: "Sales Team",
      email: "sales@company.com",
    },
    toAccount: {
      name: "John Smith",
      email: "john.smith@example.com",
    },
    leadName: "John Smith",
    analyzed: true,
    hasAttachments: true,
  },
  {
    id: "email_4",
    subject: "Product demo request",
    sentAt: "2023-04-18T11:15:00Z",
    fromAccount: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
    },
    toAccount: {
      name: "Sales Team",
      email: "sales@company.com",
    },
    leadName: "Sarah Johnson",
    analyzed: false,
    hasAttachments: false,
  },
  {
    id: "email_5",
    subject: "Follow-up on our conversation",
    sentAt: "2023-04-20T15:30:00Z",
    fromAccount: {
      name: "Sales Team",
      email: "sales@company.com",
    },
    toAccount: {
      name: "Michael Brown",
      email: "michael.b@example.com",
    },
    leadName: "Michael Brown",
    analyzed: false,
    hasAttachments: true,
  },
]

export default function EmailsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
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
            <DropdownMenuCheckboxItem checked>Show all emails</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Only sent emails</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Only received emails</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>With attachments</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Select defaultValue="newest">
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
            {emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell className="font-medium">
                  <Link href={`/emails/${email.id}`} className="hover:underline flex items-center">
                    {email.subject}
                    {email.hasAttachments && <span className="ml-2 text-muted-foreground">📎</span>}
                  </Link>
                </TableCell>
                <TableCell>{email.fromAccount.name}</TableCell>
                <TableCell>{email.toAccount.name}</TableCell>
                <TableCell>
                  <Link href={`/leads/${email.leadName.toLowerCase().replace(" ", "-")}`} className="hover:underline">
                    {email.leadName}
                  </Link>
                </TableCell>
                <TableCell>{new Date(email.sentAt).toLocaleDateString()}</TableCell>
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
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Reply</DropdownMenuItem>
                      <DropdownMenuItem>Forward</DropdownMenuItem>
                      <DropdownMenuItem>Analyze</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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

