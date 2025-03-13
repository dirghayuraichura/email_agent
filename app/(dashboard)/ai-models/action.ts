'use server';

import { AIModel, AIProvider, ModelTest, ModelUsage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';
import { cookies } from "next/headers";
import { OpenAI } from "openai";
import { queryLlamaIndex } from "@/lib/llama-index";
import { optimizeForModel, estimateTokenCount } from "@/lib/prompt-optimizer";
import { generateWithOpenAI, generateWithLlamaIndex, ModelOptions, ModelResponse } from "@/lib/langchain-utils";
import axios from "axios";

// Define a global type for our in-memory storage
declare global {
  var modelUsage: Record<string, ModelUsage[]>;
} 

// Initialize global storage if not exists
if (!global.modelUsage) global.modelUsage = {};

// Get the current user from the database
async function getCurrentUser() {
  // For development purposes, return the first user in the database
  const user = await prisma.user.findFirst();
  //console.log(user);
  return user;
}

export async function getAIModels(): Promise<AIModel[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return await prisma.aIModel.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAIModelById(modelId: string): Promise<AIModel | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return await prisma.aIModel.findFirst({
    where: { 
      id: modelId,
      userId: user.id 
    },
  });
}

export async function createAIModel(model: {
  name: string;
  provider: AIProvider;
  modelId: string;
  endpoint?: string;
  apiKey?: string;
  parameters?: Record<string, any>;
  isDefault: boolean;
}): Promise<AIModel> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  // If this model is set as default, unset any existing default models
  if (model.isDefault) {
    await prisma.aIModel.updateMany({
      where: { 
        userId: user.id,
        isDefault: true 
      },
      data: { isDefault: false },
    });
  }
  
  const newModel = await prisma.aIModel.create({
    data: {
      name: model.name,
      provider: model.provider,
      modelId: model.modelId,
      endpoint: model.endpoint,
      apiKey: model.apiKey,
      parameters: model.parameters || {},
      isDefault: model.isDefault,
      userId: user.id,
    },
  });
  
  revalidatePath('/ai-models');
  return newModel;
}

export async function updateAIModel(
  modelId: string, 
  model: Partial<{
    name: string;
    provider: AIProvider;
    modelId: string;
    endpoint?: string;
    apiKey?: string;
    parameters?: Record<string, any>;
    isDefault: boolean;
  }>
): Promise<AIModel> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  // If this model is being set as default, unset any existing default models
  if (model.isDefault) {
    await prisma.aIModel.updateMany({
      where: { 
        userId: user.id,
        isDefault: true,
        id: { not: modelId }
      },
      data: { isDefault: false },
    });
  }
  
  const updatedModel = await prisma.aIModel.update({
    where: { 
      id: modelId,
      userId: user.id
    },
    data: {
      ...model,
      updatedAt: new Date(),
    },
  });
  
  revalidatePath('/ai-models');
  return updatedModel;
}

export async function deleteAIModel(modelId: string): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  // Check if the model exists and belongs to the user
  const model = await prisma.aIModel.findFirst({
    where: { 
      id: modelId,
      userId: user.id 
    },
  });
  
  if (!model) {
    throw new Error("Model not found or you don't have permission to delete it");
  }
  
  await prisma.aIModel.delete({
    where: { id: modelId },
  });
  
  revalidatePath('/ai-models');
}

export async function setDefaultAIModel(modelId: string): Promise<AIModel> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  // Unset any existing default models
  await prisma.aIModel.updateMany({
    where: { 
      userId: user.id,
      isDefault: true 
    },
    data: { isDefault: false },
  });
  
  // Set the new default model
  const updatedModel = await prisma.aIModel.update({
    where: { 
      id: modelId,
      userId: user.id 
    },
    data: { 
      isDefault: true,
      updatedAt: new Date(),
    },
  });
  
  revalidatePath('/ai-models');
  return updatedModel;
}

export async function testModel(modelId: string, prompt: string, optimize: boolean = true, useCase?: string): Promise<ModelTest> {
  try {
    const startTime = Date.now();
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    // Get the model
    const model = await prisma.aIModel.findFirst({
      where: { 
        id: modelId,
        userId: user.id 
      },
    });
    
    if (!model) {
      throw new Error("Model not found or you don't have permission to test it");
    }

    let response = "";
    let tokens = 0;
    let optimizedPrompt = prompt;
    let responseTime = 0;

    // Optimize the prompt if enabled
    if (optimize) {
      const modelType = model.provider === "OPENAI" ? 'openai' : 'llamaindex';
      optimizedPrompt = optimizeForModel(prompt, modelType);
      console.log(`Original prompt length: ${prompt.length}, Optimized: ${optimizedPrompt.length}`);
      console.log(`Estimated token reduction: ${estimateTokenCount(prompt) - estimateTokenCount(optimizedPrompt)}`);
    }

    try {
      // Prepare parameters with use case if provided
      const parameters = { 
        ...(model.parameters as Record<string, any> || {}),
        ...(useCase ? { use_case: useCase } : {})
      } as Record<string, any>;
      
      // Clean up the endpoint if provided
      let endpoint = model.endpoint;
      if (endpoint) {
        // Remove any trailing spaces
        endpoint = endpoint.trim();
        // Ensure the endpoint doesn't end with multiple slashes
        endpoint = endpoint.replace(/\/+$/, '');
      }
      
      console.log(`Testing model: ${model.name} (${model.provider}) with ID: ${model.modelId}`);
      if (endpoint) {
        console.log(`Using custom endpoint: ${endpoint}`);
      }
      
      // Prepare model options
      const modelOptions: ModelOptions = {
        apiKey: model.apiKey || "",
        modelId: model.modelId,
        provider: model.provider === "OPENAI" ? 'openai' : 'llamaindex',
        parameters: parameters,
        endpoint: endpoint || undefined,
        systemPrompt: useCase ? undefined : "You are a helpful AI assistant that provides clear, accurate, and detailed responses.",
        temperature: parameters.temperature as number | undefined,
        maxTokens: parameters.max_tokens as number | undefined
      };
      
      let result: ModelResponse;
      
      // Use the appropriate generator based on the provider
      if (model.provider === "OPENAI") {
        result = await generateWithOpenAI(optimizedPrompt, modelOptions);
      } else if (model.provider === "LLAMAINDEX") {
        result = await generateWithLlamaIndex(optimizedPrompt, modelOptions);
      } else {
        throw new Error(`Unsupported provider: ${model.provider}`);
      }
      
      response = result.response;
      tokens = result.tokens;
      responseTime = result.responseTime;
      
      // Track usage for billing/analytics (don't await to avoid slowing down response)
      if (tokens > 0) {
        trackModelUsage(modelId, tokens)
          .catch(err => console.error("Failed to track model usage:", err));
      }
    } catch (error: any) {
      console.error("API error:", error);
      throw new Error(`API error: ${error.message}`);
    }

    // Create a test record but don't store it
    return {
      id: uuidv4(),
      modelId,
      prompt, // Return the original prompt, not the optimized one
      response,
      tokens,
      responseTime,
      createdAt: new Date()
    } as ModelTest;
  } catch (error: any) {
    console.error("Error in testModel:", error);
    throw error;
  }
}

// This is the function that's being imported by test-tab.tsx
export async function testAIModel(modelId: string, prompt: string, optimize: boolean = true, useCase?: string) {
  try {
    // Set a timeout for the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), 10000); // 10 second timeout
    });

    // Race between the actual operation and the timeout
    const result = await Promise.race([
      testModel(modelId, prompt, optimize, useCase),
      timeoutPromise
    ]);

    return result;
  } catch (error: any) {
    console.error("Error in testAIModel:", error);
    
    // Return a fallback response if the operation fails
    return {
      id: uuidv4(),
      modelId,
      prompt,
      response: "Error: Unable to generate a response. Please try again.",
      tokens: 0,
      responseTime: 0,
      createdAt: new Date()
    } as ModelTest;
  }
}

export async function trackModelUsage(modelId: string, tokens: number, cost?: number): Promise<ModelUsage> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  // Get the model
  const model = await prisma.aIModel.findFirst({
    where: { 
      id: modelId,
      userId: user.id 
    },
  });
  
  if (!model) {
    throw new Error("Model not found or you don't have permission to track usage");
  }

  const usage = await prisma.modelUsage.create({
    data: {
      modelId,
      tokens,
      cost: cost || undefined,
    },
  });

  revalidatePath(`/ai-models/${modelId}`);
  return usage;
}

export async function getModelTests(modelId: string): Promise<ModelTest[]> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    // Return empty array since we're not storing test data
    return [];
  } catch (error) {
    console.error("Error in getModelTests:", error);
    return [];
  }
}

export async function getModelUsage(modelId: string): Promise<ModelUsage[]> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    try {
      const usage = await prisma.modelUsage.findMany({
        where: {
          modelId,
          model: {
            userId: user.id,
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: 30, // Limit to 30 days for performance
      });
      
      return usage;
    } catch (dbError) {
      console.error("Error fetching usage from database:", dbError);
      
      // Fallback to in-memory usage if database query fails
      if (global.modelUsage[modelId]) {
        return global.modelUsage[modelId].sort((a, b) => 
          b.date.getTime() - a.date.getTime()
        ).slice(0, 30);
      }
      
      return [];
    }
  } catch (error) {
    console.error("Error in getModelUsage:", error);
    return [];
  }
}

export async function addModel(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const provider = formData.get("provider") as AIProvider;
  const modelId = formData.get("modelId") as string;
  const apiKey = formData.get("apiKey") as string;

  if (!name || !provider || !modelId || !apiKey) {
    throw new Error("Missing required fields");
  }

  const model = await prisma.aIModel.create({
    data: {
      name,
      provider,
      modelId,
      apiKey,
      userId: user.id,
    },
  });

  revalidatePath("/ai-models");
  return model;
}

export async function updateModel(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const provider = formData.get("provider") as AIProvider;
  const modelId = formData.get("modelId") as string;
  const apiKey = formData.get("apiKey") as string;

  if (!id || !name || !provider || !modelId || !apiKey) {
    throw new Error("Missing required fields");
  }

  const model = await prisma.aIModel.update({
    where: {
      id,
      userId: user.id,
    },
    data: {
      name,
      provider,
      modelId,
      apiKey,
    },
  });

  revalidatePath("/ai-models");
  return model;
}

export async function deleteModel(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("Missing model ID");
  }

  await prisma.aIModel.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/ai-models");
}

export async function updateModelConfig(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const parameters = formData.get("parameters") as string;

  if (!id || !parameters) {
    throw new Error("Missing required fields");
  }

  const model = await prisma.aIModel.update({
    where: {
      id,
      userId: user.id,
    },
    data: {
      parameters: JSON.parse(parameters),
    },
  });

  revalidatePath(`/ai-models/${id}`);
  return model;
}

export async function trackUsage(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    const modelId = formData.get("modelId") as string;
    const tokens = parseInt(formData.get("tokens") as string);
    const cost = parseFloat(formData.get("cost") as string);

    if (!modelId || isNaN(tokens)) {
      throw new Error("Missing required fields");
    }

    // Create a usage record in memory first
    const usageRecord = {
      id: uuidv4(),
      modelId,
      tokens,
      cost: isNaN(cost) ? null : cost,
      date: new Date(),
      requests: 1,
      createdAt: new Date()
    } as ModelUsage;

    // Store in global memory
    if (!global.modelUsage[modelId]) {
      global.modelUsage[modelId] = [];
    }
    global.modelUsage[modelId].push(usageRecord);

    // Try to save to the database asynchronously
    prisma.modelUsage.create({
      data: {
        modelId,
        tokens,
        cost: isNaN(cost) ? null : cost,
      },
    }).then(() => {
      revalidatePath(`/ai-models/${modelId}`);
    }).catch(err => {
      console.error("Error saving usage to database:", err);
    });

    return usageRecord;
  } catch (error) {
    console.error("Error in trackUsage:", error);
    throw error;
  }
}

export async function testEndpoint(endpoint: string): Promise<{ valid: boolean; message: string }> {
  try {
    // Validate the endpoint format
    let cleanEndpoint = endpoint.trim();
    
    // Try to parse the URL to check if it's valid
    try {
      new URL(cleanEndpoint);
    } catch (error) {
      return { 
        valid: false, 
        message: "Invalid URL format. Please provide a complete URL including the protocol (https://)" 
      };
    }
    
    // Make a simple HEAD request to check if the endpoint is reachable
    try {
      await axios.head(cleanEndpoint, { timeout: 5000 });
      return { valid: true, message: "Endpoint is reachable" };
    } catch (error: any) {
      // If we get a 404 or other HTTP error, the endpoint is still reachable
      if (error.response) {
        return { valid: true, message: "Endpoint is reachable but returned status code: " + error.response.status };
      }
      
      // Network errors indicate the endpoint is not reachable
      return { 
        valid: false, 
        message: `Endpoint is not reachable: ${error.message}. Please check the URL and ensure the service is running.` 
      };
    }
  } catch (error: any) {
    return { valid: false, message: `Error testing endpoint: ${error.message}` };
  }
} 