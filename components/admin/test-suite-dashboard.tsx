"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Database,
  Brain,
  Scale,
  HardDrive,
  Shield,
  Zap,
  FileText,
  MessageSquare,
  GitBranch,
  Users,
  Search,
  BookOpen,
  CreditCard,
  Network,
  BarChart3,
  Link,
} from "lucide-react"

interface TestResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
  duration?: number
}

interface TestSuite {
  category: string
  tests: TestResult[]
  overall: "pass" | "fail" | "warning"
}

interface TestResults {
  success: boolean
  overall_status?: "pass" | "fail" | "warning"
  duration: number
  test_suites?: TestSuite[]
  summary?: {
    total_tests: number
    passed: number
    failed: number
    warnings: number
  }
  error?: string
}

export function TestSuiteDashboard() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResults | null>(null)
  const [progress, setProgress] = useState(0)

  const runTests = async () => {
    setIsRunning(true)
    setProgress(0)
    setResults(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90))
    }, 200)

    try {
      const response = await fetch("/api/admin/test-suite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
      setProgress(100)
    } catch (error) {
      console.error("Test suite error:", error)
      setResults({
        success: false,
        overall_status: "fail",
        duration: 0,
        test_suites: [],
        summary: { total_tests: 0, passed: 0, failed: 1, warnings: 0 },
        error: error instanceof Error ? error.message : String(error),
      })
      setProgress(100)
    } finally {
      clearInterval(progressInterval)
      setIsRunning(false)
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
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "fail":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Database":
        return <Database className="h-4 w-4" />
      case "AI Infrastructure":
        return <Brain className="h-4 w-4" />
      case "Storage":
        return <HardDrive className="h-4 w-4" />
      case "Security":
        return <Shield className="h-4 w-4" />
      case "Strategic Dossier":
        return <FileText className="h-4 w-4" />
      case "Contract Drafting":
        return <BookOpen className="h-4 w-4" />
      case "Discovery Engine":
        return <Search className="h-4 w-4" />
      case "Legal Sources":
        return <Scale className="h-4 w-4" />
      case "Knowledge Graph":
        return <Network className="h-4 w-4" />
      case "Agent Swarm":
        return <Users className="h-4 w-4" />
      case "Chat Interface":
        return <MessageSquare className="h-4 w-4" />
      case "Document Analysis":
        return <FileText className="h-4 w-4" />
      case "Citation Validation":
        return <GitBranch className="h-4 w-4" />
      case "Billing & Credits":
        return <CreditCard className="h-4 w-4" />
      case "Performance":
        return <Zap className="h-4 w-4" />
      case "Integrations":
        return <Link className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  // Safe access to test suites with fallback
  const testSuites = results?.test_suites || []
  const summary = results?.summary || { total_tests: 0, passed: 0, failed: 0, warnings: 0 }

  // Group test suites by type
  const coreInfrastructure = testSuites.filter((suite) =>
    ["Database", "AI Infrastructure", "Storage", "Security", "Performance"].includes(suite.category),
  )
  const features = testSuites.filter((suite) =>
    [
      "Strategic Dossier",
      "Contract Drafting",
      "Discovery Engine",
      "Legal Sources",
      "Knowledge Graph",
      "Agent Swarm",
      "Chat Interface",
      "Document Analysis",
      "Citation Validation",
      "Billing & Credits",
    ].includes(suite.category),
  )
  const integrations = testSuites.filter((suite) => ["Integrations"].includes(suite.category))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comprehensive Test Suite</h1>
          <p className="text-muted-foreground">
            Complete testing of all {testSuites.length} feature categories and {summary.total_tests} individual tests
          </p>
        </div>
        <Button onClick={runTests} disabled={isRunning}>
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Test Progress</CardTitle>
            <CardDescription>
              Testing {testSuites.length} categories with {summary.total_tests} total tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running comprehensive tests...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <>
          {/* Overall Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(results.overall_status || "fail")}
                Test Results Summary
              </CardTitle>
              <CardDescription>
                Completed {testSuites.length} test categories in {results.duration}ms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.error ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Test Suite Failed</AlertTitle>
                  <AlertDescription>{results.error}</AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{summary.total_tests}</div>
                    <div className="text-sm text-muted-foreground">Total Tests</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Core Infrastructure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Core Infrastructure
                </CardTitle>
                <CardDescription>{coreInfrastructure.length} categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {coreInfrastructure.map((suite) => (
                    <div key={suite.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(suite.category)}
                        <span className="text-sm">{suite.category}</span>
                      </div>
                      {getStatusIcon(suite.overall)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Features
                </CardTitle>
                <CardDescription>{features.length} categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {features.slice(0, 5).map((suite) => (
                    <div key={suite.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(suite.category)}
                        <span className="text-sm">{suite.category}</span>
                      </div>
                      {getStatusIcon(suite.overall)}
                    </div>
                  ))}
                  {features.length > 5 && (
                    <div className="text-xs text-muted-foreground">+{features.length - 5} more...</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Integrations
                </CardTitle>
                <CardDescription>{integrations.length} categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {integrations.map((suite) => (
                    <div key={suite.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(suite.category)}
                        <span className="text-sm">{suite.category}</span>
                      </div>
                      {getStatusIcon(suite.overall)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          {testSuites.length > 0 ? (
            <Tabs defaultValue={testSuites[0]?.category} className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="grid w-max grid-cols-4 lg:grid-cols-8 gap-1">
                  {testSuites.slice(0, 16).map((suite) => (
                    <TabsTrigger
                      key={suite.category}
                      value={suite.category}
                      className="flex items-center gap-1 text-xs px-2"
                    >
                      {getCategoryIcon(suite.category)}
                      <span className="hidden sm:inline truncate">{suite.category}</span>
                      {getStatusIcon(suite.overall)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {testSuites.map((suite) => (
                <TabsContent key={suite.category} value={suite.category}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(suite.category)}
                        {suite.category} Tests
                        <Badge className={getStatusColor(suite.overall)}>{suite.overall.toUpperCase()}</Badge>
                      </CardTitle>
                      <CardDescription>{suite.tests?.length || 0} tests in this category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {(suite.tests || []).map((test, index) => (
                            <Collapsible key={index}>
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                  <div className="flex items-center gap-3">
                                    {getStatusIcon(test.status)}
                                    <div>
                                      <div className="font-medium">{test.name}</div>
                                      <div className="text-sm text-muted-foreground">{test.message}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {test.duration && (
                                      <Badge variant="outline" className="text-xs">
                                        {test.duration}ms
                                      </Badge>
                                    )}
                                    <ChevronDown className="h-4 w-4" />
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              {test.details && (
                                <CollapsibleContent>
                                  <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                                    <pre className="text-xs overflow-auto max-h-40">
                                      {JSON.stringify(test.details, null, 2)}
                                    </pre>
                                  </div>
                                </CollapsibleContent>
                              )}
                            </Collapsible>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Test Results</h3>
                <p className="text-muted-foreground mb-4">
                  The test suite completed but returned no test results. This may indicate a configuration issue.
                </p>
                {results.error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{results.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!results && !isRunning && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Comprehensive Test Suite Ready</h3>
            <p className="text-muted-foreground mb-4">
              Test all 16 feature categories including Strategic Dossier, Contract Drafting, Discovery Engine, and more
            </p>
            <Button onClick={runTests}>
              <Play className="h-4 w-4 mr-2" />
              Start Comprehensive Testing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
