"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Search, Filter, Trash2, Mail, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AddLeadDialog } from "@/components/leads/add-lead-dialog"
import { EditLeadDialog } from "@/components/leads/edit-lead-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteLead, getLeads, createLead, updateLead, type Lead } from "./action"
import { LeadStatus } from "@prisma/client"

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

// Status options for dropdown
const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
  { value: "NURTURING", label: "Nurturing" },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Function to refresh leads data
  const refreshLeads = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedLeads = await getLeads()
      setLeads(fetchedLeads)
    } catch (error) {
      console.error("Failed to fetch leads:", error)
      toast({
        title: "Error",
        description: "Failed to load leads. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Fetch leads on component mount
  useEffect(() => {
    refreshLeads()
  }, [refreshLeads])

  const handleAddLead = async (newLead: any) => {
    try {
      await createLead({
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        company: newLead.company,
        status: newLead.status,
        source: newLead.source,
        notes: newLead.notes,
        tags: newLead.source ? [newLead.source.toLowerCase()] : [],
      })

      // Refresh leads data after adding a new lead
      await refreshLeads()

      toast({
        title: "Lead added",
        description: `${newLead.name || newLead.email} has been added successfully.`,
      })
    } catch (error) {
      console.error("Failed to add lead:", error)
      toast({
        title: "Error",
        description: "Failed to add lead. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateLead = async (id: string, leadData: any) => {
    try {
      await updateLead(id, leadData)
      
      // Refresh leads data after updating a lead
      await refreshLeads()
      
      toast({
        title: "Lead updated",
        description: `${leadData.name || leadData.email} has been updated successfully.`,
      })
    } catch (error) {
      console.error("Failed to update lead:", error)
      toast({
        title: "Error",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      // Convert string status to LeadStatus enum
      await updateLead(id, { status: status as LeadStatus })
      
      // Refresh leads data after updating status
      await refreshLeads()
      
      toast({
        title: "Status updated",
        description: "Lead status has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update lead status:", error)
      toast({
        title: "Error",
        description: "Failed to update lead status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (leadId: string) => {
    setLeadToDelete(leadId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return

    setIsDeleting(true)

    try {
      await deleteLead(leadToDelete)
      
      // Refresh leads data after deleting a lead
      await refreshLeads()

      toast({
        title: "Lead deleted",
        description: "The lead has been deleted successfully.",
      })

      setDeleteDialogOpen(false)
      setLeadToDelete(null)
    } catch (error) {
      console.error("Failed to delete lead:", error)
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.company?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <AddLeadDialog onLeadAdded={handleAddLead} />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
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
            <DropdownMenuCheckboxItem checked>Show all leads</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Only qualified leads</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Leads without contact</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Select defaultValue="newest">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link href={`/leads/${lead.id}`} className="hover:underline">
                      {lead.name || "Unnamed Lead"}
                    </Link>
                  </TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.company || "-"}</TableCell>
                  <TableCell>
                    <Select 
                      value={lead.status} 
                      onValueChange={(value) => handleStatusChange(lead.id, value)}
                    >
                      <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue>
                          {getStatusBadge(lead.status)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {getStatusBadge(option.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {lead.tags &&
                        lead.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="capitalize">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/emails/compose?to=${lead.email}`}>
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Email</span>
                        </Link>
                      </Button>
                      <EditLeadDialog
                        lead={lead}
                        onLeadUpdated={(updatedLead) => handleUpdateLead(lead.id, updatedLead)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(lead.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

