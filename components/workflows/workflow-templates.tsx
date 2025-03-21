// New component for workflow templates
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type Node, type Edge } from "reactflow";
import { TriggerType, ActionType } from "@/app/types/workflow";

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  category: string;
  thumbnail?: string;
};

// Predefined templates
export const templates: WorkflowTemplate[] = [
  {
    id: "welcome-email",
    name: "Welcome Email Sequence",
    description: "Send a welcome email when a new lead is created",
    category: "Leads",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          label: "New Lead", 
          description: "Trigger when a new lead is added",
          type: TriggerType.LEAD_CREATED 
        },
      },
      {
        id: "email-1",
        type: "email",
        position: { x: 100, y: 250 },
        data: { 
          label: "Welcome Email", 
          subject: "Welcome to our service!",
          type: ActionType.SEND_EMAIL 
        },
      },
      {
        id: "delay-1",
        type: "delay",
        position: { x: 100, y: 400 },
        data: { 
          label: "Wait 3 Days", 
          delay: 259200, // 3 days in seconds
          delayType: "FIXED"
        },
      },
      {
        id: "email-2",
        type: "email",
        position: { x: 100, y: 550 },
        data: { 
          label: "Follow-up Email", 
          subject: "How's it going?",
          type: ActionType.SEND_EMAIL 
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "trigger-1", target: "email-1", animated: true },
      { id: "e2-3", source: "email-1", target: "delay-1", animated: true },
      { id: "e3-4", source: "delay-1", target: "email-2", animated: true },
    ],
  },
  // Add more templates here
];

interface WorkflowTemplatesProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export function WorkflowTemplates({ onSelectTemplate }: WorkflowTemplatesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {template.thumbnail && (
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img 
                  src={template.thumbnail} 
                  alt={template.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
            <div className="text-sm mt-2">Category: {template.category}</div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onSelectTemplate(template)}>
              Use Template
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 