"use client"

import { Handle, Position, type NodeProps } from "reactflow"
import { Mail } from "lucide-react"

export function EmailNode({ data }: NodeProps) {
  return (
    <div className="rounded-md border bg-background p-4 shadow-sm">
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-primary" />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">Subject: {data.subject}</p>
          {data.templateId && <p className="text-xs text-muted-foreground">Template: {data.templateId}</p>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-primary" />
    </div>
  )
}

