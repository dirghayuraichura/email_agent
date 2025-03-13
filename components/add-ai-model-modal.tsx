"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Bot, Key, Server, Info, Check } from "lucide-react"

// Define model options for different providers
const modelOptions = {
  OPENAI: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  ],
  ANTHROPIC: [
    { id: "claude-3-opus", name: "Claude 3 Opus" },
    { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
    { id: "claude-3-haiku", name: "Claude 3 Haiku" },
  ],
  LLAMAINDEX: [
    { id: "llama-3-70b", name: "Llama 3 70B" },
    { id: "llama-3-8b", name: "Llama 3 8B" },
  ],
  CUSTOM: [{ id: "custom", name: "Custom Model" }],
}

// Default endpoints for providers
const defaultEndpoints = {
  OPENAI: "https://api.openai.com/v1",
  ANTHROPIC: "https://api.anthropic.com/v1",
  LLAMAINDEX: "https://api.llamaindex.ai/v1",
  CUSTOM: "",
}

type ModelFormData = {
  name: string
  provider: string
  modelId: string
  endpoint: string
  apiKey: string
  parameters: string
  isDefault: boolean
  description: string
}

const initialFormData: ModelFormData = {
  name: "",
  provider: "OPENAI",
  modelId: "gpt-4o",
  endpoint: "https://api.openai.com/v1",
  apiKey: "",
  parameters: JSON.stringify(
    {
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    null,
    2,
  ),
  isDefault: false,
  description: "",
}

export function AddAIModelModal({ onModelAdded }: { onModelAdded: (model: any) => void }) {
  const [formData, setFormData] = useState<ModelFormData>(initialFormData)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentStep(1)
    setValidationErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // If changing provider, update the endpoint and modelId
    if (name === "provider") {
      const newProvider = value as keyof typeof defaultEndpoints
      const newEndpoint = defaultEndpoints[newProvider]
      const newModelId = modelOptions[newProvider][0]?.id || ""

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endpoint: newEndpoint,
        modelId: newModelId,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }))
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = "Model name is required"
      }
      if (!formData.provider) {
        errors.provider = "Provider is required"
      }
      if (!formData.description.trim()) {
        errors.description = "Description is required"
      }
    } else if (step === 2) {
      if (!formData.apiKey.trim()) {
        errors.apiKey = "API key is required"
      }
      if (!formData.endpoint.trim()) {
        errors.endpoint = "API endpoint is required"
      }
      if (!formData.modelId) {
        errors.modelId = "Model ID is required"
      }
    } else if (step === 3) {
      try {
        JSON.parse(formData.parameters)
      } catch (e) {
        errors.parameters = "Invalid JSON format"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(currentStep)) {
      return
    }

    setIsLoading(true)

    try {
      // Parse parameters
      let parsedParameters
      try {
        parsedParameters = JSON.parse(formData.parameters)
      } catch (e) {
        setValidationErrors({ parameters: "Invalid JSON format" })
        setIsLoading(false)
        return
      }

      // Create the new model object
      const newModel = {
        id: `model_${Math.floor(Math.random() * 10000)}`,
        name: formData.name,
        provider: formData.provider,
        modelId: formData.modelId,
        endpoint: formData.endpoint,
        apiKey: formData.apiKey,
        parameters: parsedParameters,
        isDefault: formData.isDefault,
        description: formData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Call the onModelAdded callback with the new model
      onModelAdded(newModel)

      toast({
        title: "AI Model added",
        description: `${formData.name} has been added successfully.`,
      })

      resetForm()
      setIsOpen(false)
    } catch (error) {
      console.error("Error adding AI model:", error)
      toast({
        title: "Error",
        description: "Failed to add AI model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add AI Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New AI Model</DialogTitle>
            <DialogDescription>Configure a new AI model to use in your email automation workflows.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <div className="flex space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {currentStep > 3 ? <Check className="h-4 w-4" /> : "3"}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Step {currentStep} of 3</div>
              </div>
              <div className="w-full bg-muted h-2 rounded-full">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="name">Model Name *</Label>
                  </div>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Email Composer"
                    value={formData.name}
                    onChange={handleChange}
                    className={validationErrors.name ? "border-destructive" : ""}
                  />
                  {validationErrors.name && <p className="text-sm text-destructive">{validationErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="provider">Provider *</Label>
                  </div>
                  <select
                    id="provider"
                    name="provider"
                    className={`flex h-10 w-full rounded-md border ${validationErrors.provider ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                    value={formData.provider}
                    onChange={handleChange}
                  >
                    <option value="OPENAI">OpenAI</option>
                    <option value="ANTHROPIC">Anthropic</option>
                    <option value="LLAMAINDEX">LlamaIndex</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                  {validationErrors.provider && <p className="text-sm text-destructive">{validationErrors.provider}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="description">Description *</Label>
                  </div>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what this model will be used for..."
                    value={formData.description}
                    onChange={handleChange}
                    className={validationErrors.description ? "border-destructive" : ""}
                    rows={3}
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-destructive">{validationErrors.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="isDefault" checked={formData.isDefault} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isDefault">Set as default model</Label>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="apiKey">API Key *</Label>
                  </div>
                  <Input
                    id="apiKey"
                    name="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={formData.apiKey}
                    onChange={handleChange}
                    className={validationErrors.apiKey ? "border-destructive" : ""}
                  />
                  {validationErrors.apiKey && <p className="text-sm text-destructive">{validationErrors.apiKey}</p>}
                  <p className="text-xs text-muted-foreground">Your API key is stored securely and never shared.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="modelId">Model ID *</Label>
                  </div>
                  <select
                    id="modelId"
                    name="modelId"
                    className={`flex h-10 w-full rounded-md border ${validationErrors.modelId ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                    value={formData.modelId}
                    onChange={handleChange}
                  >
                    {modelOptions[formData.provider as keyof typeof modelOptions].map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.modelId && <p className="text-sm text-destructive">{validationErrors.modelId}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="endpoint">API Endpoint *</Label>
                  </div>
                  <Input
                    id="endpoint"
                    name="endpoint"
                    placeholder="https://api.example.com/v1"
                    value={formData.endpoint}
                    onChange={handleChange}
                    className={validationErrors.endpoint ? "border-destructive" : ""}
                  />
                  {validationErrors.endpoint && <p className="text-sm text-destructive">{validationErrors.endpoint}</p>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parameters">Model Parameters (JSON)</Label>
                  <Textarea
                    id="parameters"
                    name="parameters"
                    value={formData.parameters}
                    onChange={handleChange}
                    className={`font-mono ${validationErrors.parameters ? "border-destructive" : ""}`}
                    rows={10}
                  />
                  {validationErrors.parameters && (
                    <p className="text-sm text-destructive">{validationErrors.parameters}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Configure advanced parameters for your model. Use valid JSON format.
                  </p>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <h4 className="text-sm font-medium mb-2">Model Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="col-span-2 font-medium">{formData.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="col-span-2">{formData.provider}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="col-span-2">{formData.modelId}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Default:</span>
                      <span className="col-span-2">{formData.isDefault ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="mr-auto">
                Back
              </Button>
            )}

            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Model"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

