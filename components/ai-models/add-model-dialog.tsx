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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import { createAIModel } from "@/app/(dashboard)/ai-models/action"
import { AIProvider } from "@prisma/client"
import { useRouter } from "next/navigation"

type ModelFormData = {
  name: string
  provider: AIProvider
  modelId: string
  endpoint: string
  apiKey: string
  parameters: string
  isDefault: boolean
}

const initialFormData: ModelFormData = {
  name: "",
  provider: "OPENAI",
  modelId: "",
  endpoint: "",
  apiKey: "",
  parameters: "{}",
  isDefault: false,
}

export function AddModelDialog() {
  const [formData, setFormData] = useState<ModelFormData>(initialFormData)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value as AIProvider }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Parse parameters
      const parameters = formData.parameters ? JSON.parse(formData.parameters) : {}
      
      // Create the model using server action
      await createAIModel({
        name: formData.name,
        provider: formData.provider,
        modelId: formData.modelId,
        endpoint: formData.endpoint || undefined,
        apiKey: formData.apiKey || undefined,
        parameters,
        isDefault: formData.isDefault,
      })

      toast({
        title: "AI Model added",
        description: `${formData.name} has been added successfully.`,
      })

      setFormData(initialFormData)
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error adding model:", error)
      toast({
        title: "Error",
        description: "Failed to add AI model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New AI Model</DialogTitle>
            <DialogDescription>Configure a new AI model to use in your email automation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Email Composer"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={formData.provider} onValueChange={(value) => handleSelectChange("provider", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPENAI">OpenAI</SelectItem>
                    <SelectItem value="LLAMAINDEX">LlamaIndex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelId">Model ID *</Label>
                <Input
                  id="modelId"
                  name="modelId"
                  placeholder="gpt-4o"
                  value={formData.modelId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input
                  id="endpoint"
                  name="endpoint"
                  placeholder="https://api.example.com/v1"
                  value={formData.endpoint}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={formData.apiKey}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parameters">Parameters (JSON)</Label>
              <Textarea
                id="parameters"
                name="parameters"
                placeholder='{"temperature": 0.7, "max_tokens": 500}'
                value={formData.parameters}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isDefault">Set as default model</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Model"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

