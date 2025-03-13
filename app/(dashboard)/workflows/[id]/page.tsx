"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { WorkflowEditorWrapper } from "@/components/workflows/workflow-editor"
import { Node, Edge } from "reactflow"

// Define Workflow type using ReactFlow's Node and Edge types
type Workflow = {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  nodes: Node[]
  edges: Edge[]
}

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (params.id === "new") {
      // Create a new workflow
      const newWorkflow: Workflow = {
        id: "new",
        name: "New Workflow",
        description: "A new workflow",
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: [
          {
            id: "node-1",
            type: "trigger",
            position: { x: 250, y: 25 },
            data: { label: "New Lead", description: "Trigger when a new lead is added" },
          },
        ],
        edges: [],
      }
      setWorkflow(newWorkflow)
      setIsLoading(false)
    } else {
      // Fetch existing workflow
      fetchWorkflow(params.id)
    }
  }, [params.id])

  const fetchWorkflow = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/workflows/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflow')
      }
      
      const data = await response.json()
      setWorkflow(data)
    } catch (error) {
      console.error('Error fetching workflow:', error)
      toast({
        title: "Error",
        description: "Failed to load workflow. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (updatedWorkflow: Partial<Workflow>) => {
    try {
      if (workflow?.id === "new") {
        // Create new workflow
        const response = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updatedWorkflow.name || workflow.name,
            description: updatedWorkflow.description || workflow.description,
            isActive: updatedWorkflow.isActive !== undefined ? updatedWorkflow.isActive : workflow.isActive,
            nodes: updatedWorkflow.nodes || workflow.nodes,
            edges: updatedWorkflow.edges || workflow.edges,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create workflow')
        }

        const newWorkflow = await response.json()
        
        toast({
          title: "Workflow created",
          description: "Your workflow has been created successfully.",
        })
        
        router.push(`/workflows/${newWorkflow.id}`)
      } else if (workflow) {
        // Update existing workflow
        const response = await fetch(`/api/workflows/${workflow.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedWorkflow),
        })

        if (!response.ok) {
          throw new Error('Failed to update workflow')
        }

        const updated = await response.json()
        setWorkflow(updated)
        
        toast({
          title: "Workflow saved",
          description: "Your workflow has been saved successfully.",
        })
      }
    } catch (error) {
      console.error('Error saving workflow:', error)
      toast({
        title: "Error",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading workflow...</p>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p>Workflow not found</p>
        <Button asChild>
          <Link href="/workflows">Back to Workflows</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/workflows">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {params.id === "new" ? "Create New Workflow" : `Edit: ${workflow.name}`}
        </h1>
      </div>

      <WorkflowEditorWrapper workflow={workflow} onSave={handleSave} />
    </div>
  )
}

