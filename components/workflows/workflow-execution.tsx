"use client"

import { useState, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Node,
  type Edge,
} from "reactflow"
import "reactflow/dist/style.css"
import { TriggerNode } from "./nodes/trigger-node"
import { EmailNode } from "./nodes/email-node"
import { DelayNode } from "./nodes/delay-node"
import { ConditionNode } from "./nodes/condition-node"
import { EndNode } from "./nodes/end-node"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Clock, Play } from "lucide-react"
import { format } from "date-fns"

interface WorkflowExecutionProps {
  workflowId: string
  leadId: string
}

// Node types definition
const nodeTypes = {
  trigger: TriggerNode,
  email: EmailNode,
  delay: DelayNode,
  condition: ConditionNode,
  end: EndNode,
}

// Custom node styles based on execution status
const getNodeStyle = (status: string) => {
  switch (status) {
    case "completed":
      return { border: "2px solid #22c55e", boxShadow: "0 0 10px rgba(34, 197, 94, 0.3)" }
    case "pending":
      return { border: "2px solid #f59e0b", boxShadow: "0 0 10px rgba(245, 158, 11, 0.3)" }
    case "failed":
      return { border: "2px solid #ef4444", boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)" }
    case "waiting":
      return { border: "2px solid #3b82f6", boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)" }
    default:
      return {}
  }
}

export function WorkflowExecution({ workflowId, leadId }: WorkflowExecutionProps) {
  const [workflow, setWorkflow] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [executionState, setExecutionState] = useState<any>(null)
  const [executionHistory, setExecutionHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch workflow and execution state
  useEffect(() => {
    const fetchWorkflowExecution = async () => {
      try {
        setLoading(true)
        
        // Fetch workflow
        const workflowRes = await fetch(`/api/workflows/${workflowId}`)
        if (!workflowRes.ok) throw new Error("Failed to fetch workflow")
        const workflowData = await workflowRes.json()
        
        // Fetch execution state
        const stateRes = await fetch(`/api/workflows/${workflowId}/executions?leadId=${leadId}`)
        if (!stateRes.ok) throw new Error("Failed to fetch execution state")
        const stateData = await stateRes.json()
        
        // Process workflow data
        const nodes = typeof workflowData.nodes === 'string' 
          ? JSON.parse(workflowData.nodes) 
          : workflowData.nodes
          
        const edges = typeof workflowData.edges === 'string'
          ? JSON.parse(workflowData.edges)
          : workflowData.edges
        
        // Apply execution status to nodes
        const enhancedNodes = nodes.map((node: Node) => {
          const nodeHistory = stateData.state?.history?.filter((h: any) => h.nodeId === node.id) || []
          let status = "pending"
          
          if (nodeHistory.length > 0) {
            const lastExecution = nodeHistory[nodeHistory.length - 1]
            status = lastExecution.status || "completed"
          }
          
          return {
            ...node,
            style: getNodeStyle(status),
            data: {
              ...node.data,
              executionStatus: status,
            },
          }
        })
        
        setWorkflow({ nodes: enhancedNodes, edges })
        setExecutionState(stateData)
        setExecutionHistory(stateData.state?.history || [])
      } catch (err) {
        console.error("Error fetching workflow execution:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }
    
    if (workflowId && leadId) {
      fetchWorkflowExecution()
    }
  }, [workflowId, leadId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!workflow || !executionState) {
    return (
      <Alert className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No execution data</AlertTitle>
        <AlertDescription>No execution data found for this workflow and lead.</AlertDescription>
      </Alert>
    )
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy h:mm:ss a")
    } catch (e) {
      return "Invalid date"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <Play className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Execution</CardTitle>
          <CardDescription>
            Current state: {executionState.currentNode ? "Active" : "Completed"}
            {executionState.currentNode && (
              <span className="ml-2">
                (Current node: <Badge variant="outline">{executionState.currentNode}</Badge>)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="visualization">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="history">Execution History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visualization" className="pt-4">
              <div className="h-[500px] border rounded-md">
                <ReactFlowProvider>
                  <ReactFlow
                    nodes={workflow.nodes}
                    edges={workflow.edges}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-right"
                  >
                    <Controls />
                    <MiniMap />
                    <Background gap={12} size={1} />
                  </ReactFlow>
                </ReactFlowProvider>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              <div className="border rounded-md p-4 max-h-[500px] overflow-y-auto">
                {executionHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No execution history available
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {executionHistory.map((event, index) => (
                      <li key={index} className="flex items-start border-b pb-3">
                        <div className="mt-1 mr-3">{getStatusIcon(event.status || "completed")}</div>
                        <div>
                          <div className="font-medium">
                            {event.type} - {event.nodeId}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTimestamp(event.timestamp)}
                          </div>
                          {event.message && (
                            <div className="text-sm mt-1 p-2 bg-muted rounded-md">{event.message}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 