/**
 * A/B Testing for AI-Generated Emails
 * 
 * This module enables creating and analyzing A/B tests for AI-generated email content.
 */

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./action";
import { generateEmailWithAIAction } from "./action";

interface ABTestVariant {
  id: string;
  name: string;
  subject?: string;
  body: string;
  modelId: string;
  parameters?: Record<string, any>;
}

interface ABTestResults {
  testId: string;
  variants: {
    id: string;
    name: string;
    sent: number;
    opens: number;
    clicks: number;
    replies: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  }[];
  winner?: string;
  status: 'running' | 'completed' | 'scheduled';
  confidence: number;
}

// Fix: Define the ABTest model interfaces to match Prisma schema
interface ABTestVariantStats {
  sent: number;
  opens: number;
  clicks: number;
  replies: number;
}

interface ABTestVariantWithStats {
  id: string;
  name: string;
  subject?: string;
  body: string;
  modelId: string;
  parameters: Record<string, any>;
  splitPercentage: number;
  stats?: ABTestVariantStats;
}

interface ABTestModel {
  id: string;
  name: string;
  userId: string;
  audienceId?: string;
  totalEmails: number;
  startDate: Date;
  endDate?: Date;
  status: 'running' | 'completed' | 'scheduled';
  variants: ABTestVariantWithStats[];
}

export async function createABTest(params: {
  name: string;
  audienceId?: string;
  variants: Omit<ABTestVariant, 'id'>[];
  splitRatio?: number[];
  totalEmails: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const user = await getCurrentUser();
  
  // Validate parameters
  if (!params.variants || params.variants.length < 2) {
    throw new Error("At least two variants are required for A/B testing");
  }
  
  if (params.splitRatio && params.splitRatio.length !== params.variants.length) {
    throw new Error("Split ratio must match the number of variants");
  }
  
  // Create default split ratio if not provided
  const splitRatio = params.splitRatio || 
    params.variants.map(() => 100 / params.variants.length);
  
  // Ensure split ratio sums to 100
  const sum = splitRatio.reduce((acc, ratio) => acc + ratio, 0);
  if (Math.abs(sum - 100) > 0.1) {
    throw new Error("Split ratio must sum to 100");
  }
  
  // Fix: Use the correct Prisma schema or create a custom implementation
  // This is a mock implementation until the Prisma schema is updated
  // In a real app, you would add the ABTest model to the Prisma schema
  const test = {
    id: `abtest-${Date.now()}`,
    name: params.name,
    userId: user.id,
    audienceId: params.audienceId,
    totalEmails: params.totalEmails,
    startDate: params.startDate || new Date(),
    endDate: params.endDate,
    status: params.startDate && params.startDate > new Date() ? 'scheduled' : 'running',
    variants: params.variants.map((variant, index) => ({
      id: `variant-${index}`,
      name: variant.name,
      subject: variant.subject,
      body: variant.body,
      modelId: variant.modelId,
      parameters: variant.parameters || {},
      splitPercentage: splitRatio[index]
    }))
  };
  
  // In a real implementation, you would save this to the database
  
  return test;
}

export async function generateABTestVariants(params: {
  basePrompt: string;
  modelId: string;
  numberOfVariants: number;
  parameters?: {
    tones?: string[];
    lengths?: string[];
    styles?: string[];
  }
}): Promise<ABTestVariant[]> {
  const user = await getCurrentUser();
  
  // Generate variations based on parameters
  const variants: ABTestVariant[] = [];
  
  // Default parameters if not provided
  const tones = params.parameters?.tones || ['professional', 'friendly', 'persuasive'];
  const lengths = params.parameters?.lengths || ['short', 'medium'];
  const styles = params.parameters?.styles || ['direct', 'storytelling'];
  
  // Generate variants by combining different parameters
  for (let i = 0; i < params.numberOfVariants && variants.length < params.numberOfVariants; i++) {
    const tone = tones[i % tones.length];
    const length = lengths[i % lengths.length];
    const style = styles[i % styles.length];
    
    const prompt = `
      ${params.basePrompt}
      
      Please write this email with a ${tone} tone, in a ${length} length, using a ${style} style.
    `;
    
    try {
      const result = await generateEmailWithAIAction({
        prompt,
        modelId: params.modelId,
        tone,
        length
      });
      
      variants.push({
        id: `variant-${variants.length + 1}`,
        name: `Variant ${variants.length + 1} (${tone}, ${length}, ${style})`,
        body: result.content,
        modelId: params.modelId,
        parameters: {
          tone,
          length,
          style
        }
      });
    } catch (error) {
      console.error("Error generating variant:", error);
    }
  }
  
  return variants;
}

export async function getABTestResults(testId: string): Promise<ABTestResults> {
  const user = await getCurrentUser();
  
  // Fix: Use the correct Prisma schema or create a custom implementation
  // This is a mock implementation until the Prisma schema is updated
  const test = await findABTest(testId, user.id);
  
  if (!test) {
    throw new Error("A/B test not found");
  }
  
  // Fix: Add proper type annotations to variant
  const variantResults = test.variants.map((variant: ABTestVariantWithStats) => {
    const sent = variant.stats?.sent || 0;
    const opens = variant.stats?.opens || 0;
    const clicks = variant.stats?.clicks || 0;
    const replies = variant.stats?.replies || 0;
    
    return {
      id: variant.id,
      name: variant.name,
      sent,
      opens,
      clicks,
      replies,
      openRate: sent > 0 ? (opens / sent) * 100 : 0,
      clickRate: opens > 0 ? (clicks / opens) * 100 : 0,
      replyRate: sent > 0 ? (replies / sent) * 100 : 0
    };
  });
  
  // Determine winner if test is completed
  let winner: string | undefined = undefined;
  let confidence = 0;
  
  if (test.status === 'completed') {
    // Fix: Add proper type annotations
    const highestOpenRate = Math.max(...variantResults.map((v: any) => v.openRate));
    const winningVariant = variantResults.find((v: any) => v.openRate === highestOpenRate);
    
    if (winningVariant) {
      winner = winningVariant.id;
      
      // Fix: Add proper type annotations
      const totalOpens = variantResults.reduce((sum: number, v: any) => sum + v.opens, 0);
      const winnerOpens = winningVariant.opens;
      confidence = totalOpens > 0 ? (winnerOpens / totalOpens) * 100 : 0;
    }
  }
  
  return {
    testId,
    variants: variantResults,
    winner,
    status: test.status,
    confidence
  };
}

// Helper function to find an AB test (mock implementation)
async function findABTest(testId: string, userId: string): Promise<ABTestModel | null> {
  // In a real implementation, this would query the database
  return null;
} 