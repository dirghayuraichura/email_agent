import prisma from '@/lib/prisma';
import { ActionType, LeadCategory } from '../types/workflow';
import { sendEmailAction, generateEmailWithAIAction, analyzeEmailWithAI } from '@/app/(dashboard)/emails/action';

export async function executeAction(actionData: any, leadId: string): Promise<boolean> {
  const { type } = actionData;
  
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });
    
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }
    
    // Execute the appropriate action based on type
    switch (type) {
      case ActionType.SEND_EMAIL:
        await sendEmailFromWorkflow(actionData, lead);
        break;
        
      case ActionType.UPDATE_LEAD:
        await updateLeadFromWorkflow(actionData, leadId);
        break;
        
      case ActionType.CREATE_TASK:
        await createTaskFromWorkflow(actionData, leadId);
        break;
        
      case ActionType.CREATE_APPOINTMENT:
        await createAppointmentFromWorkflow(actionData, leadId);
        break;
        
      case ActionType.NOTIFY_USER:
        await notifyUserFromWorkflow(actionData);
        break;
        
      case ActionType.GENERATE_AI_CONTENT:
        await generateAIContentFromWorkflow(actionData, lead);
        break;
        
      case ActionType.ANALYZE_EMAIL:
        await analyzeEmailFromWorkflow(actionData, leadId);
        break;
        
      case ActionType.CATEGORIZE_LEAD:
        await categorizeLeadFromWorkflow(actionData, leadId);
        break;
        
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error executing action ${type}:`, error);
    return false;
  }
}

// Send an email from a workflow
async function sendEmailFromWorkflow(data: any, lead: any) {
  const { emailAccountId, subject, body, template, variables } = data;
  
  // Process template or use direct body
  let processedBody = body || template;
  
  // Process variable placeholders
  if (variables && typeof processedBody === 'string') {
    for (const [key, value] of Object.entries(variables)) {
      processedBody = processedBody.replace(
        new RegExp(`{{${key}}}`, 'g'), 
        String(value)
      );
    }
  }
  
  // Replace lead-specific variables
  if (typeof processedBody === 'string') {
    processedBody = processedBody.replace(
      /{{lead\.([^}]+)}}/g, 
      (match, field) => lead[field] || match
    );
  }
  
  // Send the email using your existing function
  await sendEmailAction({
    fromAccountId: emailAccountId,
    to: lead.email,
    subject: processSubject(subject, lead),
    body: processedBody,
    leadId: lead.id
  });
}

// Process subject line with variables
function processSubject(subject: string, lead: any): string {
  return subject.replace(
    /{{lead\.([^}]+)}}/g, 
    (match: string, field: string) => lead[field] || match
  );
}

// Update a lead from a workflow
async function updateLeadFromWorkflow(data: any, leadId: string) {
  const { status, score, company, tags, notes, customFields } = data;
  
  const updateData: any = {};
  
  // Update basic fields if provided
  if (status) updateData.status = status;
  if (score !== undefined) updateData.score = score;
  if (company) updateData.company = company;
  if (notes) updateData.notes = notes;
  
  // Update tags if provided
  if (tags) {
    updateData.tags = tags;
  }
  
  // Update custom fields if provided
  if (customFields && Object.keys(customFields).length > 0) {
    // Get current custom fields
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { customFields: true }
    });
    
    // Merge current and new custom fields
    updateData.customFields = {
      ...(lead?.customFields as object || {}),
      ...customFields
    };
  }
  
  // Update the lead
  await prisma.lead.update({
    where: { id: leadId },
    data: updateData
  });
}

// Create a task from a workflow
async function createTaskFromWorkflow(data: any, leadId: string) {
  const { title, description, dueDate, assignedToId, priority, status } = data;
  
  try {
    // Insert task directly with SQL to bypass Prisma client issues
    console.log(`Creating task: ${title} for lead ${leadId}`);
    await prisma.$executeRaw`
      INSERT INTO "Task" ("id", "title", "description", "dueDate", "assignedToId", "priority", "status", "leadId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${title}, ${description}, ${dueDate ? new Date(dueDate).toISOString() : null}, ${assignedToId}, ${priority || 'MEDIUM'}, ${status || 'PENDING'}, ${leadId}, now(), now())
    `;
  } catch (error) {
    console.error("Error creating task:", error);
  }
}

// Create an appointment from a workflow
async function createAppointmentFromWorkflow(data: any, leadId: string) {
  const { title, description, startTime, endTime, location, status } = data;
  
  await prisma.appointment.create({
    data: {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      status: status || 'SCHEDULED',
      leadId
    }
  });
}

// Send a notification to a user from a workflow
async function notifyUserFromWorkflow(data: any) {
  const { userId, title, message } = data;
  
  try {
    // Insert notification directly with SQL to bypass Prisma client issues
    console.log(`Creating notification for user ${userId}: ${title}`);
    await prisma.$executeRaw`
      INSERT INTO "Notification" ("id", "userId", "title", "message", "isRead", "createdAt")
      VALUES (gen_random_uuid(), ${userId}, ${title}, ${message}, false, now())
    `;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
  
  // In a real implementation, you might want to trigger a real-time notification
  // via websockets, push notifications, etc.
  console.log(`[Notification] To: ${userId}, Title: ${title}, Message: ${message}`);
}

// Generate AI content from a workflow
async function generateAIContentFromWorkflow(data: any, lead: any) {
  const { modelId, prompt, tone, length, outputAction, emailAccountId, subject } = data;
  
  // Replace lead variables in prompt
  const processedPrompt = prompt.replace(
    /{{lead\.([^}]+)}}/g, 
    (match: string, field: string) => lead[field] || match
  );
  
  // Generate content using your existing function
  const result = await generateEmailWithAIAction({
    prompt: processedPrompt,
    modelId,
    tone: tone || 'professional',
    length: length || 'medium'
  });
  
  // Perform action with generated content if specified
  if (outputAction === 'SEND_EMAIL' && result.content && emailAccountId) {
    await sendEmailAction({
      fromAccountId: emailAccountId,
      to: lead.email,
      subject: subject || `Generated email for ${lead.name || lead.email}`,
      body: result.content,
      leadId: lead.id
    });
  }
  
  return result.content;
}

// Analyze an email from a workflow
async function analyzeEmailFromWorkflow(data: any, leadId: string) {
  const { emailId, modelId } = data;
  
  if (!emailId) {
    throw new Error("Email ID is required for analysis");
  }
  
  try {
    // Get the latest email from the lead if no specific email ID is provided
    let emailToAnalyze = emailId;
    
    if (emailId === 'latest') {
      const latestEmail = await prisma.emailMessage.findFirst({
        where: { leadId },
        orderBy: { sentAt: 'desc' },
        select: { id: true }
      });
      
      if (!latestEmail) {
        throw new Error("No emails found for this lead");
      }
      
      emailToAnalyze = latestEmail.id;
    }
    
    // Analyze the email using the AI service
    const analysis = await analyzeEmailWithAI(emailToAnalyze);
    
    // Store the analysis results in a workflow log for reference
    await prisma.workflowActionLog.create({
      data: {
        leadId,
        workflowId: data.workflowId || '',
        nodeId: data.nodeId || '',
        actionType: ActionType.ANALYZE_EMAIL,
        data: {
          emailId: emailToAnalyze,
          analysis
        },
        status: 'SUCCESS'
      }
    });
    
    return analysis;
  } catch (error) {
    console.error("Error analyzing email:", error);
    
    // Log the failure
    await prisma.workflowActionLog.create({
      data: {
        leadId,
        workflowId: data.workflowId || '',
        nodeId: data.nodeId || '',
        actionType: ActionType.ANALYZE_EMAIL,
        data: {
          emailId,
          error: error instanceof Error ? error.message : String(error)
        },
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error)
      }
    });
    
    throw error;
  }
}

// Categorize a lead based on email analysis
async function categorizeLeadFromWorkflow(data: any, leadId: string) {
  const { 
    category, 
    emailId, 
    autoDetect = false, 
    rules = {},
    modelId
  } = data;
  
  // If a specific category is provided, update the lead directly
  if (category && !autoDetect) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: category,
        lastContactedAt: new Date(),
        customFields: {
          ...(await prisma.lead.findUnique({ where: { id: leadId } }))?.customFields as object || {},
          categorizedAt: new Date().toISOString(),
          categorizedBy: 'workflow',
          categoryReason: data.reason || 'Manual categorization through workflow'
        }
      }
    });
    
    await prisma.workflowActionLog.create({
      data: {
        leadId,
        workflowId: data.workflowId || '',
        nodeId: data.nodeId || '',
        actionType: ActionType.CATEGORIZE_LEAD,
        data: {
          category,
          reason: data.reason || 'Manual categorization'
        },
        status: 'SUCCESS'
      }
    });
    
    return;
  }
  
  // For auto-detection, we need to analyze the email content
  try {
    // Get the latest email if none specified
    let emailToAnalyze = emailId;
    
    if (!emailId || emailId === 'latest') {
      const latestEmail = await prisma.emailMessage.findFirst({
        where: { leadId },
        orderBy: { sentAt: 'desc' },
        select: { id: true }
      });
      
      if (!latestEmail) {
        throw new Error("No emails found for this lead");
      }
      
      emailToAnalyze = latestEmail.id;
    }
    
    // Get email content and analysis
    const email = await prisma.emailMessage.findUnique({
      where: { id: emailToAnalyze },
      select: {
        subject: true,
        body: true,
        analyzed: true,
        analysisResults: true
      }
    });
    
    if (!email) {
      throw new Error(`Email with ID ${emailToAnalyze} not found`);
    }
    
    let analysis: any = email.analysisResults;
    
    // If email hasn't been analyzed yet, analyze it
    if (!email.analyzed || !analysis) {
      const result = await analyzeEmailWithAI(emailToAnalyze);
      analysis = result;
    }
    
    // Determine lead category based on analysis
    let detectedCategory: LeadCategory;
    let categoryReason = '';
    
    // Get sentiment from analysis
    const sentiment = (analysis && typeof analysis === 'object' && analysis.sentiment) 
      ? analysis.sentiment.toString().toLowerCase() 
      : '';
    
    // Check for specific keywords in the email content
    const emailContent = (email.subject + ' ' + email.body).toLowerCase();
    const interestKeywords = ['interested', 'buy', 'purchase', 'when can', 'pricing', 'quote', 'demo', 'interested in'];
    const urgencyKeywords = ['asap', 'urgent', 'immediately', 'right away', 'soon'];
    
    // Apply categorization rules
    if (
      sentiment.includes('positive') ||
      interestKeywords.some(keyword => emailContent.includes(keyword)) ||
      urgencyKeywords.some(keyword => emailContent.includes(keyword))
    ) {
      detectedCategory = LeadCategory.HOT;
      categoryReason = 'Detected high interest or positive sentiment in email';
    } else if (sentiment.includes('neutral') || emailContent.includes('question') || emailContent.includes('more information')) {
      detectedCategory = LeadCategory.WARM;
      categoryReason = 'Detected moderate interest or questions in email';
    } else if (sentiment.includes('negative') || emailContent.includes('not interested') || emailContent.includes('unsubscribe')) {
      detectedCategory = LeadCategory.COLD;
      categoryReason = 'Detected low interest or negative sentiment in email';
    } else {
      detectedCategory = LeadCategory.NEW;
      categoryReason = 'Unable to categorize from email content';
    }
    
    // Update the lead with the detected category
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: detectedCategory as any, // Cast to any to avoid type conflicts
        lastContactedAt: new Date(),
        customFields: {
          ...(await prisma.lead.findUnique({ where: { id: leadId } }))?.customFields as object || {},
          categorizedAt: new Date().toISOString(),
          categorizedBy: 'ai',
          categoryReason: categoryReason
        }
      }
    });
    
    // Log the categorization action
    await prisma.workflowActionLog.create({
      data: {
        leadId,
        workflowId: data.workflowId || '',
        nodeId: data.nodeId || '',
        actionType: ActionType.CATEGORIZE_LEAD,
        data: {
          category: detectedCategory,
          reason: categoryReason,
          emailId: emailToAnalyze,
          analysis
        },
        status: 'SUCCESS'
      }
    });
    
    return detectedCategory;
  } catch (error) {
    console.error("Error categorizing lead:", error);
    
    // Log the failure
    await prisma.workflowActionLog.create({
      data: {
        leadId,
        workflowId: data.workflowId || '',
        nodeId: data.nodeId || '',
        actionType: ActionType.CATEGORIZE_LEAD,
        data: {
          error: error instanceof Error ? error.message : String(error)
        },
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error)
      }
    });
    
    throw error;
  }
} 