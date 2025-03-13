"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Trash2, Tag, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

// Sample lead data for demonstration
const sampleLeadData = {
  id: "lead_123",
  name: "John Smith",
  email: "john.smith@example.com",
  phone: "+1 (555) 123-4567",
  company: "Acme Inc",
  status: "QUALIFIED",
  score: 85,
  source: "Website Contact Form",
  notes: "John is interested in our enterprise plan. He needs a solution for his team of 50+ people.",
  tags: ["enterprise", "saas"],
  lastContactedAt: "2023-04-15T10:30:00Z",
  createdAt: "2023-03-10T08:15:00Z",
  updatedAt: "2023-04-15T10:30:00Z",
  customFields: {
    industry: "Technology",
    size: "50-100 employees",
    budget: "$10,000-$50,000",
    timeline: "3-6 months",
  },
}

type LeadFormData = {
  email: string
  name: string
  phone: string
  company: string
  source: string
  status: string
  notes: string
  tags: string[]
  customFields: Record<string, string>
}

export function EditLeadDialog({
  lead = sampleLeadData,
  onLeadUpdated,
}: {
  lead?: any
  onLeadUpdated: (lead: any) => void
}) {
  const [formData, setFormData] = useState<LeadFormData>({
    email: lead.email || "",
    name: lead.name || "",
    phone: lead.phone || "",
    company: lead.company || "",
    source: lead.source || "",
    status: lead.status || "NEW",
    notes: lead.notes || "",
    tags: lead.tags || [],
    customFields: lead.customFields || {},
  })
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newCustomFieldKey, setNewCustomFieldKey] = useState("")
  const [newCustomFieldValue, setNewCustomFieldValue] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (lead) {
      setFormData({
        email: lead.email || "",
        name: lead.name || "",
        phone: lead.phone || "",
        company: lead.company || "",
        source: lead.source || "",
        status: lead.status || "NEW",
        notes: lead.notes || "",
        tags: lead.tags || [],
        customFields: lead.customFields || {},
      })
    }
  }, [lead])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleAddCustomField = () => {
    if (newCustomFieldKey.trim() && newCustomFieldValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [newCustomFieldKey.trim()]: newCustomFieldValue.trim(),
        },
      }))
      setNewCustomFieldKey("")
      setNewCustomFieldValue("")
    }
  }

  const handleRemoveCustomField = (key: string) => {
    setFormData((prev) => {
      const updatedCustomFields = { ...prev.customFields }
      delete updatedCustomFields[key]
      return {
        ...prev,
        customFields: updatedCustomFields,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedLead = {
        ...lead,
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      onLeadUpdated(updatedLead)

      toast({
        title: "Lead updated",
        description: `${formData.name || formData.email} has been updated successfully.`,
      })

      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Lead: {lead.name || lead.email}</DialogTitle>
              <DialogDescription>
                Update the lead's information below. Changes will be saved when you click Save Changes.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="tags">Tags & Categories</TabsTrigger>
                <TabsTrigger value="custom">Custom Fields</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Acme Inc"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      name="source"
                      placeholder="Website, Referral, etc."
                      value={formData.source}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                        <SelectItem value="QUALIFIED">Qualified</SelectItem>
                        <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                        <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                        <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                        <SelectItem value="NURTURING">Nurturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any additional information about this lead..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Lead Information</Label>
                    <Badge variant="outline" className="font-normal">
                      Score: {lead.score}
                    </Badge>
                  </div>
                  <div className="rounded-md border p-4 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Created:</span>{" "}
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Updated:</span>{" "}
                        {new Date(lead.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Contacted:</span>{" "}
                      {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : "Never"}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tags" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tags added yet.</p>
                    ) : (
                      formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          <span>{tag}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Remove tag</span>
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add tag</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Suggested Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {["important", "follow-up", "decision-maker", "hot-lead", "cold-lead"].map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => {
                          if (!formData.tags.includes(tag)) {
                            setFormData((prev) => ({
                              ...prev,
                              tags: [...prev.tags, tag],
                            }))
                          }
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Custom Fields</Label>
                  {Object.keys(formData.customFields).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No custom fields added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(formData.customFields).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <Input value={key} disabled className="bg-muted" />
                            <Input
                              value={value}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customFields: {
                                    ...prev.customFields,
                                    [key]: e.target.value,
                                  },
                                }))
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCustomField(key)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Remove field</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <Label className="mb-2 block">Add New Custom Field</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Field name"
                        value={newCustomFieldKey}
                        onChange={(e) => setNewCustomFieldKey(e.target.value)}
                      />
                      <Input
                        placeholder="Field value"
                        value={newCustomFieldValue}
                        onChange={(e) => setNewCustomFieldValue(e.target.value)}
                      />
                      <Button type="button" size="sm" onClick={handleAddCustomField}>
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add field</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Suggested Custom Fields</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "industry", label: "Industry" },
                      { key: "company_size", label: "Company Size" },
                      { key: "budget", label: "Budget" },
                      { key: "timeline", label: "Timeline" },
                      { key: "decision_maker", label: "Decision Maker" },
                      { key: "linkedin", label: "LinkedIn Profile" },
                    ].map((field) => (
                      <Button
                        key={field.key}
                        type="button"
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          if (!Object.keys(formData.customFields).includes(field.key)) {
                            setNewCustomFieldKey(field.key)
                            setNewCustomFieldValue("")
                          }
                        }}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        {field.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="relative">
                {isLoading ? (
                  <>
                    <span className="opacity-0">Save Changes</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

