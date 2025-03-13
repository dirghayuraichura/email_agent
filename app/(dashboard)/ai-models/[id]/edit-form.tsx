"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Save } from "lucide-react"
import { updateAIModel } from "../action"
import { AIModel, AIProvider } from "@prisma/client"
import { useRouter } from "next/navigation"

export function EditModelForm({ model }: { model: AIModel }) {
  const [formData, setFormData] = useState({
    name: model.name,
    provider: model.provider,
    modelId: model.modelId,
    endpoint: model.endpoint || "",
    apiKey: "",  // Don't show the actual API key for security
    parameters: JSON.stringify(model.parameters || {}, null, 2),
    isDefault: model.isDefault,
  })
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

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Parse parameters
      let parameters
      try {
        parameters = JSON.parse(formData.parameters)
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "The parameters field contains invalid JSON.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Prepare update data
      const updateData: any = {
        name: formData.name,
        provider: formData.provider,
        modelId: formData.modelId,
        endpoint: formData.endpoint || undefined,
        parameters,
        isDefault: formData.isDefault,
      }

      // Only include API key if it was changed
      if (formData.apiKey) {
        updateData.apiKey = formData.apiKey
      }

      // Update the model
      await updateAIModel(model.id, updateData)

      toast({
        title: "Model updated",
        description: "The AI model has been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating model:", error)
      toast({
        title: "Error",
        description: "Failed to update AI model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Edit Model Settings</CardTitle>
          <CardDescription>Update your AI model configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Model Name *</Label>
              <Input
                id="name"
                name="name"
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
                value={formData.endpoint}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key (leave blank to keep current)</Label>
            <Input
              id="apiKey"
              name="apiKey"
              type="password"
              placeholder="Enter new API key to update"
              value={formData.apiKey}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameters">Parameters (JSON)</Label>
            <Textarea
              id="parameters"
              name="parameters"
              value={formData.parameters}
              onChange={handleChange}
              className="font-mono"
              rows={8}
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => handleSwitchChange("isDefault", checked)}
            />
            <Label htmlFor="isDefault">Set as default model</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 