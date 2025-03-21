"use client"

import React from "react";
import { Mail, Clock, Split, Play, Ban, Hash, AlertCircle, Square, Search, Tags } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Reusable draggable node item component
interface NodeItemProps {
  type: string
  label: string
  icon: React.ReactNode
  description: string
}

function NodeItem({ type, label, icon, description }: NodeItemProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      className="flex cursor-grab items-center rounded-md border bg-card p-3 shadow-sm hover:border-primary/50 hover:bg-accent"
      draggable
      onDragStart={onDragStart}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mr-3">
        {icon}
      </div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function NodePalette() {
  return (
    <Card className="w-64">
      <CardHeader className="pb-3">
        <CardTitle>Node Types</CardTitle>
        <CardDescription>Drag and drop nodes to the canvas</CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <Tabs defaultValue="triggers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="triggers" className="space-y-3 mt-2 px-1">
            <NodeItem
              type="trigger"
              label="New Lead"
              icon={<Play className="h-4 w-4 text-primary" />}
              description="When a new lead is created"
            />
            <NodeItem
              type="trigger"
              label="Lead Updated"
              icon={<Play className="h-4 w-4 text-primary" />}
              description="When a lead's data is updated"
            />
            <NodeItem
              type="trigger"
              label="Email Received"
              icon={<Play className="h-4 w-4 text-primary" />}
              description="When an email is received"
            />
            <NodeItem
              type="trigger"
              label="Email Opened"
              icon={<Play className="h-4 w-4 text-primary" />}
              description="When an email is opened"
            />
            <NodeItem
              type="trigger"
              label="Email Clicked"
              icon={<Play className="h-4 w-4 text-primary" />}
              description="When an email link is clicked"
            />
            <NodeItem
              type="trigger"
              label="Manual Trigger"
              icon={<Play className="h-4 w-4 text-primary" />}
              description="Trigger manually by an action"
            />
            <NodeItem
              type="trigger"
              label="Scheduled"
              icon={<Play className="h-4 w-4 text-primary" />}
              description="Trigger at scheduled intervals"
            />
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-3 mt-2 px-1">
            <NodeItem
              type="email"
              label="Send Email"
              icon={<Mail className="h-4 w-4 text-primary" />}
              description="Send an email to a lead"
            />
            <NodeItem
              type="email"
              label="Send AI Email"
              icon={<Mail className="h-4 w-4 text-primary" />}
              description="Generate and send an AI email"
            />
            <NodeItem
              type="email"
              label="Update Lead"
              icon={<Hash className="h-4 w-4 text-primary" />}
              description="Update lead properties"
            />
            <NodeItem
              type="email"
              label="Create Task"
              icon={<Hash className="h-4 w-4 text-primary" />}
              description="Create a task for a lead"
            />
            <NodeItem
              type="email"
              label="Create Appointment"
              icon={<Hash className="h-4 w-4 text-primary" />}
              description="Schedule an appointment"
            />
            <NodeItem
              type="email"
              label="Notify User"
              icon={<Hash className="h-4 w-4 text-primary" />}
              description="Send a notification to a user"
            />
            <NodeItem
              type="emailAnalysis"
              label="Analyze Email"
              icon={<Search className="h-4 w-4 text-primary" />}
              description="Analyze email content"
            />
            <NodeItem
              type="leadCategorize"
              label="Categorize Lead"
              icon={<Tags className="h-4 w-4 text-primary" />}
              description="Categorize lead based on response"
            />
          </TabsContent>
          
          <TabsContent value="logic" className="space-y-3 mt-2 px-1">
            <NodeItem
              type="condition"
              label="Condition"
              icon={<Split className="h-4 w-4 text-primary" />}
              description="Branch based on a condition"
            />
            <NodeItem
              type="delay"
              label="Delay"
              icon={<Clock className="h-4 w-4 text-primary" />}
              description="Wait for a specified time"
            />
            <NodeItem
              type="end"
              label="End"
              icon={<Square className="h-4 w-4 text-primary" />}
              description="End this branch of the workflow"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 