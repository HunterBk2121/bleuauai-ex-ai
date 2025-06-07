"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, AlertCircle, CheckCircle, XCircle, FileText, Gavel, Building, User } from "lucide-react"

interface CourtListenerStatus {
  status: "online" | "limited" | "offline"
  message: string
  hasApiKey?: boolean
}

interface CourtListenerOpinion {
  id: number
  case_name: string
  citation: {
    cite: string
    type: string
  }
  court: string
  date_filed: string
  snippet: string
}

interface SearchResults {
  count: number
  next: string | null
  previous: string | null
  results: CourtListenerOpinion[]
}

export function CourtListenerDashboard() {
  const [status, setStatus] = useState<CourtListenerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const [citation, setCitation] = useState({ reporter: "", volume: "", page: "" })
  const [validationResult, setValidationResult] = useState<any>(null)
  const [validating, setValidating] = useState(false)

  // Fetch status on component mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/legal-sources/court-listener?action=status")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Error fetching CourtListener status:", error)
        setStatus({
          status: "offline",
          message: "Failed to connect to CourtListener API",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(
        `/api/legal-sources/court-listener?action=search&q=${encodeURIComponent(searchQuery)}&limit=10`,
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error searching CourtListener:", error)
    } finally {
      setSearching(false)
    }
  }

  // Handle citation validation
  const handleValidateCitation = async () => {
    if (!citation.reporter || !citation.volume || !citation.page) return

    setValidating(true)
    try {
      const response = await fetch(
        `/api/legal-sources/court-listener?action=validate-citation&reporter=${encodeURIComponent(citation.reporter)}&volume=${citation.volume}&page=${citation.page}`,
      )
      const data = await response.json()
      setValidationResult(data)
    } catch (error) {
      console.error("Error validating citation:", error)
    } finally {
      setValidating(false)
    }
  }

  // Render status badge
  const renderStatusBadge = () => {
    if (!status) return null

    switch (status.status) {
      case "online":
        return <Badge className="bg-green-500">Online</Badge>
      case "limited":
        return <Badge className="bg-yellow-500">Limited Access</Badge>
      case "offline":
        return <Badge className="bg-red-500">Offline</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>CourtListener Dashboard</CardTitle>
            <CardDescription>Search and access legal opinions from CourtListener</CardDescription>
          </div>
          {loading ? <Skeleton className="h-6 w-20" /> : renderStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : status?.status === "offline" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className={status?.status === "limited" ? "bg-yellow-50 mb-4" : "bg-green-50 mb-4"}>
              {status?.status === "online" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <AlertTitle>{status?.status === "online" ? "Connected" : "Limited Access"}</AlertTitle>
              <AlertDescription>{status?.message}</AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search">
                  <Search className="mr-2 h-4 w-4" />
                  Search Opinions
                </TabsTrigger>
                <TabsTrigger value="citation">
                  <FileText className="mr-2 h-4 w-4" />
                  Validate Citation
                </TabsTrigger>
                <TabsTrigger value="resources">
                  <Building className="mr-2 h-4 w-4" />
                  Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for legal opinions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                    {searching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {searching ? (
                  <div className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : searchResults ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500">Found {searchResults.count} results</div>
                    {searchResults.results.length > 0 ? (
                      <div className="space-y-4">
                        {searchResults.results.map((opinion) => (
                          <Card key={opinion.id}>
                            <CardContent className="pt-4">
                              <div className="flex justify-between">
                                <h3 className="font-medium">{opinion.case_name}</h3>
                                <Badge variant="outline">{opinion.citation?.cite || "No citation"}</Badge>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {opinion.court} • {opinion.date_filed}
                              </div>
                              <p className="text-sm mt-2">{opinion.snippet}</p>
                              <div className="mt-2">
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={`https://www.courtlistener.com/opinion/${opinion.id}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Opinion
                                  </a>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No results found</AlertTitle>
                        <AlertDescription>Try a different search query or broaden your search terms.</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="citation" className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Reporter (e.g., F.3d)"
                    value={citation.reporter}
                    onChange={(e) => setCitation({ ...citation, reporter: e.target.value })}
                  />
                  <Input
                    placeholder="Volume"
                    type="number"
                    value={citation.volume}
                    onChange={(e) => setCitation({ ...citation, volume: e.target.value })}
                  />
                  <Input
                    placeholder="Page"
                    type="number"
                    value={citation.page}
                    onChange={(e) => setCitation({ ...citation, page: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleValidateCitation}
                  disabled={validating || !citation.reporter || !citation.volume || !citation.page}
                >
                  {validating ? "Validating..." : "Validate Citation"}
                </Button>

                {validationResult && (
                  <Alert className={validationResult.valid ? "bg-green-50" : "bg-red-50"}>
                    {validationResult.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <AlertTitle>{validationResult.valid ? "Valid Citation" : "Invalid Citation"}</AlertTitle>
                    <AlertDescription>
                      {validationResult.valid
                        ? `Citation ${citation.reporter} ${citation.volume} ${citation.page} is valid.`
                        : validationResult.error || "Citation could not be validated."}
                    </AlertDescription>
                    {validationResult.match_url && (
                      <div className="mt-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={validationResult.match_url} target="_blank" rel="noopener noreferrer">
                            View Matching Opinion
                          </a>
                        </Button>
                      </div>
                    )}
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Gavel className="mr-2 h-5 w-5" />
                        Courts
                      </CardTitle>
                      <CardDescription>Browse courts in the database</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href="https://www.courtlistener.com/api/rest/v3/courts/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Courts
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Judges
                      </CardTitle>
                      <CardDescription>Browse judges in the database</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href="https://www.courtlistener.com/api/rest/v3/people/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Judges
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>API Documentation</CardTitle>
                    <CardDescription>Learn more about the CourtListener API</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <a href="https://www.courtlistener.com/api/rest-info/" target="_blank" rel="noopener noreferrer">
                        View API Documentation
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}
