import React from "react";
import { Handle, Position } from "reactflow";
import { UserRound, Tags } from "lucide-react";
import { LeadCategory } from "@/app/types/workflow";

export function LeadCategorizeNode({ data }: { data: any }) {
  // Helper function to get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case LeadCategory.HOT:
        return "bg-red-100 text-red-700";
      case LeadCategory.WARM:
        return "bg-amber-100 text-amber-700";
      case LeadCategory.COLD:
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col rounded-md border bg-background p-4 shadow-sm">
      <div className="flex items-center">
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          <Tags className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-sm">{data.label || "Categorize Lead"}</p>
          <p className="text-xs text-muted-foreground">
            {data.description || "Categorize lead based on email analysis"}
          </p>
        </div>
      </div>
      <div className="mt-2">
        {data.autoDetect ? (
          <p className="text-xs bg-green-50 text-green-700 p-1 rounded">
            Auto-detect (AI)
          </p>
        ) : data.category ? (
          <p className={`text-xs p-1 rounded ${getCategoryColor(data.category)}`}>
            Category: {data.category}
          </p>
        ) : (
          <p className="text-xs bg-muted p-1 rounded">
            No category specified
          </p>
        )}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
} 