"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Network, Users, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { prisma } from "@/lib/prisma"

// Define Workflow type
type Workflow = {
  id: string
  name: string
  description?: string
  isActive: boolean
  nodes: any[]
  edges: any[]
  createdAt: string
  updatedAt: string
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  // Fetch workflows
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch('/api/workflows')
        if (!response.ok) throw new Error('Failed to fetch workflows')
        const data = await response.json()
        setWorkflows(data)
      } catch (error) {
        console.error('Error fetching workflows:', error)
        toast({
          title: "Error",
          description: "Failed to load workflows. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchWorkflows()
  }, [toast])

  const handleToggleActive = async (id: string) => {
    try {
      const workflow = workflows.find(w => w.id === id)
      if (!workflow) return

      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !workflow.isActive }),
      })

      if (!response.ok) throw new Error('Failed to update workflow')
      
      // Update local state
      setWorkflows(prev => 
        prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w)
      )

      toast({
        title: "Workflow updated",
        description: "The workflow status has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating workflow:', error)
      toast({
        title: "Error",
        description: "Failed to update workflow. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this workflow? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/workflows/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Failed to delete workflow')
        
        // Update local state
        setWorkflows(prev => prev.filter(w => w.id !== id))

        toast({
          title: "Workflow deleted",
          description: "The workflow has been deleted successfully.",
        })
      } catch (error) {
        console.error('Error deleting workflow:', error)
        toast({
          title: "Error",
          description: "Failed to delete workflow. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const filteredWorkflows = workflows.filter((workflow) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return workflow.name.toLowerCase().includes(query) || workflow.description?.toLowerCase().includes(query) || false
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
        <Button asChild>
          <Link href="/workflows/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkflows.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No workflows found.</p>
            <Button asChild>
              <Link href="/workflows/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workflow
              </Link>
            </Button>
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={workflow.isActive ? "default" : "outline"}>
                    {workflow.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/workflows/${workflow.id}`)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(workflow.id)}>
                        {workflow.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(workflow.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-xl">
                  <Link href={`/workflows/${workflow.id}`} className="hover:underline">
                    {workflow.name}
                  </Link>
                </CardTitle>
                <CardDescription>{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <span>{workflow.nodes.length} nodes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>0 leads</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                  <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/workflows/${workflow.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

