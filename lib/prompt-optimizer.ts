/**
 * Prompt Optimization Utilities
 * 
 * This file provides utilities for optimizing prompts to reduce token usage and costs.
 */

interface OptimizationOptions {
  maxLength?: number;
  removeRedundancy?: boolean;
  compressExamples?: boolean;
  focusKeywords?: string[];
}

/**
 * Optimize a prompt to reduce token usage while preserving intent
 */
export function optimizePrompt(prompt: string, options: OptimizationOptions = {}): string {
  // Set default options
  const opts = {
    maxLength: options.maxLength || 1000,
    removeRedundancy: options.removeRedundancy !== false,
    compressExamples: options.compressExamples !== false,
    focusKeywords: options.focusKeywords || []
  };

  let optimizedPrompt = prompt;

  // 1. Trim whitespace
  optimizedPrompt = optimizedPrompt.trim();

  // 2. Remove redundant phrases if enabled
  if (opts.removeRedundancy) {
    // Common redundant phrases to remove
    const redundantPhrases = [
      "I'm writing to ask",
      "I would like to know",
      "I was wondering if",
      "Could you please",
      "I need you to",
      "Please provide",
      "Can you tell me"
    ];

    for (const phrase of redundantPhrases) {
      optimizedPrompt = optimizedPrompt.replace(new RegExp(phrase, 'gi'), '');
    }
    
    // Remove duplicate words that appear consecutively
    optimizedPrompt = optimizedPrompt.replace(/\b(\w+)\s+\1\b/gi, '$1');
    
    // Clean up any double spaces created by removals
    optimizedPrompt = optimizedPrompt.replace(/\s{2,}/g, ' ').trim();
  }

  // 3. Compress examples if enabled
  if (opts.compressExamples) {
    // Look for patterns like "Example: ... End example" and compress them
    // Using a more compatible regex approach without 's' flag
    const exampleRegex = /example:([\s\S]+?)(?:end example|example end)/gi;
    optimizedPrompt = optimizedPrompt.replace(
      exampleRegex, 
      (match, exampleContent) => {
        // Keep only the first 50 characters of each example
        return `example: ${exampleContent.trim().substring(0, 50)}...`;
      }
    );
  }

  // 4. Truncate to max length if needed
  if (optimizedPrompt.length > opts.maxLength) {
    // If we have focus keywords, try to preserve content around them
    if (opts.focusKeywords.length > 0) {
      // This is a simplified approach - in a real implementation, you might
      // use more sophisticated NLP techniques to preserve semantic meaning
      
      // For now, we'll just ensure the first part and parts containing keywords are kept
      const firstPart = optimizedPrompt.substring(0, Math.floor(opts.maxLength * 0.3));
      let remainingLength = opts.maxLength - firstPart.length;
      let keywordParts = "";
      
      for (const keyword of opts.focusKeywords) {
        if (remainingLength <= 0) break;
        
        const keywordIndex = optimizedPrompt.indexOf(keyword);
        if (keywordIndex >= 0) {
          // Extract context around the keyword
          const start = Math.max(0, keywordIndex - 20);
          const end = Math.min(optimizedPrompt.length, keywordIndex + keyword.length + 20);
          const part = optimizedPrompt.substring(start, end);
          
          if (part.length <= remainingLength) {
            keywordParts += " " + part;
            remainingLength -= part.length + 1; // +1 for the space
          }
        }
      }
      
      optimizedPrompt = firstPart + keywordParts;
    } else {
      // Simple truncation if no keywords specified
      optimizedPrompt = optimizedPrompt.substring(0, opts.maxLength);
    }
  }

  return optimizedPrompt;
}

/**
 * Estimate the number of tokens in a text
 * This is a rough approximation - actual tokenization depends on the model
 */
export function estimateTokenCount(text: string): number {
  // A very rough approximation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

/**
 * Optimize a prompt specifically for a given model
 */
export function optimizeForModel(prompt: string, modelType: 'openai' | 'llamaindex'): string {
  switch (modelType) {
    case 'openai':
      // OpenAI-specific optimizations
      return optimizePrompt(prompt, {
        maxLength: 4000,
        removeRedundancy: true
      });
    
    case 'llamaindex':
      // LlamaIndex-specific optimizations
      return optimizePrompt(prompt, {
        maxLength: 2000,
        removeRedundancy: true,
        compressExamples: true
      });
    
    default:
      return prompt;
  }
} 