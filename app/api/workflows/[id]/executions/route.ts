import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all executions for a workflow or a specific execution if leadId is provided
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    // If leadId is provided, return that specific execution state
    if (leadId) {
      const executionState = await prisma.workflowState.findUnique({
        where: {
          workflowId_leadId: {
            workflowId: id,
            leadId: leadId
          }
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!executionState) {
        return NextResponse.json({
          error: 'Execution state not found'
        }, { status: 404 });
      }

      return NextResponse.json(executionState);
    }

    // Otherwise, return all executions for this workflow
    const executions = await prisma.workflowState.findMany({
      where: {
        workflowId: id
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(executions);
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    return NextResponse.json({
      error: 'Failed to fetch workflow executions'
    }, { status: 500 });
  }
}

// Manually trigger a workflow for a specific lead
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const { leadId } = data;

    if (!leadId) {
      return NextResponse.json({
        error: 'Lead ID is required'
      }, { status: 400 });
    }

    // Check if workflow exists and is active
    const workflow = await prisma.workflow.findUnique({
      where: {
        id,
        isActive: true
      }
    });

    if (!workflow) {
      return NextResponse.json({
        error: 'Workflow not found or not active'
      }, { status: 404 });
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: {
        id: leadId
      }
    });

    if (!lead) {
      return NextResponse.json({
        error: 'Lead not found'
      }, { status: 404 });
    }

    // Trigger the workflow manually
    // In a real implementation, you would call your workflow engine here
    // For example: await processWorkflowTrigger(TriggerType.MANUAL, { leadId });

    // For this example, we'll just create or update the workflow state
    const workflowState = await prisma.workflowState.upsert({
      where: {
        workflowId_leadId: {
          workflowId: id,
          leadId
        }
      },
      update: {
        state: {
          variables: { leadId },
          history: [
            {
              nodeId: 'manual_trigger',
              timestamp: new Date(),
              type: 'TRIGGER',
              status: 'RUNNING'
            }
          ]
        }
      },
      create: {
        workflowId: id,
        leadId,
        currentNode: 'manual_trigger',
        state: {
          variables: { leadId },
          history: [
            {
              nodeId: 'manual_trigger',
              timestamp: new Date(),
              type: 'TRIGGER',
              status: 'RUNNING'
            }
          ]
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow triggered successfully',
      execution: workflowState
    });
  } catch (error) {
    console.error('Error triggering workflow:', error);
    return NextResponse.json({
      error: 'Failed to trigger workflow'
    }, { status: 500 });
  }
} 