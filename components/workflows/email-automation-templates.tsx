import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActionType } from "@/app/types/workflow"
import { useRouter } from "next/navigation"
import { createWorkflowFromTemplate } from "@/app/(dashboard)/workflows/action"

export function EmailAutomationTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const templates = [
    {
      id: "lead-nurture",
      name: "Lead Nurturing Sequence",
      description: "5-email sequence to nurture leads with automatic follow-ups based on engagement",
      category: "sales",
      tags: ["lead-generation", "follow-up", "sales"],
      nodes: [
        // Template node configuration
        {
          id: "trigger-1",
          type: "trigger",
          position: { x: 250, y: 100 },
          data: {
            label: "Lead Created",
            type: ActionType.LEAD_CREATED,
          },
        },
        {
          id: "delay-1",
          type: "delay",
          position: { x: 250, y: 200 },
          data: {
            label: "Wait 1 Day",
            delayType: "days",
            delayValue: 1,
            type: ActionType.WAIT,
          },
        },
        {
          id: "email-1",
          type: "email",
          position: { x: 250, y: 300 },
          data: {
            label: "Welcome Email",
            subject: "Welcome to [Company]",
            body: "{{ai:generate_welcome_email}}",
            type: ActionType.SEND_EMAIL,
          },
        },
        // ... additional nodes
      ],
      edges: [
        // Template edge configuration
        { id: "e1-2", source: "trigger-1", target: "delay-1", animated: true },
        { id: "e2-3", source: "delay-1", target: "email-1", animated: true },
        // ... additional edges
      ],
    },
    {
      id: "customer-onboarding",
      name: "Customer Onboarding Sequence",
      description: "Help new customers get started with educational content and check-ins",
      category: "customer-success",
      // ... similar structure to above
    },
    {
      id: "abandoned-cart",
      name: "Abandoned Cart Recovery",
      description: "Recover abandoned carts with timely, personalized follow-ups",
      category: "ecommerce",
      // ... similar structure to above
    },
    // ... more templates
  ]

  const handleCreateWorkflow = async (templateId: string) => {
    setIsCreating(true)
    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) return
      
      const workflow = await createWorkflowFromTemplate({
        name: template.name,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges,
      })
      
      router.push(`/workflows/${workflow.id}`)
    } catch (error) {
      console.error("Error creating workflow:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="customer-success">Customer Success</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <Card key={template.id} className={`cursor-pointer transition-all ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedTemplate(template.id)}>
              <CardHeader className="pb-2">
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.tags?.map(tag => (
                    <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleCreateWorkflow(template.id)}
                  disabled={isCreating}
                >
                  {isCreating && selectedTemplate === template.id ? "Creating..." : "Use Template"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        {/* Remaining tab content sections */}
      </Tabs>
    </div>
  )
} 