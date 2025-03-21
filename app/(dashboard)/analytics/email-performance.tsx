import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getEmailPerformanceMetrics } from "./action"

// Fix: Add type definition for metrics
interface EmailMetrics {
  openRate: number;
  clickRate: number;
  responseRate: number;
  aiCosts: number;
  openRateChange: number;
  clickRateChange: number;
  responseRateChange: number;
  aiCostsChange: number;
  trends: Array<{
    date: string;
    opens: number;
    clicks: number;
    responses: number;
  }>;
}

export default function EmailPerformanceAnalytics() {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null)
  const [timeRange, setTimeRange] = useState("7days")
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchMetrics() {
      setIsLoading(true)
      try {
        const data = await getEmailPerformanceMetrics(timeRange)
        setMetrics(data)
      } catch (error) {
        console.error("Error fetching metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMetrics()
  }, [timeRange])
  
  if (isLoading) {
    return <div>Loading analytics...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Email Performance Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Rate</CardDescription>
            <CardTitle className="text-3xl">{metrics?.openRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {metrics?.openRateChange > 0 ? "+" : ""}{metrics?.openRateChange}% from previous period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Click Rate</CardDescription>
            <CardTitle className="text-3xl">{metrics?.clickRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {metrics?.clickRateChange > 0 ? "+" : ""}{metrics?.clickRateChange}% from previous period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Response Rate</CardDescription>
            <CardTitle className="text-3xl">{metrics?.responseRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {metrics?.responseRateChange > 0 ? "+" : ""}{metrics?.responseRateChange}% from previous period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>AI Generation Costs</CardDescription>
            <CardTitle className="text-3xl">${metrics?.aiCosts.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {metrics?.aiCostsChange > 0 ? "+" : ""}{metrics?.aiCostsChange}% from previous period
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Email Performance Trends */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Email Performance Trends</CardTitle>
          <CardDescription>Track key metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={metrics?.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="opens" stroke="#8884d8" />
              <Line type="monotone" dataKey="clicks" stroke="#82ca9d" />
              <Line type="monotone" dataKey="responses" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Additional charts and analytics would go here */}
    </div>
  )
} 