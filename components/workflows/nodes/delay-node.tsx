"use client"

import { Handle, Position, type NodeProps } from "reactflow"
import { Clock } from "lucide-react"

export function DelayNode({ data, isConnectable, id }: NodeProps) {
  // Convert seconds to human-readable format
  const formatDelay = (seconds: number) => {
    if (seconds === 0) return "0 seconds"
    
    const days = Math.floor(seconds / 86400)
    seconds -= days * 86400
    const hours = Math.floor(seconds / 3600)
    seconds -= hours * 3600
    const minutes = Math.floor(seconds / 60)
    seconds -= minutes * 60
    
    const parts = []
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`)
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
    if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`)
    
    return parts.join(', ')
  }

  return (
    <div className="rounded-md border bg-background p-4 shadow-sm">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-3 w-3 bg-primary" 
        isConnectable={isConnectable}
      />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">{data.label || "Delay"}</p>
          <p className="text-xs text-muted-foreground">Wait for {formatDelay(data.delay || 0)}</p>
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-3 w-3 bg-primary" 
        isConnectable={isConnectable} 
      />
    </div>
  )
}

