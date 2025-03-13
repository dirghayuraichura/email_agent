"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Mail, Bot, FileText, Calendar, LayoutDashboard, Settings, Network } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/leads",
      label: "Leads",
      icon: Users,
      active: pathname === "/leads" || pathname.startsWith("/leads/"),
    },
    {
      href: "/emails",
      label: "Emails",
      icon: Mail,
      active: pathname === "/emails" || pathname.startsWith("/emails/"),
    },
    {
      href: "/workflows",
      label: "Workflows",
      icon: Network,
      active: pathname === "/workflows" || pathname.startsWith("/workflows/"),
    },
    {
      href: "/ai-models",
      label: "AI Models",
      icon: Bot,
      active: pathname === "/ai-models" || pathname.startsWith("/ai-models/"),
    },
    {
      href: "/templates",
      label: "Templates",
      icon: FileText,
      active: pathname === "/templates" || pathname.startsWith("/templates/"),
    },
    {
      href: "/appointments",
      label: "Appointments",
      icon: Calendar,
      active: pathname === "/appointments" || pathname.startsWith("/appointments/"),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <div className="flex h-full w-[240px] flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center font-semibold">
          <Mail className="mr-2 h-5 w-5" />
          <span>AI Email Agent</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                route.active ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

