"use client"

import { Handle, Position, type NodeProps } from "reactflow"
import { Ban } from "lucide-react"

export function EndNode({ data }: NodeProps) {
  return (
    <div className="rounded-md border bg-background p-4 shadow-sm">
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-primary" />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
          <Ban className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <p className="font-medium">{data.label || "End Workflow"}</p>
          <p className="text-xs text-muted-foreground">End of this branch</p>
        </div>
      </div>
    </div>
  )
} 