/**
 * LlamaIndex API Integration
 * 
 * This file provides utility functions for interacting with LlamaIndex models.
 * It handles the API calls and response processing.
 */

import axios from 'axios';

interface LlamaIndexResponse {
  response: string;
  tokens: number;
  metadata?: any;
}

interface LlamaIndexOptions {
  apiKey: string;
  modelId: string;
  parameters?: Record<string, any>;
  endpoint?: string;
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

/**
 * Query a LlamaIndex model with the given prompt
 */
export async function queryLlamaIndex(
  prompt: string, 
  options: LlamaIndexOptions
): Promise<LlamaIndexResponse> {
  try {
    // Get parameters or use defaults
    const parameters = options.parameters || {};
    const temperature = parameters.temperature || 0.7;
    const maxTokens = parameters.max_tokens || 500;
    
    // Validate and normalize the endpoint URL
    // Use the provided endpoint or a sensible default
    const defaultEndpoint = "https://api.llamaindex.ai/v1/chat/completions";
    const endpoint = validateEndpoint(options.endpoint, defaultEndpoint);
    
    // Use the model ID from the options
    const modelId = options.modelId;
    
    console.log(`Querying LlamaIndex model ${modelId} at ${endpoint}`);
    
    // Prepare request payload according to LlamaIndex API requirements
    const requestPayload: LlamaIndexRequestPayload = {
      model: modelId,
      messages: [
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
    
    // Make API request to LlamaIndex using the provided API key
    const response = await axios.post(
      endpoint,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${options.apiKey}`
        }
      }
    );
    
    console.log("Response status:", response.status);
    
    // Extract response text and token usage
    const responseText = response.data.choices?.[0]?.message?.content || 
                         response.data.choices?.[0]?.text || 
                         "No response generated";
    
    const tokenUsage = response.data.usage?.total_tokens || 
                       Math.ceil((prompt.length + responseText.length) / 4);
    
    return {
      response: responseText,
      tokens: tokenUsage,
      metadata: {
        model: modelId,
        usage: response.data.usage
      }
    };
  } catch (error: any) {
    console.error("Error querying LlamaIndex:", error);
    
    // If the API call fails, provide a fallback response
    console.log("Falling back to simulated LlamaIndex response");
    
    // Generate a fallback response
    const fallbackResponse = `Based on your request: "${prompt.substring(0, 50)}...", 
    
Here's a detailed analysis:

The key points to consider are:
1. The specific context and requirements you've outlined
2. The best practices in this domain
3. Potential implementation strategies

I would recommend approaching this by first establishing clear objectives, then developing a structured plan that addresses all the critical aspects mentioned in your prompt.

Note: This is a fallback response as the LlamaIndex API call failed. Error: ${error.message}`;
    
    // Estimate token count (this is approximate)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(fallbackResponse.length / 4);
    
    return {
      response: fallbackResponse,
      tokens: inputTokens + outputTokens,
      metadata: {
        error: error.message,
        fallback: true
      }
    };
  }
} 