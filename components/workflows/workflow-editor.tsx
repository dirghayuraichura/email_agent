"use client"

import { useCallback, useRef, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type Edge,
} from "reactflow"
import "reactflow/dist/style.css"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TriggerNode } from "./nodes/trigger-node"
import { EmailNode } from "./nodes/email-node"
import { DelayNode } from "./nodes/delay-node"
import { ConditionNode } from "./nodes/condition-node"

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

// Define custom node types
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  email: EmailNode,
  delay: DelayNode,
  condition: ConditionNode,
}

// Define custom edge types
const edgeTypes: EdgeTypes = {}

interface WorkflowEditorProps {
  workflow: Workflow
  onSave: (workflow: Partial<Workflow>) => void
}

export function WorkflowEditor({ workflow, onSave }: WorkflowEditorProps) {
  const { toast } = useToast()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges)
  const [name, setName] = useState(workflow.name)
  const [description, setDescription] = useState(workflow.description || "")
  const [isActive, setIsActive] = useState(workflow.isActive)

  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds))
    },
    [setEdges],
  )

  // Handle saving the workflow
  const handleSave = () => {
    const updatedWorkflow: Partial<Workflow> = {
      name,
      description,
      isActive,
      nodes,
      edges,
    }
    onSave(updatedWorkflow)
    toast({
      title: "Workflow saved",
      description: "Your workflow has been saved successfully.",
    })
  }

  return (
    <div className="flex h-[80vh] flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="name">Workflow Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter workflow name" />
        </div>
        <div className="grid flex-1 gap-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter workflow description"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleSave}>Save Workflow</Button>
        </div>
      </div>

      <div className="flex-1 rounded-md border" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  )
}

// Wrap the component with ReactFlowProvider
export function WorkflowEditorWrapper(props: WorkflowEditorProps) {
  return (
    <ReactFlowProvider>
      <WorkflowEditor {...props} />
    </ReactFlowProvider>
  )
}

