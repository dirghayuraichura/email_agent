import React from "react";
import { Handle, Position } from "reactflow";
import { Mail, Search } from "lucide-react";

export function EmailAnalysisNode({ data }: { data: any }) {
  return (
    <div className="flex flex-col rounded-md border bg-background p-4 shadow-sm">
      <div className="flex items-center">
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
          <Search className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <p className="font-medium text-sm">{data.label || "Analyze Email"}</p>
          <p className="text-xs text-muted-foreground">
            {data.description || "Analyze email content and sentiment"}
          </p>
        </div>
      </div>
      <div className="mt-2">
        {data.emailId && (
          <p className="text-xs bg-muted p-1 rounded">
            {data.emailId === 'latest'
              ? 'Latest email'
              : `Email ID: ${data.emailId.substring(0, 8)}...`}
          </p>
        )}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
} 