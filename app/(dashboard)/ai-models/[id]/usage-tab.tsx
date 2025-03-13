"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getModelUsage } from "../action"
import { ModelUsage } from "@prisma/client"

export function UsageTab({ modelId }: { modelId: string }) {
  const [usageData, setUsageData] = useState<ModelUsage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadUsageData = async () => {
      setIsLoading(true)
      try {
        const data = await getModelUsage(modelId)
        setUsageData(data)
      } catch (error) {
        console.error("Error loading usage data:", error)
        toast({
          title: "Error",
          description: "Failed to load usage data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUsageData()
  }, [modelId, toast])

  // Calculate total usage
  const totalRequests = usageData.reduce((sum, day) => sum + day.requests, 0)
  const totalTokens = usageData.reduce((sum, day) => sum + day.tokens, 0)
  const totalCost = usageData.reduce((sum, day) => sum + (day.cost || 0), 0)

  // Group data by day for the chart
  const groupedByDay = usageData.reduce((acc, item) => {
    const date = new Date(item.date).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = { date, requests: 0, tokens: 0 }
    }
    acc[date].requests += item.requests
    acc[date].tokens += item.tokens
    return acc
  }, {} as Record<string, { date: string; requests: number; tokens: number }>)

  // Convert to array and sort by date
  const chartData = Object.values(groupedByDay).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Tokens</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Estimated Cost</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>Token usage over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading usage data...</div>
          ) : usageData.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No usage data available yet.</div>
          ) : (
            <div className="h-[300px] w-full">
              {/* Simple bar chart visualization */}
              <div className="flex h-full items-end space-x-2">
                {chartData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{
                        height: `${Math.max(
                          5,
                          (day.tokens / Math.max(...chartData.map((d) => d.tokens))) * 250
                        )}px`,
                      }}
                    ></div>
                    <div className="text-xs mt-2 text-muted-foreground">{day.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Usage</CardTitle>
          <CardDescription>Daily breakdown of your model usage</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading usage data...</div>
          ) : usageData.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No usage data available yet.</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium">Date</th>
                    <th className="px-4 py-2 text-left font-medium">Requests</th>
                    <th className="px-4 py-2 text-left font-medium">Tokens</th>
                    <th className="px-4 py-2 text-left font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.map((day, index) => (
                    <tr key={index} className={index < usageData.length - 1 ? "border-b" : ""}>
                      <td className="px-4 py-2">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{day.requests}</td>
                      <td className="px-4 py-2">{day.tokens.toLocaleString()}</td>
                      <td className="px-4 py-2">${(day.cost || 0).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 