"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          AI-Powered Email Automation
        </h1>
        <p className="text-xl text-muted-foreground">
          Streamline your email outreach with intelligent automation and personalized responses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg" className="px-8">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8">
            <Link href="/register">Register</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Smart Automation</h3>
            <p className="text-muted-foreground">
              Automate your email workflows with AI-powered responses and follow-ups.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Personalization</h3>
            <p className="text-muted-foreground">
              Create personalized email campaigns that resonate with your audience.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground">
              Track performance with detailed analytics and improve your outreach.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

