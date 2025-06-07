"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface SourceStatus {
  id: string
  name: string
  status: "online" | "limited" | "offline" | "blocked"
  hasApiKey?: boolean
  message: string
}

export function LegalSourceStatus() {
  const [sources, setSources] = useState<SourceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timestamp, setTimestamp] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/legal-sources/status")
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setSources(data.sources || [])
        setTimestamp(data.timestamp)
      } catch (error) {
        console.error("Error fetching legal sources status:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch status")
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-500">Online</Badge>
      case "limited":
        return <Badge className="bg-yellow-500">Limited</Badge>
      case "offline":
        return <Badge className="bg-red-500">Offline</Badge>
      case "blocked":
        return <Badge className="bg-orange-500">Blocked</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
  }

  // Render status icon
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "limited":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "blocked":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal Sources Status</CardTitle>
        <CardDescription>
          {timestamp ? `Last updated: ${new Date(timestamp).toLocaleString()}` : "Checking status of legal sources..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error fetching status</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sources.length === 0 ? (
              <p className="text-gray-500">No legal sources found.</p>
            ) : (
              <div className="grid gap-4">
                {sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center">
                      {renderStatusIcon(source.status)}
                      <div className="ml-4">
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-gray-500">{source.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {source.hasApiKey !== undefined && (
                        <Badge variant={source.hasApiKey ? "outline" : "secondary"}>
                          {source.hasApiKey ? "API Key Set" : "No API Key"}
                        </Badge>
                      )}
                      {renderStatusBadge(source.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
