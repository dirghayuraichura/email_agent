"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, Copy, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample templates
const templates = [
  {
    id: "template_1",
    name: "Initial Outreach",
    description: "First contact with new leads",
    type: "EMAIL",
    createdAt: "2023-03-15T10:30:00Z",
    variables: ["name", "company", "product"],
  },
  {
    id: "template_2",
    name: "Follow-up After Demo",
    description: "Follow up with leads after product demo",
    type: "EMAIL",
    createdAt: "2023-02-20T14:45:00Z",
    variables: ["name", "demoDate", "nextSteps"],
  },
  {
    id: "template_3",
    name: "Lead Nurturing Workflow",
    description: "5-step workflow for nurturing leads",
    type: "WORKFLOW",
    createdAt: "2023-01-10T09:15:00Z",
    variables: ["leadSource", "industry", "interests"],
  },
  {
    id: "template_4",
    name: "Monthly Performance Report",
    description: "Monthly report template for clients",
    type: "REPORT",
    createdAt: "2023-04-05T11:20:00Z",
    variables: ["clientName", "month", "metrics"],
  },
  {
    id: "template_5",
    name: "Meeting Request",
    description: "Template for scheduling meetings",
    type: "EMAIL",
    createdAt: "2023-03-25T13:10:00Z",
    variables: ["name", "proposedDate", "agenda"],
  },
  {
    id: "template_6",
    name: "Re-engagement Campaign",
    description: "Workflow to re-engage inactive leads",
    type: "WORKFLOW",
    createdAt: "2023-02-15T16:30:00Z",
    variables: ["name", "lastActivity", "specialOffer"],
  },
]

// Type badge mapping
const getTypeBadge = (type: string) => {
  const typeMap: Record<string, { color: string; icon: React.ReactNode }> = {
    EMAIL: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: <FileText className="mr-1 h-3 w-3" />,
    },
    WORKFLOW: {
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      icon: <FileText className="mr-1 h-3 w-3" />,
    },
    REPORT: {
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: <FileText className="mr-1 h-3 w-3" />,
    },
  }

  const style = typeMap[type]?.color || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  const icon = typeMap[type]?.icon || <FileText className="mr-1 h-3 w-3" />

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {icon}
      {type}
    </span>
  )
}

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    {getTypeBadge(template.type)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-xl">
                    <Link href={`/templates/${template.id}`} className="hover:underline">
                      {template.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="capitalize">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                    <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/templates/${template.id}`}>Use Template</Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates
              .filter((template) => template.type === "EMAIL")
              .map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      {getTypeBadge(template.type)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-xl">
                      <Link href={`/templates/${template.id}`} className="hover:underline">
                        {template.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="capitalize">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-3">
                    <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/templates/${template.id}`}>Use Template</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates
              .filter((template) => template.type === "WORKFLOW")
              .map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      {getTypeBadge(template.type)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-xl">
                      <Link href={`/templates/${template.id}`} className="hover:underline">
                        {template.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="capitalize">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-3">
                    <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/templates/${template.id}`}>Use Template</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates
              .filter((template) => template.type === "REPORT")
              .map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      {getTypeBadge(template.type)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-xl">
                      <Link href={`/templates/${template.id}`} className="hover:underline">
                        {template.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="capitalize">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-3">
                    <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/templates/${template.id}`}>Use Template</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

