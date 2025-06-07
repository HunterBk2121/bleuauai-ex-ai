"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Scale,
  Users,
} from "lucide-react"

interface ApiStatus {
  status: "online" | "limited" | "offline"
  message: string
  hasApiKey: boolean
  endpoints: string[]
}

interface OpinionCluster {
  id: number
  case_name: string
  court: string
  date_filed: string
  federal_cite_one?: string
  neutral_cite?: string
  precedential_status: string
  citation_count: number
  absolute_url: string
}

interface Court {
  id: string
  full_name: string
  short_name: string
  jurisdiction: string
  in_use: boolean
}

export function CourtListenerDashboard() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<OpinionCluster[]>([])
  const [trendingCases, setTrendingCases] = useState<OpinionCluster[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    checkApiStatus()
    loadTrendingCases()
    loadCourts()
  }, [])

  const checkApiStatus = async () => {
    try {
      const response = await fetch("/api/legal-sources/court-listener?action=status")
      const status = await response.json()
      setApiStatus(status)
    } catch (error) {
      console.error("Failed to check API status:", error)
    }
  }

  const loadTrendingCases = async () => {
    try {
      const response = await fetch("/api/legal-sources/court-listener?action=trending&days=30")
      const data = await response.json()
      setTrendingCases(data.results.slice(0, 5))
    } catch (error) {
      console.error("Failed to load trending cases:", error)
    }
  }

  const loadCourts = async () => {
    try {
      const response = await fetch("/api/legal-sources/court-listener?action=courts")
      const data = await response.json()
      setCourts(data.results.filter((court: Court) => court.in_use).slice(0, 10))
    } catch (error) {
      console.error("Failed to load courts:", error)
    }
  }

  const searchOpinions = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `/api/legal-sources/court-listener?action=search&q=${encodeURIComponent(searchQuery)}&limit=10`,
      )

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setSearchResults(data.results)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }

  const downloadCase = async (caseId: number, caseName: string) => {
    try {
      const response = await fetch("/api/legal-sources/court-listener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "download",
          query: `id:${caseId}`,
          options: { limit: 1 },
        }),
      })

      const data = await response.json()

      if (data.downloads && data.downloads[0]?.status === "downloaded") {
        alert(`Successfully downloaded: ${caseName}`)
      } else {
        alert(`Failed to download: ${caseName}`)
      }
    } catch (error) {
      alert(`Error downloading case: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "limited":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800"
      case "limited":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            CourtListener API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apiStatus ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(apiStatus.status)}
                <span className="font-medium">{apiStatus.message}</span>
                <Badge className={getStatusColor(apiStatus.status)}>{apiStatus.status.toUpperCase()}</Badge>
              </div>
              <div className="text-sm text-gray-500">API Key: {apiStatus.hasApiKey ? "✓ Configured" : "✗ Missing"}</div>
            </div>
          ) : (
            <div className="text-gray-500">Checking API status...</div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="courts">Courts</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Legal Opinions</CardTitle>
              <CardDescription>Search CourtListener's database of legal opinions and case law</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter search query (e.g., 'constitutional law', 'Brown v. Board')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchOpinions()}
                />
                <Button onClick={searchOpinions} disabled={loading || !searchQuery.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Search Results ({searchResults.length})</h3>
                  {searchResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{result.case_name}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Court: {result.court}</div>
                            <div>Date: {new Date(result.date_filed).toLocaleDateString()}</div>
                            {result.federal_cite_one && <div>Citation: {result.federal_cite_one}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{result.citation_count} citations</Badge>
                          <Button size="sm" variant="outline" onClick={() => downloadCase(result.id, result.case_name)}>
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={result.absolute_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Cases (Last 30 Days)
              </CardTitle>
              <CardDescription>Most cited recent cases in the legal community</CardDescription>
            </CardHeader>
            <CardContent>
              {trendingCases.length > 0 ? (
                <div className="space-y-3">
                  {trendingCases.map((case_) => (
                    <div key={case_.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{case_.case_name}</h4>
                          <div className="text-xs text-gray-600 mt-1">
                            {case_.court} • {new Date(case_.date_filed).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {case_.citation_count} cites
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <a href={case_.absolute_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">Loading trending cases...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Courts
              </CardTitle>
              <CardDescription>Courts currently tracked in the CourtListener database</CardDescription>
            </CardHeader>
            <CardContent>
              {courts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {courts.map((court) => (
                    <div key={court.id} className="border rounded-lg p-3">
                      <div className="font-medium text-sm">{court.full_name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {court.short_name} • {court.jurisdiction}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">Loading courts...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
