import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { type Node, type Edge } from "reactflow";

// Define the Workflow type locally if not available from /types/workflow
interface Workflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: Node[];
  edges: Edge[];
}

interface WorkflowExportImportProps {
  workflow: Workflow;
  onImport: (workflow: Partial<Workflow>) => void;
}

export function WorkflowExportImport({ workflow, onImport }: WorkflowExportImportProps) {
  const { toast } = useToast();
  const [importData, setImportData] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  const handleExport = () => {
    // Export workflow as JSON
    const exportData = {
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
    };
    
    // Create and download a JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${workflow.name.replace(/\s+/g, '_')}_workflow.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Workflow exported",
      description: `${workflow.name} has been exported successfully`,
    });
  };
  
  const handleImport = () => {
    try {
      const importedWorkflow = JSON.parse(importData);
      
      // Validate the imported data
      if (!importedWorkflow.nodes || !importedWorkflow.edges) {
        throw new Error("Invalid workflow data: missing nodes or edges");
      }
      
      // Import the workflow
      onImport({
        name: importedWorkflow.name || "Imported Workflow",
        description: importedWorkflow.description || "",
        nodes: importedWorkflow.nodes,
        edges: importedWorkflow.edges,
      });
      
      setIsImportDialogOpen(false);
      setImportData("");
      
      toast({
        title: "Workflow imported",
        description: "The workflow has been imported successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Import failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport}>Export</Button>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Import</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste workflow JSON here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="min-h-[200px]"
            />
            <Button onClick={handleImport}>Import Workflow</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 