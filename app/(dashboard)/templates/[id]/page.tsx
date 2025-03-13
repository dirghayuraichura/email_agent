"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Eye, Code, Variable } from "lucide-react"

// Sample template data
const sampleTemplate = {
  id: "template_1",
  name: "Initial Outreach",
  description: "First contact with new leads",
  type: "EMAIL",
  content: `Hello {{name}},

I hope this email finds you well. I noticed that {{company}} has been growing rapidly in the {{industry}} space, and I thought our {{product}} might be a good fit for your needs.

Would you be available for a quick 15-minute call this week to discuss how we might be able to help?

Best regards,
[Your Name]`,
  variables: ["name", "company", "industry", "product"],
  createdAt: "2023-03-15T10:30:00Z",
}

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [template, setTemplate] = useState(sampleTemplate)
  const [previewData, setPreviewData] = useState({
    name: "John Smith",
    company: "Acme Inc",
    industry: "Technology",
    product: "AI Email Automation",
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Template saved",
      description: "Your template has been saved successfully.",
    })
  }

  const getPreviewContent = () => {
    let previewContent = template.content
    Object.entries(previewData).forEach(([key, value]) => {
      previewContent = previewContent.replace(new RegExp(`{{${key}}}`, "g"), value)
    })
    return previewContent
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Template: {template.name}</h1>
        <Badge>{template.type}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={template.description}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={template.type}
                  onChange={(e) => setTemplate({ ...template, type: e.target.value })}
                >
                  <option value="EMAIL">Email</option>
                  <option value="WORKFLOW">Workflow</option>
                  <option value="REPORT">Report</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  value={template.content}
                  onChange={(e) => setTemplate({ ...template, content: e.target.value })}
                  className="min-h-[300px] font-mono"
                />
              </div>

              <Button onClick={handleSave} disabled={isLoading} className="w-full">
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="preview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="variables">
                <Variable className="mr-2 h-4 w-4" />
                Variables
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="mr-2 h-4 w-4" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="rounded-md border p-4 whitespace-pre-wrap">{getPreviewContent()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-medium">Preview Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Edit the values below to see how your template will look with different data.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(previewData).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`preview-${key}`}>{key}</Label>
                        <Input
                          id={`preview-${key}`}
                          value={value}
                          onChange={(e) => setPreviewData({ ...previewData, [key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variables" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-medium">Template Variables</h3>
                  <p className="text-sm text-muted-foreground">
                    These variables will be replaced with actual data when the template is used.
                  </p>

                  <div className="space-y-2">
                    {template.variables.map((variable) => (
                      <div key={variable} className="flex items-center justify-between p-2 rounded-md border">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            <code>{"{{" + variable + "}}"}</code>
                          </Badge>
                          <span className="text-sm">{variable}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Variable className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input placeholder="Add new variable" />
                    <Button>Add</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-6">
                  <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                    <code>{`
// Example code to use this template
import { useTemplate } from '@/lib/templates';

export async function sendEmail(data) {
  const template = useTemplate('${template.id}');
  
  const content = template.render({
    name: data.name,
    company: data.company,
    industry: data.industry,
    product: data.product
  });
  
  return await emailService.send({
    to: data.email,
    subject: 'Introduction to our services',
    body: content
  });
}
                    `}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

