"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Database,
  Zap,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react"
import type { SystemHealth, DiagnosticResult } from "@/lib/diagnostics/system-diagnostics"

export function DiagnosticDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/diagnostics/system")
      const data = await response.json()

      if (data.success) {
        setHealth(data.health)
        setLastRun(data.timestamp)
      } else {
        console.error("Diagnostics failed:", data.error)
      }
    } catch (error) {
      console.error("Error running diagnostics:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "text-green-600 bg-green-50"
      case "fail":
        return "text-red-600 bg-red-50"
      case "warning":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getHealthColor = (overall: string) => {
    switch (overall) {
      case "healthy":
        return "text-green-600 bg-green-50"
      case "degraded":
        return "text-yellow-600 bg-yellow-50"
      case "critical":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const groupResultsByCategory = (results: DiagnosticResult[]) => {
    const categories = {
      infrastructure: results.filter(
        (r) =>
          r.component.toLowerCase().includes("database") ||
          r.component.toLowerCase().includes("supabase") ||
          r.component.toLowerCase().includes("blob") ||
          r.component.toLowerCase().includes("table"),
      ),
      ai: results.filter(
        (r) =>
          r.component.toLowerCase().includes("llm") ||
          r.component.toLowerCase().includes("embedding") ||
          r.component.toLowerCase().includes("ai"),
      ),
      features: results.filter(
        (r) =>
          r.component.toLowerCase().includes("strategic") ||
          r.component.toLowerCase().includes("contract") ||
          r.component.toLowerCase().includes("discovery") ||
          r.component.toLowerCase().includes("credit"),
      ),
      integrations: results.filter(
        (r) =>
          r.component.toLowerCase().includes("court") ||
          r.component.toLowerCase().includes("legal") ||
          r.component.toLowerCase().includes("api"),
      ),
      security: results.filter(
        (r) => r.component.toLowerCase().includes("auth") || r.component.toLowerCase().includes("security"),
      ),
      performance: results.filter((r) => r.component.toLowerCase().includes("performance")),
    }

    return categories
  }

  if (!health) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className={`h-8 w-8 mx-auto mb-4 ${loading ? "animate-spin" : ""}`} />
          <p>{loading ? "Running diagnostics..." : "Loading diagnostics..."}</p>
        </div>
      </div>
    )
  }

  const categories = groupResultsByCategory(health.results)
  const successRate = (health.summary.passed / health.summary.total) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Activity className="h-8 w-8 mr-3" />
            System Diagnostics
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive platform health monitoring</p>
          {lastRun && <p className="text-sm text-gray-500">Last run: {new Date(lastRun).toLocaleString()}</p>}
        </div>
        <Button onClick={runDiagnostics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Running..." : "Run Diagnostics"}
        </Button>
      </div>

      {/* Overall Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Health</p>
                <p className="text-2xl font-bold capitalize">{health.overall}</p>
              </div>
              <Badge className={getHealthColor(health.overall)}>{health.overall.toUpperCase()}</Badge>
            </div>
            <Progress value={successRate} className="mt-4" />
            <p className="text-xs text-gray-500 mt-2">
              {health.summary.passed} of {health.summary.total} checks passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-3xl font-bold text-green-600">{health.summary.passed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-3xl font-bold text-yellow-600">{health.summary.warnings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600">{health.summary.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Diagnostic Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {health.results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.component}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(result.status)}
                          <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={result.message}>
                          {result.message}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure */}
        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Infrastructure Components
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.infrastructure.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.component}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Services */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                AI Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.ai.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.component}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Platform Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.features.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.component}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.integrations.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.component}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.security.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.component}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.performance.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.component}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
