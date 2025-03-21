/**
 * Email Service
 * 
 * This service handles sending and receiving emails using nodemailer.
 * It supports different email providers and configurations.
 */

import nodemailer from 'nodemailer';
import { EmailAccount, EmailMessage, Attachment } from '@prisma/client';
import { prisma } from './prisma';
import { TransportOptions } from 'nodemailer';

// Define types for email sending
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Define types for email response
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Create a nodemailer transport for an email account
 */
export function createTransport(account: EmailAccount) {
  // Use explicit configuration if available
  if (account.host && account.port) {
    const transportConfig = {
      host: account.host || undefined,
      port: account.port || undefined,
      secure: account.secure || false,
      auth: {
        user: account.username || account.email,
        pass: account.password || '',
      }
    } as TransportOptions;
    return nodemailer.createTransport(transportConfig);
  }
  
  // Otherwise, use provider-specific configuration from credentials
  switch (account.provider) {
    case 'GMAIL':
      const gmailConfig = {
        service: 'gmail',
        auth: {
          user: account.username || account.email,
          pass: account.password || '',
        }
      } as TransportOptions;
      return nodemailer.createTransport(gmailConfig);
    
    case 'OUTLOOK':
      const outlookConfig = {
        service: 'outlook',
        auth: {
          user: account.username || account.email,
          pass: account.password || '',
        }
      } as TransportOptions;
      return nodemailer.createTransport(outlookConfig);
    
    case 'SMTP':
      // For SMTP, we should have explicit configuration
      if (!account.host || !account.port) {
        throw new Error('SMTP configuration requires host and port');
      }
      
      const smtpConfig = {
        host: account.host || undefined,
        port: account.port || undefined,
        secure: account.secure || false,
        auth: {
          user: account.username || account.email,
          pass: account.password || '',
        }
      } as TransportOptions;
      return nodemailer.createTransport(smtpConfig);
    
    case 'IMAP':
      // For IMAP, we need to use the credentials JSON
      if (!account.credentials) {
        throw new Error('IMAP configuration requires credentials');
      }
      
      const imapConfig = account.credentials as any;
      const imapConfigTransport = {
        host: imapConfig.host || undefined,
        port: imapConfig.port || undefined,
        secure: imapConfig.secure || false,
        auth: {
          user: imapConfig.user,
          pass: imapConfig.pass,
        },
      } as TransportOptions;
      return nodemailer.createTransport(imapConfigTransport);
    
    default:
      throw new Error(`Unsupported email provider: ${account.provider}`);
  }
}

/**
 * Send an email using a specific account
 */
export async function sendEmail(
  accountId: string,
  options: EmailOptions
): Promise<EmailResponse> {
  try {
    // Get the email account
    const account = await prisma.emailAccount.findUnique({
      where: { id: accountId },
    });
    
    if (!account) {
      throw new Error(`Email account not found: ${accountId}`);
    }
    
    if (!account.isActive) {
      throw new Error(`Email account is not active: ${accountId}`);
    }
    
    // Create transport
    const transport = createTransport(account);
    
    // Prepare email data
    const mailOptions = {
      from: account.fromName 
        ? `"${account.fromName}" <${account.email}>`
        : account.email,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(',') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc) : undefined,
      replyTo: options.replyTo,
      attachments: options.attachments,
    };
    
    // Send the email
    const info = await transport.sendMail(mailOptions);
    
    // Store the sent email in the database
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    // Create email message record
    const emailMessage = await prisma.emailMessage.create({
      data: {
        subject: options.subject,
        body: options.text || '',
        htmlBody: options.html,
        sentAt: new Date(),
        fromAccountId: account.id,
        // Note: We're not setting toAccountId here as it might not be in our system
        analyzed: false,
        // Store attachments if any
        attachments: options.attachments 
          ? {
              create: options.attachments.map(attachment => ({
                filename: attachment.filename,
                contentType: attachment.contentType || 'application/octet-stream',
                size: typeof attachment.content === 'string' 
                  ? Buffer.from(attachment.content).length 
                  : attachment.content.length,
                url: '', // We'll need to store attachments somewhere and get a URL
              }))
            }
          : undefined,
      },
    });
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get all email accounts for a user
 */
export async function getUserEmailAccounts(userId: string) {
  return prisma.emailAccount.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all emails for a user
 */
export async function getUserEmails(userId: string, options?: {
  limit?: number;
  offset?: number;
  filter?: 'sent' | 'received' | 'all';
}) {
  const { limit = 50, offset = 0, filter = 'all' } = options || {};
  
  // Get all email accounts for the user
  const accounts = await prisma.emailAccount.findMany({
    where: { userId },
    select: { id: true },
  });
  
  const accountIds = accounts.map(account => account.id);
  
  if (accountIds.length === 0) {
    return [];
  }
  
  // Build the where clause based on the filter
  let whereClause: any = {};
  
  if (filter === 'sent') {
    whereClause = { fromAccountId: { in: accountIds } };
  } else if (filter === 'received') {
    whereClause = { toAccountId: { in: accountIds } };
  } else {
    whereClause = {
      OR: [
        { fromAccountId: { in: accountIds } },
        { toAccountId: { in: accountIds } },
      ],
    };
  }
  
  // Get emails
  return prisma.emailMessage.findMany({
    where: whereClause,
    include: {
      fromAccount: true,
      toAccount: true,
      attachments: true,
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      sentAt: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Get a single email by ID
 */
export async function getEmailById(emailId: string, userId: string) {
  // Get all email accounts for the user
  const accounts = await prisma.emailAccount.findMany({
    where: { userId },
    select: { id: true },
  });
  
  const accountIds = accounts.map(account => account.id);
  
  if (accountIds.length === 0) {
    return null;
  }
  
  // Get the email
  return prisma.emailMessage.findFirst({
    where: {
      id: emailId,
      OR: [
        { fromAccountId: { in: accountIds } },
        { toAccountId: { in: accountIds } },
      ],
    },
    include: {
      fromAccount: true,
      toAccount: true,
      attachments: true,
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      replies: {
        include: {
          fromAccount: true,
          toAccount: true,
        },
      },
      parentMessage: {
        include: {
          fromAccount: true,
          toAccount: true,
        },
      },
    },
  });
}

/**
 * Create a new email account
 */
export async function createEmailAccount(data: {
  name: string;
  email: string;
  provider: 'GMAIL' | 'OUTLOOK' | 'SMTP' | 'IMAP';
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password: string;
  fromName?: string;
  userId: string;
}) {
  return prisma.emailAccount.create({
    data: {
      name: data.name,
      email: data.email,
      provider: data.provider,
      host: data.host || null,
      port: data.port || null,
      secure: data.secure || null,
      username: data.username || null,
      password: data.password,
      fromName: data.fromName,
      userId: data.userId,
    },
  });
}

/**
 * Update an email account
 */
export async function updateEmailAccount(
  accountId: string,
  userId: string,
  data: Partial<{
    name: string;
    email: string;
    provider: 'GMAIL' | 'OUTLOOK' | 'SMTP' | 'IMAP';
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    fromName: string;
    isActive: boolean;
  }>
) {
  return prisma.emailAccount.update({
    where: {
      id: accountId,
      userId,
    },
    data: {
      name: data.name,
      email: data.email,
      provider: data.provider,
      host: data.host || null,
      port: data.port || null,
      secure: data.secure || null,
      username: data.username || null,
      password: data.password,
      fromName: data.fromName,
      isActive: data.isActive,
    },
  });
}

/**
 * Delete an email account
 */
export async function deleteEmailAccount(accountId: string, userId: string) {
  return prisma.emailAccount.delete({
    where: {
      id: accountId,
      userId,
    },
  });
}

/**
 * Test an email account connection
 */
export async function testEmailAccount(account: {
  provider: 'GMAIL' | 'OUTLOOK' | 'SMTP' | 'IMAP';
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    // Create a temporary account object
    const tempAccount: EmailAccount = {
      id: 'temp',
      name: 'Test Account',
      email: account.email,
      provider: account.provider,
      host: account.host,
      port: account.port,
      secure: account.secure,
      username: account.username,
      password: account.password,
      userId: 'temp',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      fromName: null,
      credentials: null,
    };
    
    // Create transport
    const transport = createTransport(tempAccount);
    
    // Verify connection
    await transport.verify();
    
    return {
      success: true,
      message: 'Connection successful',
    };
  } catch (error: any) {
    console.error('Error testing email account:', error);
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
    };
  }
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  // Add other fields as needed
} 