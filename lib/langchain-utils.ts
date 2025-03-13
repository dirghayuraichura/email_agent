/**
 * LangChain Integration Utilities
 * 
 * This file provides utilities for working with LangChain to generate high-quality responses
 * from various LLM providers including OpenAI and LlamaIndex.
 */

import { ChatOpenAI } from "@langchain/openai";
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import axios from "axios";

// Define response types
export interface ModelResponse {
  response: string;
  tokens: number;
  responseTime: number;
  metadata?: any;
}

// Define model options
export interface ModelOptions {
  apiKey: string;
  modelId: string;
  provider: 'openai' | 'llamaindex';
  parameters?: Record<string, any>;
  endpoint?: string;
  systemPrompt?: string;
  promptTemplate?: string;
  temperature?: number;
  maxTokens?: number;
}

// System prompt templates for different use cases
export const SYSTEM_PROMPTS: Record<string, string> = {
  default: "You are a helpful AI assistant that provides clear, accurate, and detailed responses.",
  email: "You are an email writing assistant. Create professional, well-structured emails that are concise and effective. Focus on clarity and appropriate tone for the recipient.",
  creative: "You are a creative writing assistant with a flair for engaging, descriptive language. Generate content that is imaginative, evocative, and captivating.",
  technical: "You are a technical documentation specialist. Provide precise, well-structured explanations with accurate technical details. Use clear examples where appropriate.",
  customer_support: "You are a customer support specialist. Provide helpful, empathetic responses that address the customer's concerns directly. Be solution-oriented and clear.",
  marketing: "You are a marketing content specialist. Create compelling, persuasive content that highlights benefits and drives engagement. Focus on clear value propositions.",
};

// Add this helper function at the top of the file
function estimateTokenCount(text: string): number {
  // A simple estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

/**
 * Get the appropriate system prompt based on the use case
 */
function getSystemPrompt(options: ModelOptions): string {
  if (options.systemPrompt) {
    return options.systemPrompt;
  }
  
  // Check if parameters contain a use case
  const useCase = options.parameters?.use_case as string;
  if (useCase && useCase in SYSTEM_PROMPTS) {
    return SYSTEM_PROMPTS[useCase];
  }
  
  return SYSTEM_PROMPTS.default;
}

/**
 * Validate and normalize an API endpoint URL
 */
function validateEndpoint(endpoint: string | undefined, defaultEndpoint: string): string {
  if (!endpoint) {
    return defaultEndpoint;
  }
  
  try {
    // Check if the endpoint is a valid URL
    const url = new URL(endpoint);
    
    // Ensure the URL has a protocol
    if (!url.protocol || !['http:', 'https:'].includes(url.protocol)) {
      console.warn(`Invalid protocol in endpoint URL: ${endpoint}. Using default.`);
      return defaultEndpoint;
    }
    
    // Ensure the URL doesn't have trailing spaces
    const cleanUrl = endpoint.trim();
    
    // Ensure the URL doesn't end with multiple slashes
    return cleanUrl.replace(/\/+$/, '') + '/';
  } catch (error) {
    console.warn(`Invalid endpoint URL: ${endpoint}. Using default.`);
    return defaultEndpoint;
  }
}

/**
 * Generate a response using OpenAI
 */
export async function generateWithOpenAI(
  prompt: string,
  options: ModelOptions
): Promise<ModelResponse> {
  const startTime = Date.now();
  const {
    apiKey,
    modelId = "gpt-3.5-turbo",
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt = SYSTEM_PROMPTS.default,
    parameters = {}
  } = options;

  try {
    // Define the request payload type
    interface OpenAIRequestPayload {
      model: string;
      messages: { role: string; content: string }[];
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      [key: string]: any; // Allow for additional properties
    }
    
    // Prepare request payload according to OpenAI API requirements
    const requestPayload: OpenAIRequestPayload = {
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature
    };
    
    // Remove any undefined or null values from the payload
    Object.keys(requestPayload).forEach(key => {
      if (requestPayload[key] === undefined || requestPayload[key] === null) {
        delete requestPayload[key];
      }
    });
    
    // Add optional parameters if they exist and are not null/undefined
    if (parameters.top_p !== undefined && parameters.top_p !== null) {
      requestPayload.top_p = parameters.top_p;
    }
    
    if (parameters.frequency_penalty !== undefined && parameters.frequency_penalty !== null) {
      requestPayload.frequency_penalty = parameters.frequency_penalty;
    }
    
    if (parameters.presence_penalty !== undefined && parameters.presence_penalty !== null) {
      requestPayload.presence_penalty = parameters.presence_penalty;
    }
    
    // Log the request payload for debugging
    console.log("OpenAI request payload:", JSON.stringify(requestPayload, null, 2));
    
    const endpoint = "https://api.openai.com/v1/chat/completions";
    
    try {
      const response = await axios.post(endpoint, requestPayload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        }
      });
      
      console.log(`OpenAI API response status: ${response.status}`);
      
      // Extract response text and token usage
      let responseText = "";
      let promptTokens = 0;
      let completionTokens = 0;
      
      if (response.data.choices && response.data.choices.length > 0) {
        // Handle chat completion format
        if (response.data.choices[0].message) {
          responseText = response.data.choices[0].message.content;
        }
      }
      
      // Extract token usage if available
      if (response.data.usage) {
        promptTokens = response.data.usage.prompt_tokens || 0;
        completionTokens = response.data.usage.completion_tokens || 0;
      }
      
      return {
        response: responseText,
        tokens: promptTokens + completionTokens,
        responseTime: (Date.now() - startTime) / 1000,
        metadata: {
          model: modelId,
          provider: 'openai'
        }
      };
    } catch (error: any) {
      console.error("Error calling OpenAI API:", error);
      
      // Log detailed error information if available
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Request made but no response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      
      // Provide a fallback response
      return {
        response: `Error: Unable to generate response from OpenAI API. ${error.message}`,
        tokens: estimateTokenCount(prompt) + 50, // Estimate token count
        responseTime: (Date.now() - startTime) / 1000,
        metadata: {
          model: modelId,
          provider: 'openai',
          error: error.message,
          fallback: true
        }
      };
    }
  } catch (error: any) {
    console.error("Error generating with OpenAI:", error);
    return {
      response: `Error: ${error.message}`,
      tokens: estimateTokenCount(prompt) + 20,
      responseTime: (Date.now() - startTime) / 1000,
      metadata: {
        model: modelId,
        provider: 'openai',
        error: error.message
      }
    };
  }
}

/**
 * Generate a response using LangChain with LlamaIndex
 */
export async function generateWithLlamaIndex(
  prompt: string,
  options: ModelOptions
): Promise<ModelResponse> {
  const startTime = Date.now();
  
  try {
    // Get parameters or use defaults
    const parameters = options.parameters || {};
    const temperature = parameters.temperature || 0.7;
    const maxTokens = parameters.max_tokens || 500;
    
    // Get the appropriate system prompt
    const systemPrompt = getSystemPrompt(options);
    
    // Validate and normalize the endpoint URL
    // Use the provided endpoint or a sensible default
    const defaultEndpoint = "https://api.llamaindex.ai/v1/chat/completions";
    const endpoint = validateEndpoint(options.endpoint, defaultEndpoint);
    
    // Use the model ID from the options
    const modelId = options.modelId;
    
    console.log(`Calling LlamaIndex API at: ${endpoint} with model: ${modelId}`);
    
    // Define the request payload type
    interface LlamaIndexRequestPayload {
      model: string;
      messages: { role: string; content: string }[];
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      [key: string]: any; // Allow for additional properties
    }
    
    // Prepare request payload according to LlamaIndex API requirements
    const requestPayload: LlamaIndexRequestPayload = {
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature
    };
    
    // Remove any undefined or null values from the payload
    Object.keys(requestPayload).forEach(key => {
      if (requestPayload[key] === undefined || requestPayload[key] === null) {
        delete requestPayload[key];
      }
    });
    
    // Add optional parameters if they exist and are not null/undefined
    if (parameters.top_p !== undefined && parameters.top_p !== null) {
      requestPayload.top_p = parameters.top_p;
    }
    
    if (parameters.frequency_penalty !== undefined && parameters.frequency_penalty !== null) {
      requestPayload.frequency_penalty = parameters.frequency_penalty;
    }
    
    if (parameters.presence_penalty !== undefined && parameters.presence_penalty !== null) {
      requestPayload.presence_penalty = parameters.presence_penalty;
    }
    
    // Log the request payload for debugging
    console.log("Request payload:", JSON.stringify(requestPayload, null, 2));
    
    try {
      const response = await axios.post(endpoint, requestPayload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${options.apiKey}`
        }
      });
      
      console.log(`LlamaIndex API response status: ${response.status}`);
      
      // Extract response text and token usage
      let responseText = "";
      let promptTokens = 0;
      let completionTokens = 0;
      
      if (response.data.choices && response.data.choices.length > 0) {
        // Handle chat completion format
        if (response.data.choices[0].message) {
          responseText = response.data.choices[0].message.content;
        } 
        // Handle regular completion format
        else if (response.data.choices[0].text) {
          responseText = response.data.choices[0].text;
        }
      }
      
      // Extract token usage if available
      if (response.data.usage) {
        promptTokens = response.data.usage.prompt_tokens || 0;
        completionTokens = response.data.usage.completion_tokens || 0;
      }
      
      return {
        response: responseText,
        tokens: promptTokens + completionTokens,
        responseTime: (Date.now() - startTime) / 1000,
        metadata: {
          model: modelId,
          provider: 'llamaindex',
          usage: response.data.usage,
          systemPrompt: systemPrompt.substring(0, 50) + "..."
        }
      };
    } catch (error: any) {
      console.error("Error calling LlamaIndex API:", error);
      
      // Log detailed error information if available
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Request made but no response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      
      // Provide a fallback response
      return {
        response: `Error: Unable to generate response from LlamaIndex API. ${error.message}`,
        tokens: estimateTokenCount(prompt) + 50, // Estimate token count
        responseTime: (Date.now() - startTime) / 1000,
        metadata: {
          model: modelId,
          provider: 'llamaindex',
          error: error.message,
          fallback: true
        }
      };
    }
  } catch (error: any) {
    console.error("Error generating with LlamaIndex:", error);
    
    // Fallback to a simulated response if the API call fails
    console.log("Falling back to simulated LlamaIndex response");
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a fallback response
    const fallbackResponse = `Based on your request: "${prompt.substring(0, 50)}...", 
    
Here's a detailed analysis:

The key points to consider are:
1. The specific context and requirements you've outlined
2. The best practices in this domain
3. Potential implementation strategies

I would recommend approaching this by first establishing clear objectives, then developing a structured plan that addresses all the critical aspects mentioned in your prompt. This ensures a comprehensive solution that meets your needs while maintaining flexibility for future adjustments.

Note: This is a fallback response as the LlamaIndex API call failed. Error: ${error.message}`;
    
    // Calculate response time
    const responseTime = (Date.now() - startTime) / 1000;
    
    // Estimate token count (this is approximate)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(fallbackResponse.length / 4);
    
    return {
      response: fallbackResponse,
      tokens: inputTokens + outputTokens,
      responseTime,
      metadata: {
        model: options.modelId,
        provider: 'llamaindex',
        error: error.message,
        fallback: true
      }
    };
  }
}

/**
 * Generate a response using the appropriate LangChain integration based on provider
 */
export async function generateWithLangChain(
  prompt: string,
  options: ModelOptions
): Promise<ModelResponse> {
  switch (options.provider) {
    case 'openai':
      return generateWithOpenAI(prompt, options);
    case 'llamaindex':
      return generateWithLlamaIndex(prompt, options);
    default:
      throw new Error(`Unsupported provider: ${options.provider}`);
  }
} 