"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Mail, Bot, FileText, Calendar, Workflow, LayoutDashboard } from "lucide-react"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
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
      active: pathname === "/leads",
    },
    {
      href: "/emails",
      label: "Emails",
      icon: Mail,
      active: pathname === "/emails",
    },
    {
      href: "/workflows",
      label: "Workflows",
      icon: Workflow,
      active: pathname === "/workflows",
    },
    {
      href: "/ai-models",
      label: "AI Models",
      icon: Bot,
      active: pathname === "/ai-models",
    },
    {
      href: "/templates",
      label: "Templates",
      icon: FileText,
      active: pathname === "/templates",
    },
    {
      href: "/appointments",
      label: "Appointments",
      icon: Calendar,
      active: pathname === "/appointments",
    },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          <route.icon className="mr-2 h-4 w-4" />
          {route.label}
        </Link>
      ))}
    </nav>
  )
}

