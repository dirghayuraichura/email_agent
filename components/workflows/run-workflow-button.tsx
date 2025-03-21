"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Play, ChevronDown } from "lucide-react"

interface RunWorkflowButtonProps {
  leadId: string
  buttonVariant?: "default" | "outline" | "secondary"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  icon?: boolean
  showLabel?: boolean
}

export function RunWorkflowButton({
  leadId,
  buttonVariant = "default",
  buttonSize = "default",
  icon = true,
  showLabel = true,
}: RunWorkflowButtonProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null)

  // Load workflows when dropdown is opened
  const handleDropdownOpen = async () => {
    if (workflows.length === 0 && !isLoadingWorkflows) {
      try {
        setIsLoadingWorkflows(true)
        const response = await fetch("/api/workflows?active=true")
        if (!response.ok) throw new Error("Failed to load workflows")
        const data = await response.json()
        setWorkflows(data)
      } catch (error) {
        console.error("Error loading workflows:", error)
        toast({
          title: "Error",
          description: "Failed to load workflows. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingWorkflows(false)
      }
    }
  }

  // Select workflow and show confirmation dialog
  const handleSelectWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow)
    setShowConfirmDialog(true)
  }

  // Run the selected workflow
  const runWorkflow = async () => {
    if (!selectedWorkflow) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/workflows/${selectedWorkflow.id}/executions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to run workflow")
      }

      toast({
        title: "Workflow started",
        description: `${selectedWorkflow.name} is now running on this lead.`,
      })
    } catch (error) {
      console.error("Error running workflow:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run workflow. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={buttonVariant} size={buttonSize} onClick={handleDropdownOpen}>
            {icon && <Play className="h-4 w-4 mr-2" />}
            {showLabel && "Run Workflow"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isLoadingWorkflows ? (
            <DropdownMenuItem disabled>Loading workflows...</DropdownMenuItem>
          ) : workflows.length === 0 ? (
            <DropdownMenuItem disabled>No active workflows available</DropdownMenuItem>
          ) : (
            workflows.map((workflow) => (
              <DropdownMenuItem key={workflow.id} onClick={() => handleSelectWorkflow(workflow)}>
                {workflow.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Run Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to run the <strong>{selectedWorkflow?.name}</strong> workflow on this lead?
              This will start the automation process immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runWorkflow} disabled={isLoading}>
              {isLoading ? "Running..." : "Run Workflow"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 