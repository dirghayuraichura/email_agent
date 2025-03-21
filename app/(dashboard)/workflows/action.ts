'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../emails/action";
import { ActionType } from "@/app/types/workflow";
import { revalidatePath } from "next/cache";

// Create a workflow from a template
export async function createWorkflowFromTemplate(template: {
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
}) {
  const user = await getCurrentUser();
  
  // Create the workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: template.name,
      description: template.description,
      userId: user.id,
      isActive: false,
      nodes: template.nodes,
      edges: template.edges,
      isTemplate: false,
    },
  });
  
  revalidatePath('/workflows');
  
  return workflow;
} 