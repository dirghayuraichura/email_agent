"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { testAIModel } from "../action"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Zap, Info, AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SYSTEM_PROMPTS } from "@/lib/langchain-utils"

export function TestModelTab({ modelId }: { modelId: string }) {
  const [testPrompt, setTestPrompt] = useState(
    "Write a follow-up email to a lead who attended our product demo yesterday. They were particularly interested in the automation features."
  )
  const [testResponse, setTestResponse] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [testMetrics, setTestMetrics] = useState<{ tokens: number; responseTime: number } | null>(null)
  const [optimizePrompts, setOptimizePrompts] = useState(true)
  const [activeTab, setActiveTab] = useState("prompt")
  const [promptHistory, setPromptHistory] = useState<string[]>([])
  const [selectedUseCase, setSelectedUseCase] = useState<string>("default")
  const { toast } = useToast()

  // Convert SYSTEM_PROMPTS to an array for the select component
  const useCaseOptions = Object.entries(SYSTEM_PROMPTS).map(([key, value]) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }));

  const handleTestModel = async () => {
    if (!testPrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to test the model.",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    setTestResponse("")
    setTestMetrics(null)

    try {
      // Show optimization toast if enabled
      if (optimizePrompts) {
        toast({
          title: "Optimizing prompt",
          description: "Your prompt is being optimized to reduce token usage and cost.",
          duration: 3000,
        })
      }
      
      // Pass the optimization flag and use case to the testAIModel function
      const modelResponse = await testAIModel(modelId, testPrompt, optimizePrompts, selectedUseCase)
      
      // Simulate streaming response for better UX
      let displayedResponse = ""
      const words = modelResponse.response.split(" ")

      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 30))
        displayedResponse += (i > 0 ? " " : "") + words[i]
        setTestResponse(displayedResponse)
      }

      setTestMetrics({
        tokens: modelResponse.tokens,
        responseTime: modelResponse.responseTime,
      })
      
      // Add to prompt history
      setPromptHistory(prev => [testPrompt, ...prev.slice(0, 4)])
      
      // Show success toast with token information
      toast({
        title: "Test completed",
        description: `Response generated using ${modelResponse.tokens} tokens in ${modelResponse.responseTime.toFixed(2)}s.`,
        duration: 5000,
      })
    } catch (error) {
      console.error("Error testing model:", error)
      toast({
        title: "Error",
        description: "Failed to test the model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  // Sample prompt templates
  const promptTemplates = [
    {
      title: "Email Follow-up",
      prompt: "Write a follow-up email to a lead who attended our product demo yesterday. They were particularly interested in the automation features.",
      useCase: "email"
    },
    {
      title: "Product Description",
      prompt: "Create a compelling product description for our new AI-powered email automation tool that helps sales teams increase their response rates.",
      useCase: "marketing"
    },
    {
      title: "Meeting Summary",
      prompt: "Summarize the key points from our team meeting about the new product launch, including action items and responsibilities.",
      useCase: "default"
    },
    {
      title: "Customer Support",
      prompt: "Draft a helpful response to a customer who is having trouble connecting their email account to our platform.",
      useCase: "customer_support"
    },
    {
      title: "Technical Documentation",
      prompt: "Write a technical explanation of how our email automation system integrates with CRM platforms using API connections.",
      useCase: "technical"
    },
    {
      title: "Creative Content",
      prompt: "Write an engaging story about how AI is transforming the way businesses communicate with their customers.",
      useCase: "creative"
    }
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium">Response Quality & Cost Optimization</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            We automatically optimize your prompts to reduce token usage and lower costs while preserving the intent of your request.
            Our LangChain integration with specialized system prompts provides higher quality responses tailored to your use case.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="optimize-prompts"
                checked={optimizePrompts}
                onCheckedChange={setOptimizePrompts}
              />
              <Label htmlFor="optimize-prompts">Enable prompt optimization</Label>
            </div>
            
            <div className="flex-1 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <Label htmlFor="use-case" className="whitespace-nowrap">Use case:</Label>
              <Select value={selectedUseCase} onValueChange={setSelectedUseCase}>
                <SelectTrigger id="use-case" className="flex-1">
                  <SelectValue placeholder="Select a use case" />
                </SelectTrigger>
                <SelectContent>
                  {useCaseOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground border-t pt-2">
            <p className="flex items-center">
              <Info className="h-3 w-3 mr-1 inline" />
              <span>
                For LlamaIndex models, ensure you're using the correct API endpoint: <code className="bg-muted p-1 rounded">https://api.llamaindex.ai/v1/chat/completions</code>
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Your Model</CardTitle>
              <CardDescription>Enter a prompt to test how your model responds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="prompt" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="prompt">Write Prompt</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                <TabsContent value="prompt" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="testPrompt">Prompt</Label>
                    <Textarea
                      id="testPrompt"
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Enter your prompt here..."
                    />
                  </div>
                </TabsContent>
                <TabsContent value="templates" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Select a template</Label>
                    <div className="grid gap-2">
                      {promptTemplates.map((template, index) => (
                        <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                          setTestPrompt(template.prompt);
                          setSelectedUseCase(template.useCase);
                          setActiveTab("prompt");
                        }}>
                          <CardContent className="p-3">
                            <div className="font-medium">{template.title}</div>
                            <div className="text-sm text-muted-foreground truncate">{template.prompt.substring(0, 60)}...</div>
                            <Badge variant="outline" className="mt-2">{template.useCase.replace(/_/g, ' ')}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button onClick={handleTestModel} disabled={isTesting || !testPrompt.trim()} className="w-full">
                {isTesting ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  "Test Model"
                )}
              </Button>
            </CardContent>
            {promptHistory.length > 0 && (
              <CardFooter className="flex-col items-start">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="history">
                    <AccordionTrigger className="text-sm">Recent Prompts</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 mt-2">
                        {promptHistory.map((prompt, index) => (
                          <div 
                            key={index} 
                            className="text-sm p-2 rounded bg-muted cursor-pointer hover:bg-muted/80"
                            onClick={() => setTestPrompt(prompt)}
                          >
                            {prompt.length > 60 ? `${prompt.substring(0, 60)}...` : prompt}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardFooter>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Model Response</CardTitle>
                <CardDescription>
                  {testMetrics
                    ? `Response generated in ${testMetrics.responseTime.toFixed(2)}s`
                    : "The response generated by your AI model will appear here."}
                </CardDescription>
              </div>
              {testMetrics && (
                <Badge variant="outline" className="ml-2">
                  {testMetrics.tokens} tokens
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`rounded-md border p-4 min-h-[300px] whitespace-pre-wrap ${
                isTesting ? "animate-pulse" : ""
              }`}
            >
              {testResponse || (
                <span className="text-muted-foreground">
                  {isTesting ? "Generating response..." : "Response will appear here after testing"}
                </span>
              )}
            </div>
          </CardContent>
          {testResponse && (
            <CardFooter className="flex-col items-start">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tips">
                  <AccordionTrigger className="text-sm">Response Analysis</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 mt-2">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Quality Assessment</div>
                          <p className="text-sm text-muted-foreground">
                            This response was generated using LangChain integration with a specialized system prompt for {selectedUseCase.replace(/_/g, ' ')} use cases.
                            {optimizePrompts && " The prompt was optimized to reduce token usage while preserving intent."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Improvement Tips</div>
                          <p className="text-sm text-muted-foreground">
                            For even better results, try being more specific in your prompt about the tone, audience, and key points you want to include.
                            Try different use cases to see how they affect the response quality and style.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Cost Efficiency</div>
                          <p className="text-sm text-muted-foreground">
                            {testMetrics ? `This response used ${testMetrics.tokens} tokens. ` : ""}
                            {optimizePrompts 
                              ? "Prompt optimization is enabled, helping to reduce your token usage and costs."
                              : "Enable prompt optimization to reduce token usage and lower costs."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
} 