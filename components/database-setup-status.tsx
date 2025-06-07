"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, RefreshCw, Database, Settings } from "lucide-react"

interface DatabaseStatus {
  success: boolean
  configured: boolean
  connected: boolean
  admin_access: boolean
  tables_found: number
  error?: string
  message?: string
}

export function DatabaseSetupStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/database/simple-health")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        success: false,
        configured: false,
        connected: false,
        admin_access: false,
        tables_found: 0,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const getStatusColor = (condition: boolean) => (condition ? "default" : "destructive")
  const getStatusIcon = (condition: boolean) => (condition ? CheckCircle : AlertCircle)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup Status
        </CardTitle>
        <CardDescription>Check the current status of your database configuration and setup</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Status Check</span>
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {status && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Configured</span>
                <Badge variant={getStatusColor(status.configured)}>{status.configured ? "Yes" : "No"}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Connection Active</span>
                <Badge variant={getStatusColor(status.connected)}>{status.connected ? "Yes" : "No"}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Admin Access</span>
                <Badge variant={getStatusColor(status.admin_access)}>{status.admin_access ? "Yes" : "No"}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Tables Found</span>
                <Badge variant="outline">{status.tables_found}</Badge>
              </div>
            </div>

            {status.message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Status</AlertTitle>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}

            {status.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{status.error}</AlertDescription>
              </Alert>
            )}

            {!status.configured && (
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertTitle>Setup Required</AlertTitle>
                <AlertDescription>
                  Please configure your Supabase environment variables and run the database setup scripts.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
