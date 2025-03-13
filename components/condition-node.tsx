"use client"

import { Handle, Position, type NodeProps } from "reactflow"
import { Split } from "lucide-react"

export function ConditionNode({ data }: NodeProps) {
  return (
    <div className="rounded-md border bg-background p-4 shadow-sm">
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-primary" />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Split className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">
            Condition: {data.condition} {data.value ? "is true" : "is false"}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="h-3 w-3 bg-green-500"
        style={{ left: "30%" }}
      />
      <Handle type="source" position={Position.Bottom} id="no" className="h-3 w-3 bg-red-500" style={{ left: "70%" }} />
    </div>
  )
}

