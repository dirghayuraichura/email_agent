import { notFound } from "next/navigation"
import { getAIModelById } from "../action"
import { AIModelDetailClient } from "./client"

export default async function AIModelDetailPage({ params }: { params: { id: string } }) {
  const model = await getAIModelById(params.id)

  if (!model) {
    notFound()
  }

  return <AIModelDetailClient model={model} />
}

