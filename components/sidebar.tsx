"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  FileText,
  Scale,
  Search,
  MessageSquare,
  Settings,
  BarChart3,
  Database,
  Shield,
  Zap,
  CreditCard,
  Eye,
  Brain,
  GitBranch,
  Briefcase,
  BookOpen,
  Target,
  TrendingUp,
  Gavel,
  Building,
  Activity,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and quick actions",
  },
  {
    name: "Strategic Dossier",
    href: "/strategic-dossier",
    icon: Scale,
    description: "Case intelligence & strategy",
  },
  {
    name: "Contract Drafting",
    href: "/contract-drafting",
    icon: FileText,
    description: "AI-powered contract generation",
  },
  {
    name: "Discovery Engine",
    href: "/discovery",
    icon: Eye,
    description: "Autonomous discovery management",
  },
  {
    name: "Legal Research",
    href: "/research",
    icon: Search,
    description: "Comprehensive legal research",
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: MessageSquare,
    description: "Legal AI assistant",
  },
  {
    name: "Documents",
    href: "/documents",
    icon: Briefcase,
    description: "Document management",
  },
  {
    name: "Legal Sources",
    href: "/legal-sources",
    icon: BookOpen,
    description: "Source integration & search",
  },
  {
    name: "Knowledge Graph",
    href: "/knowledge-graph",
    icon: GitBranch,
    description: "Legal knowledge mapping",
  },
  {
    name: "Agent Swarm",
    href: "/agents",
    icon: Brain,
    description: "AI agent orchestration",
  },
  {
    name: "Analytics",
    href: "/analysis",
    icon: BarChart3,
    description: "Performance analytics",
  },
  {
    name: "Billing & Credits",
    href: "/billing",
    icon: CreditCard,
    description: "Usage & subscription",
  },
]

const adminNavigation = [
  {
    name: "Admin Console",
    href: "/admin",
    icon: Shield,
    description: "System administration",
  },
  {
    name: "Diagnostics",
    href: "/admin/diagnostics",
    icon: Activity,
    description: "System health monitoring",
  },
  {
    name: "Database",
    href: "/admin/database",
    icon: Database,
    description: "Database management",
  },
  {
    name: "AI Infrastructure",
    href: "/admin/ai-infrastructure",
    icon: Zap,
    description: "AI system monitoring",
  },
  {
    name: "Legal Sources Admin",
    href: "/admin/legal-sources",
    icon: Building,
    description: "Source configuration",
  },
  {
    name: "Test Suite",
    href: "/admin/test-suite",
    icon: Target,
    description: "System testing",
  },
  {
    name: "Performance",
    href: "/admin/performance",
    icon: TrendingUp,
    description: "Performance monitoring",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Gavel className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">LexCognito™</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Platform</h2>
            <div className="space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto p-3",
                    pathname === item.href && "bg-blue-50 text-blue-700",
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <div className="flex items-start space-x-3">
                      <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 font-normal">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Administration</h2>
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <Button
                  key={item.name}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn("w-full justify-start h-auto p-3", pathname === item.href && "bg-red-50 text-red-700")}
                  asChild
                >
                  <Link href={item.href}>
                    <div className="flex items-start space-x-3">
                      <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 font-normal">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  )
}
