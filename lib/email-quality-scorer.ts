/**
 * Email Quality Scoring System
 * 
 * This module provides functionality to evaluate and score emails based on multiple
 * quality factors to help users improve their email communication.
 */

import { generateWithOpenAI } from "./langchain-utils";

interface EmailQualityScore {
  overall: number;  // 0-100 overall score
  clarity: number;  // 0-10 clarity score
  tone: number;     // 0-10 tone appropriateness score
  engagement: number; // 0-10 engagement score
  grammar: number;  // 0-10 grammar score
  length: number;   // 0-10 appropriate length score
  personalization: number; // 0-10 personalization score
  callToAction: number; // 0-10 call to action score
  feedback: string[]; // Specific improvement suggestions
}

// Fix: Add interface for email content
interface EmailContent {
  subject?: string;
  body: string;
}

export async function scoreEmailQuality(
  // Fix: Update parameter type to accept both string and EmailContent
  emailContent: string | EmailContent,
  modelId: string,
  apiKey: string,
  context?: {
    purpose?: string;
    audience?: string;
    industry?: string;
  }
): Promise<EmailQualityScore> {
  // Fix: Handle both string and EmailContent
  const emailSubject = typeof emailContent === 'string' 
    ? '[No subject]' 
    : (emailContent.subject || '[No subject]');
  
  const emailBody = typeof emailContent === 'string'
    ? emailContent
    : emailContent.body;
  
  const prompt = `
    Please evaluate the following email and provide quality scores on a scale of 0-10 for each category.
    Also provide 2-3 specific suggestions for improvement.
    
    Categories to score:
    - Clarity: How clear and understandable is the message?
    - Tone: Is the tone appropriate for the audience and purpose?
    - Engagement: How engaging and interesting is the content?
    - Grammar: Are there any grammatical or spelling errors?
    - Length: Is the email appropriately concise or detailed?
    - Personalization: How well is the email personalized to the recipient?
    - Call to Action: Is there a clear next step or call to action?
    
    ${context ? `
    Additional context:
    - Purpose: ${context.purpose || 'Not specified'}
    - Audience: ${context.audience || 'Not specified'}
    - Industry: ${context.industry || 'Not specified'}
    ` : ''}
    
    EMAIL TO EVALUATE:
    Subject: ${emailSubject}
    
    ${emailBody}
    
    Format your response as JSON:
    {
      "clarity": score,
      "tone": score,
      "engagement": score,
      "grammar": score,
      "length": score,
      "personalization": score,
      "callToAction": score,
      "overall": weightedAverageScore,
      "feedback": ["suggestion1", "suggestion2", "suggestion3"]
    }
  `;
  
  try {
    // Use the AI model to analyze the email
    const result = await generateWithOpenAI(prompt, {
      apiKey,
      modelId,
      provider: 'openai',
      temperature: 0.3, // Lower temperature for more consistent scoring
      systemPrompt: "You are an expert email quality analyzer with years of experience in professional communication."
    });
    
    // Parse the JSON response
    const responseText = result.response;
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                     responseText.match(/{[\s\S]*}/);
                     
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON response from the model");
    }
    
    const jsonString = jsonMatch[1] || jsonMatch[0];
    const scores = JSON.parse(jsonString.trim());
    
    // Ensure all required fields are present
    return {
      overall: scores.overall || calculateOverallScore(scores),
      clarity: scores.clarity || 5,
      tone: scores.tone || 5,
      engagement: scores.engagement || 5,
      grammar: scores.grammar || 5,
      length: scores.length || 5,
      personalization: scores.personalization || 5,
      callToAction: scores.callToAction || 5,
      feedback: scores.feedback || ["No specific suggestions provided."]
    };
  } catch (error) {
    console.error("Error scoring email quality:", error);
    
    // Return default values if there's an error
    return {
      overall: 50,
      clarity: 5,
      tone: 5,
      engagement: 5,
      grammar: 5,
      length: 5,
      personalization: 5,
      callToAction: 5,
      feedback: ["Error analyzing email quality. Please try again."]
    };
  }
}

// Calculate a weighted overall score from individual scores
function calculateOverallScore(scores: any): number {
  const weights = {
    clarity: 0.2,
    tone: 0.15,
    engagement: 0.15,
    grammar: 0.1,
    length: 0.1,
    personalization: 0.15,
    callToAction: 0.15
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const [category, weight] of Object.entries(weights)) {
    if (scores[category] !== undefined) {
      weightedSum += scores[category] * (weight as number);
      totalWeight += weight as number;
    }
  }
  
  // Normalize to 0-100 scale
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) : 50;
} 