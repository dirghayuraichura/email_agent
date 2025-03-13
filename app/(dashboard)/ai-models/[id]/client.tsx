"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Bot, Zap, Settings, History, Star } from "lucide-react"
import { AIProvider } from "@prisma/client"
import { EditModelForm } from "./edit-form"
import { Separator } from "@/components/ui/separator"
import { TestModelTab } from "./test-tab"
import { UsageTab } from "./usage-tab"
import { AdvancedConfigTab } from "./advanced-config-tab"

// Provider display name mapping
const providerDisplayName: Record<AIProvider, string> = {
  OPENAI: "OpenAI",
  LLAMAINDEX: "LlamaIndex"
}

interface AIModelDetailClientProps {
  model: {
    id: string
    name: string
    provider: AIProvider
    modelId: string
    endpoint: string | null
    apiKey: string | null
    parameters: any
    isDefault: boolean
    userId: string
    createdAt: Date
    updatedAt: Date
  }
}

export function AIModelDetailClient({ model }: AIModelDetailClientProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/ai-models">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{model.name}</h1>
          {model.isDefault && (
            <div className="ml-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
              <Star className="mr-1 inline-block h-3 w-3" />
              Default
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">
            <Settings className="mr-2 h-4 w-4" />
            Information
          </TabsTrigger>
          <TabsTrigger value="test">
            <Zap className="mr-2 h-4 w-4" />
            Test Model
          </TabsTrigger>
          <TabsTrigger value="usage">
            <History className="mr-2 h-4 w-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Bot className="mr-2 h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Model Information</CardTitle>
                <CardDescription>Details about this AI model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Provider</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <span>{providerDisplayName[model.provider]}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Model ID</div>
                  <div className="mt-1">{model.modelId}</div>
                </div>
                {model.endpoint && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Endpoint</div>
                    <div className="mt-1 break-all">{model.endpoint}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">API Key</div>
                  <div className="mt-1">••••••••••••••••</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Created</div>
                  <div className="mt-1">{new Date(model.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                  <div className="mt-1">{new Date(model.updatedAt).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parameters</CardTitle>
                <CardDescription>Model configuration parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="rounded-md bg-muted p-4 overflow-auto max-h-[300px]">
                  {JSON.stringify(model.parameters, null, 2) || "{}"}
                </pre>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-4" />

          <div>
            <h2 className="text-xl font-semibold mb-4">Edit Model</h2>
            <EditModelForm model={model} />
          </div>
        </TabsContent>

        <TabsContent value="test">
          <TestModelTab modelId={model.id} />
        </TabsContent>

        <TabsContent value="usage">
          <UsageTab modelId={model.id} />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedConfigTab model={model} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 