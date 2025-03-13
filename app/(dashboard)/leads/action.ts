'use server';

import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import { Lead as PrismaLead, LeadStatus } from "@prisma/client";

// We'll use the Prisma Lead type directly
export type { PrismaLead as Lead };

export async function deleteLead(leadId: string) {
  await prisma.lead.delete({
    where: { id: leadId },
  });
}

export async function getLeads(): Promise<PrismaLead[]> {
  return await prisma.lead.findMany();
}

export async function createLead(lead: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source?: string;
  notes?: string;
  tags: string[];
}): Promise<PrismaLead> {
  const newLead = await prisma.lead.create({
    data: {
      ...lead,
    },
  });
  
  return newLead;
}

export async function updateLead(leadId: string, lead: Partial<{
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: LeadStatus;
  source?: string;
  notes?: string;
  tags?: string[];
  lastContactedAt?: Date;
}>): Promise<PrismaLead> {
  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: lead,
  });
  
  return updatedLead;
}

export async function getLeadById(leadId: string): Promise<PrismaLead | null> {
  return await prisma.lead.findUnique({
    where: { id: leadId },
  });
}

