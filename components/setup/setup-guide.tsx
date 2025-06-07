"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Rocket, Database, Zap, Shield } from "lucide-react"

interface SetupCheck {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  required: boolean
}

interface SetupStatus {
  status: string
  verification: {
    checks: SetupCheck[]
  }
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
}

export function SetupGuide() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkSetup()
  }, [])

  const checkSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup/verify")
      const data = await response.json()
      if (data.success) {
        setSetupStatus(data)
      }
    } catch (error) {
      console.error("Setup check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const runDiagnostics = async () => {
    window.open("/admin/diagnostics", "_blank")
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
        return <RefreshCw className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-green-600 bg-green-50"
      case "ready_with_warnings":
        return "text-yellow-600 bg-yellow-50"
      case "critical":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getOverallMessage = (status: string) => {
    switch (status) {
      case "ready":
        return "🎉 LexCognito™ is fully configured and ready to use!"
      case "ready_with_warnings":
        return "⚠️ LexCognito™ is ready with some optional features disabled"
      case "critical":
        return "❌ Critical configuration issues need to be resolved"
      default:
        return "🔍 Checking system configuration..."
    }
  }

  if (!setupStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className={`h-8 w-8 mx-auto mb-4 ${loading ? "animate-spin" : ""}`} />
          <p>Checking system setup...</p>
        </div>
      </div>
    )
  }

  const completionPercentage = (setupStatus.summary.passed / setupStatus.summary.total) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center mb-4">
          <Rocket className="h-10 w-10 mr-4" />
          LexCognito™ Setup
        </h1>
        <p className="text-xl text-gray-600">{getOverallMessage(setupStatus.status)}</p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Setup Progress</h3>
              <p className="text-gray-600">System configuration status</p>
            </div>
            <Badge className={getStatusColor(setupStatus.status)} size="lg">
              {setupStatus.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>

          <Progress value={completionPercentage} className="mb-4" />

          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{setupStatus.summary.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{setupStatus.summary.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{setupStatus.summary.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{setupStatus.summary.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Checks */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Required Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Required Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {setupStatus.verification.checks
                .filter((check) => check.required)
                .map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-medium text-sm">{check.name.replace("Environment Variable: ", "")}</p>
                        <p className="text-xs text-gray-600">{check.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Optional Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Optional Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {setupStatus.verification.checks
                .filter((check) => !check.required)
                .map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-medium text-sm">{check.name.replace("Environment Variable: ", "")}</p>
                        <p className="text-xs text-gray-600">{check.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button onClick={checkSetup} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Recheck Setup
        </Button>

        <Button onClick={runDiagnostics}>
          <Database className="h-4 w-4 mr-2" />
          Run Full Diagnostics
        </Button>

        {setupStatus.status === "ready" && (
          <Button asChild>
            <a href="/dashboard">
              <Rocket className="h-4 w-4 mr-2" />
              Launch Platform
            </a>
          </Button>
        )}
      </div>

      {/* Setup Instructions */}
      {setupStatus.summary.failed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Environment Variables:</h4>
                <div className="bg-gray-50 p-4 rounded font-mono text-sm">
                  <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=your_service_role_key</div>
                  <div>GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Optional Environment Variables:</h4>
                <div className="bg-gray-50 p-4 rounded font-mono text-sm">
                  <div>BLOB_READ_WRITE_TOKEN=your_blob_token</div>
                  <div>NEXTAUTH_SECRET=your_auth_secret</div>
                  <div>COURT_LISTENER_API_KEY=your_court_listener_key</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After adding environment variables, restart your development server and run the
                  setup check again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
