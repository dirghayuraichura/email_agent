"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Bot, Star, Settings, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { AddModelDialog } from "@/components/ai-models/add-model-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { getAIModels, deleteAIModel, setDefaultAIModel } from "./action"
import { AIModel, AIProvider } from "@prisma/client"

// Provider badge mapping
const getProviderBadge = (provider: AIProvider) => {
  const providerMap: Record<string, { color: string }> = {
    OPENAI: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    LLAMAINDEX: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  }

  const style = providerMap[provider]?.color || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {provider}
    </span>
  )
}

function AIModelsList({ initialModels }: { initialModels: AIModel[] }) {
  const [models, setModels] = useState<AIModel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Initialize models state only once when component mounts
  useEffect(() => {
    setModels(initialModels);
  }, [initialModels]);

  const handleSetDefault = async (modelId: string) => {
    try {
      await setDefaultAIModel(modelId)
      
      // Update local state
      setModels(prevModels => prevModels.map(model => ({
        ...model,
        isDefault: model.id === modelId
      })))

      toast({
        title: "Default model updated",
        description: "The default AI model has been updated successfully.",
      })
      
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default model. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (modelId: string) => {
    setModelToDelete(modelId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!modelToDelete) return

    setIsDeleting(true)

    try {
      await deleteAIModel(modelToDelete)

      // Update local state
      setModels(prevModels => prevModels.filter(model => model.id !== modelToDelete))

      toast({
        title: "Model deleted",
        description: "The AI model has been deleted successfully.",
      })

      setDeleteDialogOpen(false)
      setModelToDelete(null)
      
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredModels = models.filter((model) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      model.name.toLowerCase().includes(query) ||
      model.provider.toLowerCase().includes(query) ||
      model.modelId.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search AI models..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredModels.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-8">
            <p className="text-muted-foreground">No AI models found.</p>
          </div>
        ) : (
          filteredModels.map((model) => (
            <Card key={model.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  {model.isDefault && (
                    <Badge variant="default" className="bg-primary">
                      <Star className="mr-1 h-3 w-3" /> Default
                    </Badge>
                  )}
                  <div className="ml-auto">{getProviderBadge(model.provider)}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/ai-models/${model.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      {!model.isDefault && (
                        <DropdownMenuItem onClick={() => handleSetDefault(model.id)}>Set as Default</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(model.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-xl">
                  <Link href={`/ai-models/${model.id}`} className="hover:underline">
                    {model.name}
                  </Link>
                </CardTitle>
                <CardDescription>Model: {model.modelId}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <span>{model.provider}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                  <span>Created {new Date(model.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/ai-models/${model.id}`}>
                      <Settings className="mr-2 h-3 w-3" />
                      Configure
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete AI Model</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this AI model? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Page component
export default function AIModelsPage() {
  const [aiModels, setAiModels] = useState<AIModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true)
        const models = await getAIModels()
        setAiModels(models)
      } catch (err) {
        console.error("Failed to fetch AI models:", err)
        setError("Failed to load AI models. Please try refreshing the page.")
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">AI Models</h1>
          <AddModelDialog />
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">AI Models</h1>
          <AddModelDialog />
        </div>
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AI Models</h1>
        <AddModelDialog />
      </div>

      <AIModelsList initialModels={aiModels} />
    </div>
  )
}

