"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { EmailProvider } from "@prisma/client";
import { cookies } from 'next/headers'

// Define types for AI generation
interface AIGenerationOptions {
  prompt: string;
  model: string;
  modelId: string;
  apiKey: string;
  tone?: string;
  length?: string;
}

interface AIGenerationResult {
  content: string;
  tokens?: number;
  responseTime?: number;
}

// Mock function for AI email generation until we implement the real one
async function generateEmailWithAI(options: AIGenerationOptions): Promise<AIGenerationResult> {
  console.log("Generating email with AI:", options);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let content = '';
  
  try {
    // In a real implementation, this would conditionally call different providers
    switch (options.model) {
      case 'OPENAI':
        // Mock OpenAI response
        content = `Dear recipient,

I hope this message finds you well. ${options.prompt}

The tone of this message is ${options.tone || 'professional'}, and it's ${options.length || 'medium'} in length.

Best regards,
AI Assistant`;
        break;
        
      case 'LLAMAINDEX':
        // Mock LlamaIndex response
        content = `Hello,

Here's a response to your prompt: ${options.prompt}

This was generated with a ${options.tone || 'professional'} tone.

Regards,
LlamaIndex AI`;
        break;
        
      default:
        // Default fallback
        content = `Here's a generated email based on your prompt: "${options.prompt}"

Dear recipient,

I hope this email finds you well. Based on your request, I've put together the following information.

${options.prompt}

Please let me know if you need any clarification or have additional questions.

Best regards,
AI Assistant`;
    }
    
    return {
      content,
      tokens: options.prompt.length * 2,
      responseTime: 1.2
    };
  } catch (error) {
    console.error("Error in mock AI generation:", error);
    
    // Return a fallback response
    return {
      content: `Here's a generated email based on your prompt: "${options.prompt}"`,
      tokens: 50,
      responseTime: 0.5
    };
  }
}

// Simple, reliable function to get the current user
export async function getCurrentUser() {
  // For development, just return the first admin user to simplify testing
  if (process.env.NODE_ENV === 'development') {
    const devUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (devUser) {
      console.log("🔧 Development mode: Using admin user:", devUser.email);
      return devUser;
    }
  }
  
  // For production, use the sessionToken cookie
  try {
    const sessionToken = cookies().get('sessionToken')?.value;
    
    if (!sessionToken) {
      console.error("No session token found in cookies");
      throw new Error("No session token");
    }
    
    // Find the session
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    });
    
    if (!session) {
      console.error("Session not found for token");
      throw new Error("Invalid session");
    }
    
    if (session.expires < new Date()) {
      console.error("Session expired");
      throw new Error("Session expired");
    }
    
    return session.user;
  } catch (error) {
    console.error("Authentication error:", error);
    
    // Don't rethrow - instead return a mock user for development
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ DEVELOPMENT MODE: Creating temporary user");
      return {
        id: "temp-user-id",
        email: "dev@example.com",
        name: "Development User",
        role: "ADMIN"
      };
    }
    
    throw new Error("Authentication required. Please sign in again.");
  }
}

// Get all email accounts for the current user
export async function getEmailAccounts() {
  const user = await getCurrentUser();
  
  const accounts = await prisma.emailAccount.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  return accounts;
}

// Get all emails for the current user
export async function getEmails({ filter = "all" }: { filter?: "all" | "sent" | "received" } = {}) {
  const user = await getCurrentUser();
  
  const whereClause: any = {
    OR: [
      {
        fromAccount: {
          userId: user.id,
        },
      },
      {
        toAccount: {
          userId: user.id,
        },
      },
    ],
  };
  
  if (filter === "sent") {
    whereClause.fromAccount = { userId: user.id };
    delete whereClause.OR;
  } else if (filter === "received") {
    whereClause.toAccount = { userId: user.id };
    delete whereClause.OR;
  }
  
  const emails = await prisma.emailMessage.findMany({
    where: whereClause,
    include: {
      fromAccount: true,
      toAccount: true,
      lead: true,
      attachments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  return emails;
}

// Get a single email by ID
export async function getEmail(id: string) {
  const user = await getCurrentUser();
  
  const email = await prisma.emailMessage.findFirst({
    where: {
      id,
      OR: [
        {
          fromAccount: {
            userId: user.id,
          },
        },
        {
          toAccount: {
            userId: user.id,
          },
        },
      ],
    },
    include: {
      fromAccount: true,
      toAccount: true,
      lead: true,
      attachments: true,
      // analysis: true, // This field doesn't exist in the schema
    },
  });
  
  if (!email) {
    throw new Error("Email not found or you don't have permission to view it");
  }
  
  return email;
}

// Send an email
export async function sendEmailAction(data: {
  fromAccountId: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  leadId?: string;
  replyToId?: string;
}) {
  const user = await getCurrentUser();
  
  // Get the email account
  const account = await prisma.emailAccount.findFirst({
    where: {
      id: data.fromAccountId,
      userId: user.id,
    },
  });
  
  if (!account) {
    throw new Error("Email account not found");
  }
  
  try {
    // Import nodemailer dynamically
    const nodemailer = require('nodemailer');
    
    // Parse credentials from the JSON field
    const credentials = account.credentials ? 
      (typeof account.credentials === 'string' ? 
        JSON.parse(account.credentials) : account.credentials) : {};
    
    // Create a configuration based on the provider
    let config: any = {};
    
    if (account.provider === 'GMAIL') {
      config = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: credentials.username || account.email,
          pass: credentials.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    } else if (account.provider === 'OUTLOOK') {
      config = {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: credentials.username || account.email,
          pass: credentials.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    } else {
      // Custom SMTP server
      if (!credentials.host || !credentials.port) {
        throw new Error("Host and port are required for custom SMTP servers");
      }
      
      config = {
        host: credentials.host,
        port: credentials.port,
        secure: credentials.secure ?? false,
        auth: {
          user: credentials.username || account.email,
          pass: credentials.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    }
    
    // Create a transporter
    const transporter = nodemailer.createTransport(config);
    
    // Create enhanced HTML body with unsubscribe link
    const enhancedHtmlBody = data.htmlBody || `<div style="font-family: Arial, sans-serif;">${data.body.replace(/\n/g, '<br>')}</div>`;
    
    // Check if this is a reply and get the parent message
    let parentMessage = null;
    let threadId = null;
    let inReplyTo = null;
    let references = null;
    
    if (data.replyToId) {
      try {
        parentMessage = await prisma.emailMessage.findUnique({
          where: { id: data.replyToId },
          select: { 
            id: true, 
            threadId: true, 
            messageId: true,
            subject: true
          }
        });
        
        // Use existing threadId, or use parent messageId as the threadId
        threadId = parentMessage?.threadId || parentMessage?.messageId;
        inReplyTo = parentMessage?.messageId;
        references = parentMessage?.messageId;
      } catch (error) {
        console.error("Error fetching parent message:", error);
      }
    }
    
    // Set up email data with better headers to avoid spam
    const mailOptions = {
      from: credentials.fromName ? 
        `"${credentials.fromName}" <${account.email}>` : 
        account.email,
      to: data.to,
      subject: data.subject,
      text: data.body,
      html: enhancedHtmlBody,
      ...(inReplyTo && { inReplyTo }),
      ...(references && { references }),
      headers: {
        'X-Priority': '3', // Normal priority
        'Precedence': 'bulk',
        'List-Unsubscribe': `<mailto:unsubscribe@${account.email.split('@')[1]}>`,
        'X-Mailer': 'Your CRM Platform'
      }
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    
    // Create a record in the database
    const email = await prisma.emailMessage.create({
      data: {
        subject: data.subject,
        body: data.body,
        htmlBody: enhancedHtmlBody,
        sentAt: new Date(),
        messageId: info.messageId,
        threadId: threadId || info.messageId, // Use existing threadId or create new one
        fromAccount: {
          connect: { id: data.fromAccountId }
        },
        ...(data.leadId && { lead: { connect: { id: data.leadId } } }),
        ...(data.replyToId && { parentMessage: { connect: { id: data.replyToId } } })
      },
      include: {
        fromAccount: true,
        lead: true,
        parentMessage: {
          include: {
            fromAccount: true,
            toAccount: true,
            lead: true,
            attachments: true,
          }
        }
      }
    });

    revalidatePath("/emails");
    return { ...email, sent: true };
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw new Error(error.message);
  }
}

// Create a new email account
export async function createEmailAccountAction(data: {
  name: string;
  email: string;
  provider: string;
  host?: string;
  port?: number;
  secure?: boolean;
  username: string;
  password: string;
  fromName?: string;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  active?: boolean;
}) {
  const user = await getCurrentUser();
  
  // Store sensitive information in the credentials JSON field
  const credentials = {
    username: data.username,
    password: data.password,
    host: data.host,
    port: data.port,
    secure: data.secure,
    fromName: data.fromName,
    imapHost: data.imapHost,
    imapPort: data.imapPort,
    imapSecure: data.imapSecure
  };
  
  // Prepare create data with correct types
  const createData: any = {
    name: data.name,
    email: data.email,
    provider: data.provider as EmailProvider,
    userId: user.id,
    credentials: credentials,
    isActive: data.active ?? true
  };
  
  const account = await prisma.emailAccount.create({
    data: createData,
  });
  
  revalidatePath("/settings/email-accounts");
  return account;
}

// Update an email account
export async function updateEmailAccountAction(id: string, data: {
  name?: string;
  email?: string;
  provider?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  fromName?: string;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  active?: boolean;
}) {
  const user = await getCurrentUser();
  
  // Check if the user owns the email account
  const existingAccount = await prisma.emailAccount.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });
  
  if (!existingAccount) {
    throw new Error("Email account not found or you don't have permission to update it");
  }
  
  // Parse existing credentials
  const existingCredentials = existingAccount.credentials ? 
    (typeof existingAccount.credentials === 'string' ? 
      JSON.parse(existingAccount.credentials) : existingAccount.credentials) : {};
  
  // Update credentials with new values if provided
  const updatedCredentials = {
    ...existingCredentials,
    ...(data.username !== undefined && { username: data.username }),
    ...(data.password !== undefined && { password: data.password }),
    ...(data.host !== undefined && { host: data.host }),
    ...(data.port !== undefined && { port: data.port }),
    ...(data.secure !== undefined && { secure: data.secure }),
    ...(data.fromName !== undefined && { fromName: data.fromName }),
    ...(data.imapHost !== undefined && { imapHost: data.imapHost }),
    ...(data.imapPort !== undefined && { imapPort: data.imapPort }),
    ...(data.imapSecure !== undefined && { imapSecure: data.imapSecure })
  };
  
  // Prepare update data with correct types
  const updateData: any = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.provider !== undefined) updateData.provider = data.provider as EmailProvider;
  if (data.active !== undefined) updateData.isActive = data.active;
  
  // Always update credentials to ensure they're properly stored
  updateData.credentials = updatedCredentials;
  
  const account = await prisma.emailAccount.update({
    where: {
      id,
    },
    data: updateData,
  });
  
  revalidatePath("/settings/email-accounts");
  return account;
}

// Delete an email account
export async function deleteEmailAccountAction(id: string) {
  const user = await getCurrentUser();
  
  // Check if the user owns the email account
  const existingAccount = await prisma.emailAccount.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });
  
  if (!existingAccount) {
    throw new Error("Email account not found or you don't have permission to delete it");
  }
  
  await prisma.emailAccount.delete({
    where: {
      id,
    },
  });
  
  revalidatePath("/settings/email-accounts");
  return { success: true };
}

// Test an email account connection
export async function testEmailAccountAction(data: {
  provider: string;
  host?: string;
  port?: number;
  secure?: boolean;
  username: string;
  email?: string;
  password: string;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
}) {
  try {
    // Import nodemailer dynamically to avoid server-side issues
    const nodemailer = require('nodemailer');
    
    // Create a test configuration based on the provider
    let config: any = {};
    
    if (data.provider === 'GMAIL') {
      config = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: data.username,
          pass: data.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    } else if (data.provider === 'OUTLOOK') {
      config = {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: data.username,
          pass: data.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    } else {
      // Custom SMTP server
      if (!data.host || !data.port) {
        throw new Error("Host and port are required for custom SMTP servers");
      }
      
      config = {
        host: data.host,
        port: data.port,
        secure: data.secure ?? false,
        auth: {
          user: data.username,
          pass: data.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    }
    
    // Create a transporter
    const transporter = nodemailer.createTransport(config);
    
    // Verify the connection
    await transporter.verify();
    
    // Return success with the credentials that should be stored
    const credentialsToStore = {
      username: data.username,
      password: data.password,
      host: data.host,
      port: data.port,
      secure: data.secure,
      imapHost: data.imapHost,
      imapPort: data.imapPort,
      imapSecure: data.imapSecure
    };
    
    return { 
      success: true, 
      message: "Connection successful! Your email account is properly configured.",
      credentials: credentialsToStore
    };
  } catch (error: any) {
    console.error("Email test connection error:", error);
    
    // Provide user-friendly error messages based on common SMTP errors
    let errorMessage = "Failed to connect to email server.";
    
    if (error.code === 'EAUTH') {
      errorMessage = "Authentication failed. Please check your username and password.";
    } else if (error.code === 'ESOCKET') {
      errorMessage = "Could not connect to the mail server. Please check your host and port settings.";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Connection timed out. The mail server is not responding.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      message: errorMessage,
      error: error.message
    };
  }
}

// Ensure a default AI model exists
async function ensureDefaultAIModel(userId: string) {
  // Check if a default model already exists
  let defaultModel = await prisma.aIModel.findFirst({
    where: {
      isDefault: true,
    },
  });
  
  // If not, create one
  if (!defaultModel) {
    defaultModel = await prisma.aIModel.create({
      data: {
        name: "Default OpenAI Model",
        provider: "OPENAI",
        modelId: "gpt-3.5-turbo",
        isDefault: true,
        userId: userId,
      },
    });
  }
  
  return defaultModel;
}

// Generate an email with AI
export async function generateEmailWithAIAction(data: {
  prompt: string;
  modelId: string;
  tone?: string;
  length?: string;
}) {
  const user = await getCurrentUser();
  
  // Get the AI model
  let model = await prisma.aIModel.findFirst({
    where: {
      id: data.modelId,
      OR: [
        { userId: user.id },
        { isDefault: true },
      ],
    },
  });
  
  // If model doesn't exist, try to get or create a default one
  if (!model) {
    model = await ensureDefaultAIModel(user.id);
  }
  
  if (!model) {
    throw new Error("AI model not found or you don't have permission to use it");
  }
  
  // Generate the email
  const result = await generateEmailWithAI({
    prompt: data.prompt,
    model: model.provider,
    modelId: model.modelId,
    apiKey: model.apiKey || "",
    tone: data.tone || "professional",
    length: data.length || "medium",
  });
  
  return result;
}

// Analyze an email with AI
export async function analyzeEmailWithAI(emailId: string) {
  const user = await getCurrentUser();
  
  // Get the email
  const email = await prisma.emailMessage.findFirst({
    where: {
      id: emailId,
      OR: [
        {
          fromAccount: {
            userId: user.id,
          },
        },
        {
          toAccount: {
            userId: user.id,
          },
        },
      ],
    },
  });
  
  if (!email) {
    throw new Error("Email not found or you don't have permission to analyze it");
  }
  
  // Get a default AI model
  let model = await prisma.aIModel.findFirst({
    where: {
      OR: [
        { userId: user.id },
        { isDefault: true },
      ],
    },
  });
  
  // If model doesn't exist, try to get or create a default one
  if (!model) {
    model = await ensureDefaultAIModel(user.id);
  }
  
  if (!model) {
    throw new Error("No default AI model found");
  }
  
  // Analyze the email
  const prompt = `
    Analyze the following email and provide:
    1. The overall sentiment (Positive, Neutral, or Negative)
    2. A brief summary (2-3 sentences)
    3. Key points (bullet points)
    4. Action items or next steps (if any)
    
    Email:
    Subject: ${email.subject}
    
    ${email.body}
  `;
  
  try {
    // Generate the analysis
    const result = await generateEmailWithAI({
      prompt,
      model: model.provider,
      modelId: model.modelId,
      apiKey: model.apiKey || "",
      tone: "analytical",
      length: "medium",
    });
    
    // Parse the result
    const analysis = parseAnalysisResult(result.content);
    
    // Save the analysis to the database - using the analysisResults field in EmailMessage
    await prisma.emailMessage.update({
      where: {
        id: emailId,
      },
      data: {
        analyzed: true,
        analysisResults: {
          sentiment: analysis.sentiment,
          summary: analysis.summary,
          keyPoints: analysis.keyPoints,
          actionItems: analysis.actionItems,
        },
      },
    });
    
    revalidatePath(`/emails/${emailId}`);
    return analysis;
  } catch (error) {
    console.error("Error analyzing email:", error);
    throw new Error("Failed to analyze email");
  }
}

// Helper function to parse the analysis result
function parseAnalysisResult(content: string) {
  // Default values
  const result = {
    sentiment: "Neutral",
    summary: "",
    keyPoints: [] as string[],
    actionItems: [] as string[],
  };
  
  // Try to extract sentiment
  const sentimentMatch = content.match(/sentiment:?\s*(positive|neutral|negative)/i);
  if (sentimentMatch) {
    result.sentiment = sentimentMatch[1].charAt(0).toUpperCase() + sentimentMatch[1].slice(1);
  }
  
  // Try to extract summary
  const summaryMatch = content.match(/summary:?\s*([^#]+)/i);
  if (summaryMatch) {
    result.summary = summaryMatch[1].trim();
  }
  
  // Try to extract key points
  const keyPointsMatch = content.match(/key points:?\s*([^#]+)/i);
  if (keyPointsMatch) {
    const keyPointsText = keyPointsMatch[1];
    const points = keyPointsText.split(/\n\s*[-•*]\s*/).filter(Boolean);
    result.keyPoints = points.map(point => point.trim());
  }
  
  // Try to extract action items
  const actionItemsMatch = content.match(/action items:?\s*([^#]+)/i);
  if (actionItemsMatch) {
    const actionItemsText = actionItemsMatch[1];
    const items = actionItemsText.split(/\n\s*[-•*]\s*/).filter(Boolean);
    result.actionItems = items.map(item => item.trim());
  }
  
  return result;
}

// Add this function to get emails in a thread
export async function getEmailThread(threadId: string) {
  const user = await getCurrentUser();
  
  // First, try to find the root email
  const rootEmail = await prisma.emailMessage.findFirst({
    where: {
      id: threadId,
      OR: [
        {
          fromAccount: {
            userId: user.id,
          },
        },
        {
          toAccount: {
            userId: user.id,
          },
        },
      ],
    },
    include: {
      fromAccount: true,
      toAccount: true,
      lead: true,
      attachments: true,
    },
  });

  if (!rootEmail) {
    return [];
  }

  // Get all related emails in the thread
  const threadEmails = await prisma.emailMessage.findMany({
    where: {
      AND: [
        {
          OR: [
            { threadId: rootEmail.threadId || rootEmail.messageId },
            { messageId: rootEmail.threadId },
            { parentMessageId: rootEmail.id }
          ]
        },
        {
          OR: [
            {
              fromAccount: {
                userId: user.id,
              },
            },
            {
              toAccount: {
                userId: user.id,
              },
            },
          ]
        }
      ]
    },
    include: {
      fromAccount: true,
      toAccount: true,
      lead: true,
      attachments: true,
      parentMessage: {
        include: {
          fromAccount: true,
          toAccount: true,
          lead: true,
          attachments: true,
        }
      }
    },
    orderBy: {
      sentAt: 'asc',
    },
  });

  // Combine root email with thread emails and remove duplicates
  const allEmails = [rootEmail, ...threadEmails];
  const uniqueEmails = allEmails.filter((email, index, self) =>
    index === self.findIndex((e) => e.id === email.id)
  );

  // Sort by date
  return uniqueEmails.sort((a, b) => {
    const dateA = a.sentAt || a.createdAt;
    const dateB = b.sentAt || b.createdAt;
    return dateA.getTime() - dateB.getTime();
  });
} 