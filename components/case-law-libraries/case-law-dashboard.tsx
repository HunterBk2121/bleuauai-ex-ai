"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Database,
  Download,
  ExternalLink,
  Scale,
  Building,
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react"

interface CaseLawSource {
  id: string
  name: string
  description: string
  baseUrl: string
  accessType: "free" | "subscription" | "api_key"
  coverage: {
    jurisdictions: string[]
    dateRange: { start: string; end?: string }
    documentTypes: string[]
  }
  isActive: boolean
}

interface CaseResult {
  id: string
  title: string
  citation: string
  court: string
  date: string
  url: string
  summary?: string
  source: string
  metadata?: Record<string, any>
}

export function CaseLawDashboard() {
  const [sources, setSources] = useState<CaseLawSource[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [court, setCourt] = useState("")
  const [results, setResults] = useState<CaseResult[]>([])
  const [sourceStats, setSourceStats] = useState<Record<string, { count: number; errors: string[] }>>({})
  const [loading, setLoading] = useState(false)
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    try {
      const response = await fetch("/api/legal-sources/case-law-libraries?action=sources")
      const data = await response.json()
      setSources(data.sources)
      setSelectedSources(
        data.sources.filter((s: CaseLawSource) => s.accessType === "free").map((s: CaseLawSource) => s.id),
      )
    } catch (error) {
      console.error("Error loading sources:", error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        action: "search",
        query: searchQuery,
        limit: "50",
      })

      if (jurisdiction) params.append("jurisdiction", jurisdiction)
      if (court) params.append("court", court)

      const response = await fetch(`/api/legal-sources/case-law-libraries?${params}`)
      const data = await response.json()

      setResults(data.results)
      setSourceStats(data.sources)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSourceToggle = (sourceId: string, checked: boolean) => {
    if (checked) {
      setSelectedSources([...selectedSources, sourceId])
    } else {
      setSelectedSources(selectedSources.filter((id) => id !== sourceId))
    }
  }

  const handleResultSelect = (resultId: string, checked: boolean) => {
    const newSelected = new Set(selectedResults)
    if (checked) {
      newSelected.add(resultId)
    } else {
      newSelected.delete(resultId)
    }
    setSelectedResults(newSelected)
  }

  const handleSaveSelected = async () => {
    const selectedCases = results.filter((result) => selectedResults.has(result.id))

    try {
      const response = await fetch("/api/legal-sources/case-law-libraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_results",
          data: { results: selectedCases },
        }),
      })

      const data = await response.json()
      alert(`Saved ${data.saved} cases. ${data.errors.length} errors.`)
      setSelectedResults(new Set())
    } catch (error) {
      console.error("Save error:", error)
    }
  }

  const getAccessTypeColor = (type: string) => {
    switch (type) {
      case "free":
        return "bg-green-100 text-green-800"
      case "subscription":
        return "bg-blue-100 text-blue-800"
      case "api_key":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Law Libraries</h1>
          <p className="text-muted-foreground">Search across multiple legal databases and case law sources</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{sources.length} Sources</Badge>
          <Badge variant="outline">{results.length} Results</Badge>
        </div>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="sources">
            <Database className="h-4 w-4 mr-2" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle>Search Case Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search cases, citations, or legal concepts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={jurisdiction} onValueChange={setJurisdiction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jurisdictions</SelectItem>
                    <SelectItem value="US">Federal</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                  </SelectContent>
                </Select>

                <Input placeholder="Court name (optional)" value={court} onChange={(e) => setCourt(e.target.value)} />
              </div>

              {loading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Searching case law databases...</span>
                    <span>Please wait</span>
                  </div>
                  <Progress value={33} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Search Results ({results.length})</h3>
                {selectedResults.size > 0 && (
                  <Button onClick={handleSaveSelected}>
                    <Download className="h-4 w-4 mr-2" />
                    Save Selected ({selectedResults.size})
                  </Button>
                )}
              </div>

              {/* Source Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(sourceStats).map(([sourceId, stats]) => {
                  const source = sources.find((s) => s.id === sourceId)
                  return (
                    <Card key={sourceId}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{source?.name}</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.count}</p>
                          </div>
                          {stats.errors.length > 0 ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Results List */}
              <div className="space-y-3">
                {results.map((result) => (
                  <Card key={result.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            checked={selectedResults.has(result.id)}
                            onCheckedChange={(checked) => handleResultSelect(result.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{result.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center">
                                <Scale className="h-3 w-3 mr-1" />
                                {result.citation}
                              </span>
                              <span className="flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                {result.court}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {result.date}
                              </span>
                            </div>
                            {result.summary && <p className="text-sm mt-2 text-gray-700">{result.summary}</p>}
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{result.source}</Badge>
                              {result.metadata?.practice_area && (
                                <Badge variant="secondary">{result.metadata.practice_area}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Case Law Sources</CardTitle>
              <p className="text-sm text-muted-foreground">Configure which legal databases to search</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.map((source) => (
                  <div key={source.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedSources.includes(source.id)}
                          onCheckedChange={(checked) => handleSourceToggle(source.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{source.name}</h3>
                            <Badge className={getAccessTypeColor(source.accessType)}>{source.accessType}</Badge>
                            {source.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="font-medium">Jurisdictions:</span>
                              <p>{source.coverage.jurisdictions.join(", ")}</p>
                            </div>
                            <div>
                              <span className="font-medium">Date Range:</span>
                              <p>
                                {source.coverage.dateRange.start} - {source.coverage.dateRange.end || "Present"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Document Types:</span>
                              <p>{source.coverage.documentTypes.join(", ")}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={source.baseUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Source Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{source.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{source.coverage.jurisdictions.length} jurisdictions</Badge>
                        <Badge className={getAccessTypeColor(source.accessType)}>{source.accessType}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Sources:</span>
                    <span className="font-bold">{sources.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Sources:</span>
                    <span className="font-bold">{sources.filter((s) => s.accessType === "free").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Sources:</span>
                    <span className="font-bold">{sources.filter((s) => s.isActive).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Search Results:</span>
                    <span className="font-bold">{results.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
