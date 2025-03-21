"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { WorkflowExecution } from "@/components/workflows/workflow-execution"

export default function WorkflowRunsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workflow, setWorkflow] = useState<any>(null)
  const [executions, setExecutions] = useState<any[]>([])
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch workflow
        const workflowRes = await fetch(`/api/workflows/${params.id}`)
        if (!workflowRes.ok) throw new Error("Failed to fetch workflow")
        const workflowData = await workflowRes.json()
        setWorkflow(workflowData)
        
        // Fetch executions
        const executionsRes = await fetch(`/api/workflows/${params.id}/executions`)
        if (!executionsRes.ok) throw new Error("Failed to fetch executions")
        const executionsData = await executionsRes.json()
        setExecutions(executionsData)
        
        // Select the first execution if any
        if (executionsData.length > 0) {
          setSelectedExecutionId(executionsData[0].id)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [params.id])

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "RUNNING":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "RUNNING":
        return <Play className="h-4 w-4 text-blue-500" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Workflow not found</h3>
          <p className="text-muted-foreground mb-4">The workflow you're looking for doesn't exist or you don't have access.</p>
          <Button asChild>
            <Link href="/workflows">Back to Workflows</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/workflows/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Workflow Runs: {workflow.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Execution list */}
        <div>
          <h2 className="text-lg font-medium mb-3">Execution History</h2>
          
          {executions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No executions found for this workflow.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <Card
                  key={execution.id}
                  className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedExecutionId === execution.id ? "border-primary bg-accent/50" : ""
                  }`}
                  onClick={() => setSelectedExecutionId(execution.id)}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">{getStatusIcon(execution.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <div className="font-medium truncate">
                          Lead: {execution.lead?.name || execution.lead?.email || "Unknown"}
                        </div>
                        {getStatusBadge(execution.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                      </div>
                      {execution.currentNode && (
                        <div className="text-xs mt-2">
                          Current node: <Badge variant="outline">{execution.currentNode}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right area - Execution details */}
        <div className="md:col-span-2">
          {selectedExecutionId && (
            <WorkflowExecution
              workflowId={params.id}
              leadId={executions.find(e => e.id === selectedExecutionId)?.leadId}
            />
          )}
          
          {!selectedExecutionId && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Select an execution to view details.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 