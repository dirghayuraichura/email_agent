"use client"

import { Handle, Position, type NodeProps } from "reactflow"
import { Clock } from "lucide-react"

export function DelayNode({ data }: NodeProps) {
  // Convert seconds to human-readable format
  const formatDelay = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`
    return `${Math.floor(seconds / 86400)} days`
  }

  return (
    <div className="rounded-md border bg-background p-4 shadow-sm">
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-primary" />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">Wait for {formatDelay(data.delay)}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-primary" />
    </div>
  )
}

