"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Network, Users, MoreHorizontal, PlusCircle, Settings2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getWorkflows } from './actions'
import { formatDistanceToNow } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Define a more flexible Workflow type
interface Workflow {
  id: string
  name: string
  description: string | null
  isActive: boolean
  nodes: any
  edges: any
  createdAt: Date 
  updatedAt: Date
  createdById: string
  createdBy?: {
    id: string
    name: string | null
  }
  _count?: {
    states: number
  }
  [key: string]: any // Allow additional properties
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  
  useEffect(() => {
    async function fetchWorkflows() {
      try {
        setLoading(true)
        const data = await getWorkflows()
        setWorkflows(data)
      } catch (error) {
        console.error("Error fetching workflows:", error)
        toast({
          title: "Error loading workflows",
          description: "Failed to load workflows. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchWorkflows()
  }, [toast])
  
  // Compute filtered workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (workflow.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && workflow.isActive) ||
                         (filterStatus === "inactive" && !workflow.isActive);
                         
    return matchesSearch && matchesStatus;
  });
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Automate your sales process with workflows</p>
        </div>
        <Link href="/workflows/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Workflow
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="search">Search Workflows</Label>
          <Input
            id="search"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Label htmlFor="filter">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {workflows.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first workflow to automate your sales process
          </p>
          <Link href="/workflows/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{workflow.name}</CardTitle>
                    <CardDescription>
                      {workflow.description || "No description"}
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created by {workflow.createdBy?.name || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {workflow._count?.states || 0} active instances
                </p>
                <p className="text-sm text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                </p>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between">
                  <Link href={`/workflows/${workflow.id}`}>
                    <Button variant="outline" size="sm">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/workflows/${workflow.id}/runs`}>
                    <Button variant="secondary" size="sm">
                      View Runs
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

