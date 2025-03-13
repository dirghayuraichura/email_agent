"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { updateAIModel } from "../action"
import { AIModel } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

type ParameterConfig = {
  name: string
  description: string
  min?: number
  max?: number
  step?: number
  default: number
}

// Common parameters for different model providers
const commonParameters: Record<string, ParameterConfig[]> = {
  OPENAI: [
    {
      name: "temperature",
      description: "Controls randomness: lower values are more deterministic, higher values more random",
      min: 0,
      max: 2,
      step: 0.1,
      default: 0.7,
    },
    {
      name: "max_tokens",
      description: "Maximum number of tokens to generate",
      min: 1,
      max: 4096,
      step: 1,
      default: 500,
    },
    {
      name: "top_p",
      description: "Nucleus sampling: consider only tokens with top_p probability mass",
      min: 0,
      max: 1,
      step: 0.05,
      default: 1,
    },
    {
      name: "frequency_penalty",
      description: "Decreases likelihood of repeating the same tokens",
      min: -2,
      max: 2,
      step: 0.1,
      default: 0,
    },
    {
      name: "presence_penalty",
      description: "Increases likelihood of discussing new topics",
      min: -2,
      max: 2,
      step: 0.1,
      default: 0,
    },
  ],
  ANTHROPIC: [
    {
      name: "temperature",
      description: "Controls randomness: lower values are more deterministic, higher values more random",
      min: 0,
      max: 1,
      step: 0.1,
      default: 0.7,
    },
    {
      name: "max_tokens_to_sample",
      description: "Maximum number of tokens to generate",
      min: 1,
      max: 4096,
      step: 1,
      default: 500,
    },
    {
      name: "top_p",
      description: "Nucleus sampling: consider only tokens with top_p probability mass",
      min: 0,
      max: 1,
      step: 0.05,
      default: 1,
    },
    {
      name: "top_k",
      description: "Only sample from the top K options for each subsequent token",
      min: 0,
      max: 500,
      step: 1,
      default: 50,
    },
  ],
  LLAMAINDEX: [
    {
      name: "temperature",
      description: "Controls randomness: lower values are more deterministic, higher values more random",
      min: 0,
      max: 2,
      step: 0.1,
      default: 0.7,
    },
    {
      name: "max_tokens",
      description: "Maximum number of tokens to generate",
      min: 1,
      max: 4096,
      step: 1,
      default: 500,
    },
    {
      name: "top_p",
      description: "Nucleus sampling: consider only tokens with top_p probability mass",
      min: 0,
      max: 1,
      step: 0.05,
      default: 1,
    },
  ],
  CUSTOM: [
    {
      name: "temperature",
      description: "Controls randomness: lower values are more deterministic, higher values more random",
      min: 0,
      max: 2,
      step: 0.1,
      default: 0.7,
    },
    {
      name: "max_tokens",
      description: "Maximum number of tokens to generate",
      min: 1,
      max: 4096,
      step: 1,
      default: 500,
    },
  ],
}

export function AdvancedConfigTab({ model }: { model: AIModel }) {
  const [parameters, setParameters] = useState<Record<string, number>>(
    (model.parameters as Record<string, number>) || {}
  )
  const [rawJson, setRawJson] = useState<string>(JSON.stringify(model.parameters || {}, null, 2))
  const [isJsonMode, setIsJsonMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Get the appropriate parameter configs for this model provider
  const parameterConfigs = commonParameters[model.provider] || commonParameters.CUSTOM

  const handleParameterChange = (name: string, value: number) => {
    setParameters((prev) => {
      const updated = { ...prev, [name]: value }
      setRawJson(JSON.stringify(updated, null, 2))
      return updated
    })
  }

  const handleRawJsonChange = (json: string) => {
    setRawJson(json)
    try {
      const parsed = JSON.parse(json)
      setParameters(parsed)
    } catch (error) {
      // Invalid JSON, don't update parameters
    }
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      let parsedParameters: Record<string, any>

      if (isJsonMode) {
        try {
          parsedParameters = JSON.parse(rawJson)
        } catch (error) {
          toast({
            title: "Invalid JSON",
            description: "The parameters field contains invalid JSON.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      } else {
        parsedParameters = parameters
      }

      await updateAIModel(model.id, {
        parameters: parsedParameters,
      })

      toast({
        title: "Parameters saved",
        description: "Model parameters have been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error saving parameters:", error)
      toast({
        title: "Error",
        description: "Failed to save parameters. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Parameters</CardTitle>
        <CardDescription>Fine-tune your model's behavior with these parameters.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJsonMode(!isJsonMode)}
            className="text-xs"
          >
            {isJsonMode ? "Switch to UI Mode" : "Switch to JSON Mode"}
          </Button>
        </div>

        {isJsonMode ? (
          <div className="space-y-2">
            <Label htmlFor="rawJson">Raw Parameters (JSON)</Label>
            <Textarea
              id="rawJson"
              value={rawJson}
              onChange={(e) => handleRawJsonChange(e.target.value)}
              className="font-mono min-h-[300px]"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {parameterConfigs.map((config) => (
              <div key={config.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={config.name}>
                    {config.name}: {parameters[config.name] ?? config.default}
                  </Label>
                  <span className="text-sm text-muted-foreground">{config.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id={config.name}
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={parameters[config.name] ?? config.default}
                    onChange={(e) => handleParameterChange(config.name, Number(e.target.value))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={parameters[config.name] ?? config.default}
                    onChange={(e) => handleParameterChange(config.name, Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                {config.min !== undefined && config.max !== undefined && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{config.min}</span>
                    <span>{config.max}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Parameters
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 