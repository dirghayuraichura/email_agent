"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
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
import { EndNode } from "./nodes/end-node"
import { EmailAnalysisNode } from "./nodes/email-analysis-node"
import { LeadCategorizeNode } from "./nodes/lead-categorize-node"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Mail, Clock, Split, Play, AlertTriangle, Ban } from "lucide-react"
import { NodePalette } from "./node-palette"
import { NodeConfigPanel } from "@/components/workflows/node-config-panel"
import { ActionType, NodeType, TriggerType } from "@/app/types/workflow"

// Helper function for deep comparison of objects
function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || obj1 === null || 
      typeof obj2 !== 'object' || obj2 === null) {
    return obj1 === obj2;
  }
  
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    
    // For arrays of objects (like nodes or edges), we need to sort them first
    // based on id to ensure proper comparison
    if (obj1.length > 0 && typeof obj1[0] === 'object' && obj1[0]?.id) {
      const sorted1 = [...obj1].sort((a, b) => a.id > b.id ? 1 : -1);
      const sorted2 = [...obj2].sort((a, b) => a.id > b.id ? 1 : -1);
      
      return sorted1.every((item, index) => isEqual(item, sorted2[index]));
    }
    
    return obj1.every((item, index) => isEqual(item, obj2[index]));
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => 
    Object.prototype.hasOwnProperty.call(obj2, key) && 
    isEqual(obj1[key], obj2[key])
  );
}

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
  end: EndNode,
  emailAnalysis: EmailAnalysisNode,
  leadCategorize: LeadCategorizeNode,
}

// Define custom edge types
const edgeTypes: EdgeTypes = {}

// Add version history type
type WorkflowVersion = {
  timestamp: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
  description: string;
  isActive: boolean;
}

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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Save the initial state for comparison
  const initialStateRef = useRef({
    nodes: workflow.nodes,
    edges: workflow.edges,
    name: workflow.name,
    description: workflow.description || "",
    isActive: workflow.isActive
  });

  // Add auto-save functionality
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  
  // Track changes to workflow with deep comparison
  useEffect(() => {
    const currentState = {
      nodes,
      edges,
      name,
      description,
      isActive
    };
    
    // Only set unsavedChanges to true if there are actual changes
    const hasChanges = !isEqual(initialStateRef.current, currentState);
    setUnsavedChanges(hasChanges);
  }, [nodes, edges, name, description, isActive]);
  
  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!unsavedChanges) return;
    
    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 30000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [unsavedChanges]);

  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds))
    },
    [setEdges],
  )

  // Handle saving the workflow
  const handleSave = () => {
    // Only save if there are changes
    if (!unsavedChanges) {
      toast({
        title: "No changes to save",
        description: "The workflow hasn't been modified since the last save.",
      });
      return;
    }
    
    const updatedWorkflow: Partial<Workflow> = {
      name,
      description,
      isActive,
      nodes,
      edges,
    }
    
    // Create a new version
    const newVersion: WorkflowVersion = {
      timestamp: new Date().toISOString(),
      nodes: [...nodes],
      edges: [...edges],
      name,
      description,
      isActive
    };
    
    onSave(updatedWorkflow);
    
    // Update the initial state reference
    initialStateRef.current = {
      nodes,
      edges,
      name,
      description,
      isActive
    };
    
    toast({
      title: "Workflow saved",
      description: "Your workflow has been saved successfully.",
    });
    
    setLastSaved(new Date());
    setUnsavedChanges(false);
  }

  // Handle node selection
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }

  // Handle node deselection
  const onPaneClick = () => {
    setSelectedNode(null)
  }

  // Handle adding a new node
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return
      }

      // Get the position where the element was dropped
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      // Create a new node based on the type
      let newNode: Node = {
        id: `node_${Date.now()}`,
        type: '',
        position,
        data: { label: '' },
      }

      // Configure the node based on the type
      if (type === 'trigger') {
        newNode = {
          id: `trigger_${Date.now()}`,
          type: 'trigger',
          position,
          data: { 
            label: 'New Lead', 
            description: 'Trigger when a new lead is added',
            type: TriggerType.LEAD_CREATED 
          },
        }
      } else if (type === 'email') {
        newNode = {
          id: `email_${Date.now()}`,
          type: 'email',
          position,
          data: { 
            label: 'Send Email', 
            subject: 'New email from workflow',
            type: ActionType.SEND_EMAIL 
          },
        }
      } else if (type === 'emailAnalysis') {
        newNode = {
          id: `emailAnalysis_${Date.now()}`,
          type: 'emailAnalysis',
          position,
          data: { 
            label: 'Analyze Email', 
            description: 'Analyze email content and sentiment',
            emailId: 'latest',
            type: ActionType.ANALYZE_EMAIL
          },
        }
      } else if (type === 'leadCategorize') {
        newNode = {
          id: `leadCategorize_${Date.now()}`,
          type: 'leadCategorize',
          position,
          data: { 
            label: 'Categorize Lead', 
            description: 'Categorize lead based on response',
            autoDetect: true,
            type: ActionType.CATEGORIZE_LEAD
          },
        }
      } else if (type === 'delay') {
        newNode = {
          id: `delay_${Date.now()}`,
          type: 'delay',
          position,
          data: { 
            label: 'Wait', 
            delay: 3600, // 1 hour in seconds
            delayType: 'FIXED'
          },
        }
      } else if (type === 'condition') {
        newNode = {
          id: `condition_${Date.now()}`,
          type: 'condition',
          position,
          data: { 
            label: 'Check Condition', 
            condition: 'lead.status', 
            operator: 'equals',
            value: 'NEW'
          },
        }
      } else if (type === 'end') {
        newNode = {
          id: `end_${Date.now()}`,
          type: 'end',
          position,
          data: { 
            label: 'End Workflow'
          },
        }
      }

      // Add the new node
      setNodes((nds) => nds.concat(newNode))
      setSelectedNode(newNode)
    },
    [setNodes]
  )

  // Handle updating node config
  const updateNodeConfig = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          }
          return node
        })
      )
    },
    [setNodes]
  )

  // Handle deleting a node
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
      setSelectedNode(null)
    },
    [setNodes, setEdges]
  )

  // Add version history
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  // Function to restore a version
  const restoreVersion = (version: WorkflowVersion) => {
    setNodes(version.nodes);
    setEdges(version.edges);
    setName(version.name);
    setDescription(version.description);
    setIsActive(version.isActive);
    setShowVersionHistory(false);
    
    toast({
      title: "Version restored",
      description: `Restored workflow from ${new Date(version.timestamp).toLocaleString()}`,
    });
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
        <div className="flex flex-col items-start justify-end gap-2">
          <div className="flex items-center space-x-2">
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleSave}>Save Workflow</Button>
          <Button 
            variant="outline" 
            onClick={() => setShowVersionHistory(!showVersionHistory)}
          >
            History
          </Button>
          {lastSaved && (
            <p className="text-xs text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
          {unsavedChanges && (
            <p className="text-xs text-amber-500">
              Unsaved changes
            </p>
          )}
        </div>
      </div>

      {showVersionHistory && versions.length > 0 && (
        <div className="mt-4 border rounded-md p-4">
          <h3 className="font-medium mb-2">Version History</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {versions.map((version, index) => (
              <div key={index} className="flex justify-between items-center p-2 hover:bg-accent rounded-md">
                <span>{new Date(version.timestamp).toLocaleString()}</span>
                <Button size="sm" variant="ghost" onClick={() => restoreVersion(version)}>
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 gap-4">
        {/* Left sidebar - Node palette */}
        <NodePalette />

        {/* Flow editor */}
        <div 
          className="flex-1 rounded-md border" 
          ref={reactFlowWrapper}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
          >
            <Controls />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Right sidebar - Node configuration */}
        {selectedNode && (
          <NodeConfigPanel 
            node={selectedNode} 
            updateNodeConfig={updateNodeConfig} 
            deleteNode={deleteNode}
          />
        )}
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

