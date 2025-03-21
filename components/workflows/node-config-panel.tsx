"use client"

import { Node } from "reactflow"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2 } from "lucide-react"
import { ActionType, ConditionType, NodeType, TriggerType, LeadCategory } from "@/app/types/workflow"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"

interface NodeConfigPanelProps {
  node: Node
  updateNodeConfig: (nodeId: string, data: any) => void
  deleteNode: (nodeId: string) => void
}

export function NodeConfigPanel({ node, updateNodeConfig, deleteNode }: NodeConfigPanelProps) {
  const [timeValue, setTimeValue] = useState(0)
  const [timeUnit, setTimeUnit] = useState("seconds")

  // Initialize time value and unit when node changes
  useEffect(() => {
    if (node.type === "delay" && node.data.delay !== undefined) {
      const seconds = node.data.delay
      
      if (seconds % 86400 === 0 && seconds > 0) {
        setTimeValue(seconds / 86400)
        setTimeUnit("days")
      } else if (seconds % 3600 === 0 && seconds > 0) {
        setTimeValue(seconds / 3600)
        setTimeUnit("hours")
      } else if (seconds % 60 === 0 && seconds > 0) {
        setTimeValue(seconds / 60)
        setTimeUnit("minutes")
      } else {
        setTimeValue(seconds)
        setTimeUnit("seconds")
      }
    }
  }, [node])

  const handleTimeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
    setTimeValue(value)
    
    // Convert to seconds based on selected unit
    let secondsValue = value
    if (timeUnit === "minutes") secondsValue = value * 60
    if (timeUnit === "hours") secondsValue = value * 3600
    if (timeUnit === "days") secondsValue = value * 86400
    
    updateNodeConfig(node.id, { delay: secondsValue })
  }

  const handleTimeUnitChange = (value: string) => {
    // Get current seconds value
    const currentSeconds = node.data.delay || 0
    
    // Calculate new display value based on selected unit
    let newValue = currentSeconds
    if (value === "seconds") newValue = currentSeconds
    if (value === "minutes") newValue = currentSeconds / 60
    if (value === "hours") newValue = currentSeconds / 3600
    if (value === "days") newValue = currentSeconds / 86400
    
    setTimeValue(newValue)
    setTimeUnit(value)
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeConfig(node.id, { label: e.target.value })
  }

  const handleSelectChange = (field: string, value: string) => {
    updateNodeConfig(node.id, { [field]: value })
  }

  const handleInputChange = (field: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateNodeConfig(node.id, { [field]: e.target.value })
  }

  const handleSwitchChange = (field: string, value: boolean) => {
    updateNodeConfig(node.id, { [field]: value })
  }

  const handleNumberChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10)
    updateNodeConfig(node.id, { [field]: value })
  }

  const handleDeleteClick = () => {
    deleteNode(node.id)
  }

  let configPanel

  // Render configuration based on node type
  switch (node.type) {
    case "trigger":
      configPanel = (
        <div className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="trigger-type">Trigger Type</Label>
            <Select
              value={node.data.type || TriggerType.LEAD_CREATED}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger id="trigger-type">
                <SelectValue placeholder="Select trigger type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TriggerType.LEAD_CREATED}>New Lead Created</SelectItem>
                <SelectItem value={TriggerType.LEAD_UPDATED}>Lead Updated</SelectItem>
                <SelectItem value={TriggerType.EMAIL_RECEIVED}>Email Received</SelectItem>
                <SelectItem value={TriggerType.EMAIL_OPENED}>Email Opened</SelectItem>
                <SelectItem value={TriggerType.EMAIL_CLICKED}>Email Clicked</SelectItem>
                <SelectItem value={TriggerType.MANUAL}>Manual Trigger</SelectItem>
                <SelectItem value={TriggerType.SCHEDULED}>Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="trigger-description">Description</Label>
            <Input
              id="trigger-description"
              value={node.data.description || ""}
              onChange={(e) => handleInputChange("description", e)}
              placeholder="Describe this trigger"
            />
          </div>
          
          {node.data.type === TriggerType.SCHEDULED && (
            <div className="grid w-full gap-2">
              <Label htmlFor="schedule">Schedule (cron expression)</Label>
              <Input
                id="schedule"
                value={node.data.schedule || "0 9 * * *"}
                onChange={(e) => handleInputChange("schedule", e)}
                placeholder="Cron expression (e.g., 0 9 * * *)"
              />
              <p className="text-xs text-muted-foreground">Default: Every day at 9:00 AM</p>
            </div>
          )}
        </div>
      )
      break

    case "email":
      configPanel = (
        <div className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="email-type">Action Type</Label>
            <Select
              value={node.data.type || ActionType.SEND_EMAIL}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger id="email-type">
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ActionType.SEND_EMAIL}>Send Email</SelectItem>
                <SelectItem value={ActionType.GENERATE_AI_CONTENT}>Generate AI Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="email-subject">Email Subject</Label>
            <Input
              id="email-subject"
              value={node.data.subject || ""}
              onChange={(e) => handleInputChange("subject", e)}
              placeholder="Email subject"
            />
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="email-body">Email Body</Label>
            <Textarea
              id="email-body"
              value={node.data.body || ""}
              onChange={(e) => handleInputChange("body", e)}
              placeholder="Email content"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="email-account">Email Account</Label>
            <Select
              value={node.data.emailAccountId || ""}
              onValueChange={(value) => handleSelectChange("emailAccountId", value)}
            >
              <SelectTrigger id="email-account">
                <SelectValue placeholder="Select email account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Account</SelectItem>
                {/* You would add more accounts dynamically in a real implementation */}
              </SelectContent>
            </Select>
          </div>
          
          {node.data.type === ActionType.GENERATE_AI_CONTENT && (
            <>
              <div className="grid w-full gap-2">
                <Label htmlFor="ai-prompt">AI Prompt</Label>
                <Textarea
                  id="ai-prompt"
                  value={node.data.prompt || ""}
                  onChange={(e) => handleInputChange("prompt", e)}
                  placeholder="Prompt for AI to generate email"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid w-full gap-2">
                <Label htmlFor="ai-tone">Tone</Label>
                <Select
                  value={node.data.tone || "professional"}
                  onValueChange={(value) => handleSelectChange("tone", value)}
                >
                  <SelectTrigger id="ai-tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      )
      break

    case "delay":
      configPanel = (
        <div className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="delay-time">Delay</Label>
            <div className="flex gap-2">
              <Input
                id="delay-time"
                type="number"
                value={timeValue}
                onChange={handleTimeValueChange}
                min={0}
                className="flex-1"
              />
              <Select
                value={timeUnit}
                onValueChange={handleTimeUnitChange}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="delay-type">Delay Type</Label>
            <Select
              value={node.data.delayType || "FIXED"}
              onValueChange={(value) => handleSelectChange("delayType", value)}
            >
              <SelectTrigger id="delay-type">
                <SelectValue placeholder="Select delay type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">Fixed Time</SelectItem>
                <SelectItem value="RELATIVE">Relative to Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
      break

    case "condition":
      configPanel = (
        <div className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="condition-type">Condition Type</Label>
            <Select
              value={node.data.conditionType || ConditionType.LEAD_PROPERTY}
              onValueChange={(value) => handleSelectChange("conditionType", value)}
            >
              <SelectTrigger id="condition-type">
                <SelectValue placeholder="Select condition type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConditionType.LEAD_PROPERTY}>Lead Property</SelectItem>
                <SelectItem value={ConditionType.EMAIL_PROPERTY}>Email Property</SelectItem>
                <SelectItem value={ConditionType.DATE_COMPARISON}>Date Comparison</SelectItem>
                <SelectItem value={ConditionType.CUSTOM_FIELD}>Custom Field</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="condition-property">Property</Label>
            <Input
              id="condition-property"
              value={node.data.condition || ""}
              onChange={(e) => handleInputChange("condition", e)}
              placeholder="Property to check (e.g., lead.status)"
            />
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="condition-operator">Operator</Label>
            <Select
              value={node.data.operator || "equals"}
              onValueChange={(value) => handleSelectChange("operator", value)}
            >
              <SelectTrigger id="condition-operator">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="notEquals">Not Equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="notContains">Does Not Contain</SelectItem>
                <SelectItem value="greaterThan">Greater Than</SelectItem>
                <SelectItem value="lessThan">Less Than</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="condition-value">Value</Label>
            <Input
              id="condition-value"
              value={node.data.value || ""}
              onChange={(e) => handleInputChange("value", e)}
              placeholder="Value to compare against"
            />
          </div>
        </div>
      )
      break

    case "emailAnalysis":
      configPanel = (
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={node.data.label || ""}
              onChange={(e) => handleInputChange("label", e)}
              placeholder="Enter node label"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailId">Email Selection</Label>
            <Select
              value={node.data.emailId || "latest"}
              onValueChange={(value) => handleSelectChange("emailId", value)}
            >
              <SelectTrigger id="emailId">
                <SelectValue placeholder="Select email to analyze" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Email</SelectItem>
                <SelectItem value="trigger">Trigger Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="analysisDepth">Analysis Depth</Label>
            <Select
              value={node.data.analysisDepth || "standard"}
              onValueChange={(value) => handleSelectChange("analysisDepth", value)}
            >
              <SelectTrigger id="analysisDepth">
                <SelectValue placeholder="Select analysis depth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (Faster)</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="detailed">Detailed (Slower)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
      break

    case "leadCategorize":
      configPanel = (
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={node.data.label || ""}
              onChange={(e) => handleInputChange("label", e)}
              placeholder="Enter node label"
            />
          </div>
          <div className="flex items-center space-x-2 py-2">
            <Switch
              id="autoDetect"
              checked={node.data.autoDetect}
              onCheckedChange={(value) => handleSwitchChange("autoDetect", value)}
            />
            <Label htmlFor="autoDetect">Auto-detect category with AI</Label>
          </div>
          {!node.data.autoDetect && (
            <div className="space-y-2">
              <Label htmlFor="category">Lead Category</Label>
              <Select
                value={node.data.category || LeadCategory.NEW}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select lead category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeadCategory.HOT}>Hot</SelectItem>
                  <SelectItem value={LeadCategory.WARM}>Warm</SelectItem>
                  <SelectItem value={LeadCategory.COLD}>Cold</SelectItem>
                  <SelectItem value={LeadCategory.NEW}>New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="reason">Categorization Reason</Label>
            <Textarea
              id="reason"
              value={node.data.reason || ""}
              onChange={(e) => handleInputChange("reason", e)}
              placeholder="Reason for this categorization"
              rows={3}
            />
          </div>
        </div>
      )
      break

    default:
      configPanel = (
        <div className="py-4 text-center text-muted-foreground">
          No configuration available for this node type.
        </div>
      )
  }

  return (
    <Card className="w-64">
      <CardHeader className="pb-3">
        <CardTitle>Configure Node</CardTitle>
        <CardDescription>Edit node properties</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full gap-2">
          <Label htmlFor="node-name">Node Name</Label>
          <Input
            id="node-name"
            value={node.data.label || ""}
            onChange={handleLabelChange}
            placeholder="Enter node name"
          />
        </div>
        
        <Separator />
        
        {configPanel}
      </CardContent>
      <CardFooter>
        <Button variant="destructive" size="sm" onClick={handleDeleteClick} className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Node
        </Button>
      </CardFooter>
    </Card>
  )
} 