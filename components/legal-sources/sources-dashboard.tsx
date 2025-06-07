"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, AlertCircle, CheckCircle, AlertTriangle, Search, Database, Key } from "lucide-react"

interface LegalSource {
  id: string
  name: string
  status: "online" | "limited" | "offline" | "blocked"
  hasApiKey?: boolean
  message: string
}

interface SourcesStatus {
  sources: LegalSource[]
  timestamp: string
}

interface SearchResult {
  id: string
  title: string
  citation: string
  court: string
  date: string
  snippet: string
  url: string
  source: string
}

export function LegalSourcesDashboard() {
  const [activeTab, setActiveTab] = useState("sources")
  const [sourcesStatus, setSourcesStatus] = useState<SourcesStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSourcesStatus()
  }, [])

  const fetchSourcesStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/legal-sources/status")
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }
      const data = await response.json()
      setSourcesStatus(data)
    } catch (err) {
      setError("Failed to fetch legal sources status")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || selectedSources.length === 0) return

    setSearchLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/legal-sources/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          sources: selectedSources,
          options: {
            limit: 20,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()
      setSearchResults(data.results)
    } catch (err) {
      setError("Search failed")
      console.error(err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSourceToggle = (sourceId: string, checked: boolean) => {
    if (checked) {
      setSelectedSources([...selectedSources, sourceId])
    } else {
      setSelectedSources(selectedSources.filter((id) => id !== sourceId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
      case "limited":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
      case "blocked":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return CheckCircle
      case "limited":
        return AlertTriangle
      case "blocked":
        return AlertCircle
      default:
        return AlertCircle
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Sources</h1>
          <p className="text-muted-foreground">Manage and search across multiple legal databases and sources</p>
        </div>
        <Button onClick={fetchSourcesStatus} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sources">Sources Status</TabsTrigger>
          <TabsTrigger value="search">Multi-Source Search</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Legal Sources Status
              </CardTitle>
              <CardDescription>
                Current status of all integrated legal databases and APIs
                {sourcesStatus && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Last updated: {new Date(sourcesStatus.timestamp).toLocaleString()}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Checking sources...</span>
                </div>
              ) : sourcesStatus ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sourcesStatus.sources.map((source) => {
                    const StatusIcon = getStatusIcon(source.status)
                    return (
                      <Card key={source.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{source.name}</CardTitle>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <Badge className={getStatusColor(source.status)}>{source.status.toUpperCase()}</Badge>
                            {source.hasApiKey !== undefined && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Key className="h-3 w-3" />
                                {source.hasApiKey ? "API Key Configured" : "No API Key"}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">{source.message}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No source data available. Click refresh to check status.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Multi-Source Search
              </CardTitle>
              <CardDescription>Search across multiple legal databases simultaneously</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your search query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searchLoading || !searchQuery.trim() || selectedSources.length === 0}
                >
                  {searchLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Select Sources:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sourcesStatus?.sources
                    .filter((source) => source.status === "online" || source.status === "limited")
                    .map((source) => (
                      <div key={source.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={source.id}
                          checked={selectedSources.includes(source.id)}
                          onCheckedChange={(checked) => handleSourceToggle(source.id, checked as boolean)}
                        />
                        <label
                          htmlFor={source.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {source.name}
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              {searchResults && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-3">Search Results ({searchResults.length})</h4>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {searchResults.map((result, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h5 className="font-medium text-sm leading-tight">{result.title}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {result.source}
                                </Badge>
                              </div>
                              {result.citation && (
                                <p className="text-xs font-mono text-muted-foreground">{result.citation}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {result.court && <span>{result.court}</span>}
                                {result.date && <span>{result.date}</span>}
                              </div>
                              {result.snippet && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{result.snippet}</p>
                              )}
                              {result.url && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                                    View Full Case
                                  </a>
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure API keys and settings for legal sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertTitle>Environment Variables Required</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>Configure these environment variables for full access:</p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>
                          <code>COURT_LISTENER_API_KEY</code> - CourtListener API access
                        </li>
                        <li>
                          <code>CASELAW_ACCESS_PROJECT_API_KEY</code> - Harvard CAP API
                        </li>
                        <li>
                          <code>CASETEXT_API_KEY</code> - Casetext API access
                        </li>
                        <li>
                          <code>LAWPIPE_API_KEY</code> - LawPipe API access
                        </li>
                        <li>
                          <code>GOVINFO_API_KEY</code> - GovInfo.gov API access
                        </li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Free Sources (No API Key Required)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Supreme Court Database</li>
                      <li>• FindLaw (web scraping)</li>
                      <li>• Google Scholar (web scraping, rate limited)</li>
                      <li>• Justia (limited access)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Premium Sources (API Key Required)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• CourtListener (enhanced features)</li>
                      <li>• Caselaw Access Project (full access)</li>
                      <li>• Casetext (commercial features)</li>
                      <li>• LawPipe (case summaries)</li>
                      <li>• GovInfo.gov (enhanced access)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
