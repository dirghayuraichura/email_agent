import { Node, Edge } from 'reactflow'

export interface Workflow {
  id: string
  name: string
  description?: string
  isActive: boolean
  nodes: Node[]
  edges: Edge[]
  createdAt: Date
  updatedAt: Date
  userId: string
} 