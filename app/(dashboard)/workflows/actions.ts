"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TriggerType } from '../../types/workflow';

/**
 * Create a new workflow
 */
export async function createWorkflow(data: {
  name: string;
  description?: string;
  nodes: any;
  edges: any;
  userId: string;
}) {
  const { name, description, nodes, edges, userId } = data;
  
  const workflow = await prisma.workflow.create({
    data: {
      name,
      description,
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
      createdById: userId,
      isActive: true
    }
  });
  
  revalidatePath('/workflows');
  return workflow;
}

/**
 * Update an existing workflow
 */
export async function updateWorkflow(id: string, data: {
  name?: string;
  description?: string;
  nodes?: any;
  edges?: any;
  isActive?: boolean;
}) {
  const { name, description, nodes, edges, isActive } = data;
  
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (nodes !== undefined) updateData.nodes = JSON.stringify(nodes);
  if (edges !== undefined) updateData.edges = JSON.stringify(edges);
  if (isActive !== undefined) updateData.isActive = isActive;
  
  const workflow = await prisma.workflow.update({
    where: { id },
    data: updateData
  });
  
  revalidatePath('/workflows');
  revalidatePath(`/workflows/${id}`);
  return workflow;
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string) {
  await prisma.workflow.delete({
    where: { id }
  });
  
  revalidatePath('/workflows');
}

/**
 * Get workflow with details
 */
export async function getWorkflow(id: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  
  if (!workflow) {
    return null;
  }
  
  return {
    ...workflow,
    nodes: JSON.parse(workflow.nodes as string),
    edges: JSON.parse(workflow.edges as string)
  };
}

/**
 * Get all workflows
 */
export async function getWorkflows() {
  const workflows = await prisma.workflow.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          states: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  return workflows;
}

/**
 * Manually trigger a workflow for a lead
 */
export async function triggerWorkflowForLead(workflowId: string, leadId: string) {
  try {
    // Implement manual trigger directly since we have import issues
    const data = {
      workflowId,
      leadId
    };
    
    // Import and call process workflow trigger dynamically
    const { processWorkflowTrigger } = await import('../../lib/workflow-engine');
    await processWorkflowTrigger(TriggerType.MANUAL, data);
    
    return { success: true };
  } catch (error) {
    console.error("Error triggering workflow:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get workflow execution logs
 */
export async function getWorkflowLogs(workflowId: string, leadId?: string) {
  const whereClause: any = { workflowId };
  if (leadId) {
    whereClause.leadId = leadId;
  }
  
  // Use raw query to handle missing Prisma client generation
  const query = `
    SELECT * FROM "WorkflowActionLog"
    WHERE "workflowId" = $1
    ${leadId ? 'AND "leadId" = $2' : ''}
    ORDER BY "createdAt" DESC
    LIMIT 100
  `;
  
  const params = leadId ? [workflowId, leadId] : [workflowId];
  const logs = await prisma.$queryRawUnsafe(query, ...params);
  
  return logs;
} 