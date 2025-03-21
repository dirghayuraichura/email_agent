import { TriggerType } from '../types/workflow';
import { processWorkflowTrigger } from './workflow-engine';

// Trigger when a lead is created
export async function triggerLeadCreated(lead: any) {
  await processWorkflowTrigger(TriggerType.LEAD_CREATED, {
    leadId: lead.id,
    leadData: lead
  });
}

// Trigger when a lead is updated
export async function triggerLeadUpdated(lead: any, changedFields: string[]) {
  await processWorkflowTrigger(TriggerType.LEAD_UPDATED, {
    leadId: lead.id,
    leadData: lead,
    changedFields
  });
}

// Trigger when an email is received
export async function triggerEmailReceived(email: any) {
  if (!email.leadId) return;
  
  await processWorkflowTrigger(TriggerType.EMAIL_RECEIVED, {
    leadId: email.leadId,
    emailId: email.id,
    emailData: email
  });
}

// Trigger when an email is opened (requires tracking pixel)
export async function triggerEmailOpened(email: any) {
  if (!email.leadId) return;
  
  await processWorkflowTrigger(TriggerType.EMAIL_OPENED, {
    leadId: email.leadId,
    emailId: email.id,
    emailData: email
  });
}

// Trigger when an email link is clicked (requires tracked links)
export async function triggerEmailClicked(email: any, linkUrl: string) {
  if (!email.leadId) return;
  
  await processWorkflowTrigger(TriggerType.EMAIL_CLICKED, {
    leadId: email.leadId,
    emailId: email.id,
    emailData: email,
    linkUrl
  });
}

// Manual trigger (initiated by a user)
export async function triggerManual(workflowId: string, leadId: string) {
  await processWorkflowTrigger(TriggerType.MANUAL, {
    workflowId,
    leadId
  });
}

// Schedule a trigger for future execution
export async function scheduleWorkflowTrigger(
  triggerType: TriggerType,
  data: any,
  scheduledTime: Date
) {
  const delayMs = scheduledTime.getTime() - Date.now();
  
  if (delayMs <= 0) {
    // Run immediately if scheduled time is in the past
    await processWorkflowTrigger(triggerType, data);
  } else {
    // For simple implementation, use setTimeout
    // In production, use a job queue like Bull
    setTimeout(() => {
      processWorkflowTrigger(triggerType, data);
    }, delayMs);
  }
} 