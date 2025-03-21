import prisma from '@/lib/prisma';
import { NodeType, TriggerType } from '../types/workflow';
import { executeAction } from './workflow-actions';
import { evaluateCondition } from './workflow-conditions';

// Process a workflow trigger event
export async function processWorkflowTrigger(triggerType: TriggerType, data: any) {
  // Find all active workflows with this trigger type
  const workflows = await prisma.workflow.findMany({
    where: {
      isActive: true,
      // Find workflows that have a trigger node with this type
      nodes: {
        path: ['$[*].data.type'],
        array_contains: triggerType,
      }
    }
  });
  
  // Log the trigger event
  console.log(`Processing ${workflows.length} workflows for trigger: ${triggerType}`);
  
  // For each matching workflow, start execution
  for (const workflow of workflows) {
    const nodes = JSON.parse(workflow.nodes as string);
    
    // Find trigger nodes matching this type
    const triggerNodes = nodes.filter((node: any) => 
      node.type === NodeType.TRIGGER && 
      node.data?.type === triggerType
    );
    
    // Start workflow from each matching trigger node
    for (const triggerNode of triggerNodes) {
      await startWorkflow(workflow.id, triggerNode.id, data);
    }
  }
}

// Start a workflow execution
export async function startWorkflow(workflowId: string, startNodeId: string, triggerData: any) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId }
  });
  
  if (!workflow || !workflow.isActive) {
    console.log(`Workflow ${workflowId} is not active or doesn't exist`);
    return;
  }
  
  // Extract lead ID from trigger data
  const leadId = triggerData.leadId;
  if (!leadId) {
    console.error('No lead ID found in trigger data', triggerData);
    return;
  }
  
  // Create or update workflow state
  let workflowState = await prisma.workflowState.findUnique({
    where: {
      workflowId_leadId: {
        workflowId,
        leadId
      }
    }
  });
  
  const initialState = {
    variables: { ...triggerData },
    history: [{
      nodeId: startNodeId,
      timestamp: new Date(),
      type: NodeType.TRIGGER
    }]
  };
  
  if (!workflowState) {
    // Create new state
    workflowState = await prisma.workflowState.create({
      data: {
        workflowId,
        leadId,
        currentNode: startNodeId,
        state: initialState
      }
    });
  } else {
    // Update existing state
    workflowState = await prisma.workflowState.update({
      where: { id: workflowState.id },
      data: {
        currentNode: startNodeId,
        state: initialState
      }
    });
  }
  
  // Start execution from the trigger node
  await executeNode(startNodeId, workflowId, leadId);
}

// Execute a workflow node and continue to next nodes
export async function executeNode(nodeId: string, workflowId: string, leadId: string) {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });
    
    if (!workflow || !workflow.isActive) {
      console.log(`Workflow ${workflowId} is no longer active`);
      return;
    }
    
    const nodes = JSON.parse(workflow.nodes as string);
    const edges = JSON.parse(workflow.edges as string);
    
    // Find the current node
    const currentNode = nodes.find((node: any) => node.id === nodeId);
    if (!currentNode) {
      console.error(`Node ${nodeId} not found in workflow ${workflowId}`);
      return;
    }
    
    console.log(`Executing ${currentNode.type} node (${nodeId}) in workflow ${workflowId}`);
    
    // Update the workflow state to track execution
    await updateWorkflowState(workflowId, leadId, nodeId, currentNode.type);
    
    let nextNodeIds: string[] = [];
    let success = true;
    
    // Execute node based on type
    switch (currentNode.type) {
      case NodeType.TRIGGER:
        // Trigger node already executed, just find next nodes
        nextNodeIds = findNextNodes(edges, nodeId);
        break;
        
      case NodeType.ACTION:
        // Execute action and log result
        try {
          const result = await executeAction(currentNode.data, leadId);
          success = result;
          
          // Log action execution
          await logAction(workflowId, nodeId, leadId, currentNode.data, success ? 'SUCCESS' : 'FAILED');
          
          // Find next nodes if successful
          if (success) {
            nextNodeIds = findNextNodes(edges, nodeId);
          }
        } catch (error) {
          console.error(`Error executing action node ${nodeId}:`, error);
          await logAction(workflowId, nodeId, leadId, currentNode.data, 'FAILED', 
            error instanceof Error ? error.message : 'Unknown error');
        }
        break;
        
      case NodeType.CONDITION:
        // Evaluate the condition
        try {
          const result = await evaluateCondition(currentNode.data, leadId);
          
          // Find next nodes based on condition result (true/false path)
          nextNodeIds = edges
            .filter((edge: any) => edge.source === nodeId)
            .filter((edge: any) => {
              // If condition is specified, match it, otherwise include all edges
              return edge.condition === undefined || edge.condition === result;
            })
            .map((edge: any) => edge.target);
            
          console.log(`Condition evaluated to ${result}, following ${nextNodeIds.length} paths`);
        } catch (error) {
          console.error(`Error evaluating condition node ${nodeId}:`, error);
          await logAction(workflowId, nodeId, leadId, currentNode.data, 'FAILED', 
            error instanceof Error ? error.message : 'Unknown error');
        }
        break;
        
      case NodeType.DELAY:
        // Schedule execution after delay
        const delayMs = currentNode.data.delayMs || 0;
        
        if (delayMs > 0) {
          console.log(`Delaying execution for ${delayMs}ms`);
          
          // For a simple implementation, using setTimeout
          // In production, use a job queue like Bull
          setTimeout(() => {
            // Find and execute next nodes after delay
            const delayedNextNodeIds = findNextNodes(edges, nodeId);
            for (const nextNodeId of delayedNextNodeIds) {
              executeNode(nextNodeId, workflowId, leadId);
            }
          }, delayMs);
          
          // Early return since we'll continue execution later
          return;
        } else {
          // No delay, just continue to next nodes
          nextNodeIds = findNextNodes(edges, nodeId);
        }
        break;
        
      case NodeType.SPLIT:
        // Split execution to all connected nodes (parallel execution)
        nextNodeIds = findNextNodes(edges, nodeId);
        break;
        
      case NodeType.END:
        // End of workflow branch
        console.log(`Reached end node ${nodeId} in workflow ${workflowId}`);
        return;
        
      default:
        console.warn(`Unknown node type for node ${nodeId}: ${currentNode.type}`);
    }
    
    // Execute next nodes (if any)
    for (const nextNodeId of nextNodeIds) {
      await executeNode(nextNodeId, workflowId, leadId);
    }
  } catch (error) {
    console.error(`Error executing node ${nodeId} in workflow ${workflowId}:`, error);
    await logAction(workflowId, nodeId, leadId, {}, 'FAILED', 
      error instanceof Error ? error.message : 'Unknown error');
  }
}

// Helper function to find next nodes
function findNextNodes(edges: any[], nodeId: string): string[] {
  return edges
    .filter((edge: any) => edge.source === nodeId)
    .map((edge: any) => edge.target);
}

// Helper function to update workflow state
async function updateWorkflowState(workflowId: string, leadId: string, nodeId: string, nodeType: string) {
  try {
    await prisma.workflowState.update({
      where: {
        workflowId_leadId: {
          workflowId,
          leadId
        }
      },
      data: {
        currentNode: nodeId,
        state: {
          update: {
            history: {
              push: {
                nodeId,
                timestamp: new Date(),
                type: nodeType
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error updating workflow state:', error);
  }
}

// Helper function to log action execution
async function logAction(
  workflowId: string, 
  nodeId: string, 
  leadId: string, 
  data: any, 
  status: string, 
  error?: string
) {
  try {
    // Use raw SQL to insert log since we have permission issues with prisma generation
    console.log(`Logging workflow action: ${workflowId}, ${nodeId}, ${leadId}, ${status}`);
    if (error) {
      console.error(`Action error: ${error}`);
    }
    
    // Instead of using the workflowActionLog model directly, use a more generic approach
    // This is just logging anyway, so if it fails, we just log to console
    try {
      await prisma.$executeRaw`
        INSERT INTO "WorkflowActionLog" ("id", "workflowId", "nodeId", "leadId", "actionType", "data", "status", "error", "createdAt")
        VALUES (gen_random_uuid(), ${workflowId}, ${nodeId}, ${leadId}, ${data.type || 'UNKNOWN'}, ${JSON.stringify(data)}::jsonb, ${status}, ${error}, now())
      `;
    } catch (sqlError) {
      console.error('Could not log to database:', sqlError);
    }
  } catch (logError) {
    console.error('Error logging workflow action:', logError);
  }
} 