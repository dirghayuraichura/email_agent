"use client"

import { Handle, Position, type NodeProps } from "reactflow"
import { Play } from "lucide-react"

export function TriggerNode({ data }: NodeProps) {
  return (
    <div className="rounded-md border bg-background p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Play className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">{data.description}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-primary" />
    </div>
  )
}

