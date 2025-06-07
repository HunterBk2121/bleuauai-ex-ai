"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scale,
  FileText,
  Mic,
  Globe,
  Server,
  Clock,
} from "lucide-react"

interface ScraperStatus {
  juriscraper_available: boolean
  python_version?: string
  webdriver_status: "available" | "unavailable" | "remote"
  supported_courts: number
  last_check: string
}

interface AvailableCourt {
  id: string
  name: string
  jurisdiction: "federal" | "state"
  level: "appellate" | "supreme" | "district" | "bankruptcy"
  supports_opinions: boolean
  supports_oral_arguments: boolean
  requires_webdriver: boolean
}

interface ScrapeResult {
  court_id: string
  opinions: any[]
  oral_arguments: any[]
  metadata: {
    scrape_date: string
    total_items: number
    success: boolean
    errors: string[]
  }
}

export function ScraperDashboard() {
  const [status, setStatus] = useState<ScraperStatus | null>(null)
  const [courts, setCourts] = useState<AvailableCourt[]>([])
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [scrapeResults, setScrapeResults] = useState<ScrapeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [bulkProgress, setBulkProgress] = useState(0)

  // Filters
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [includeOralArguments, setIncludeOralArguments] = useState(false)
  const [downloadDocuments, setDownloadDocuments] = useState(false)
  const [maxItems, setMaxItems] = useState<number>(50)

  useEffect(() => {
    checkScraperStatus()
    loadAvailableCourts()
  }, [])

  const checkScraperStatus = async () => {
    try {
      const response = await fetch("/api/legal-sources/juriscraper?action=status")
      const statusData = await response.json()
      setStatus(statusData)
    } catch (error) {
      console.error("Failed to check scraper status:", error)
    }
  }

  const loadAvailableCourts = async () => {
    try {
      const params = new URLSearchParams({ action: "courts" })
      if (jurisdictionFilter !== "all") params.append("jurisdiction", jurisdictionFilter)
      if (levelFilter !== "all") params.append("level", levelFilter)

      const response = await fetch(`/api/legal-sources/juriscraper?${params}`)
      const data = await response.json()
      setCourts(data.courts)
    } catch (error) {
      console.error("Failed to load courts:", error)
    }
  }

  useEffect(() => {
    loadAvailableCourts()
  }, [jurisdictionFilter, levelFilter])

  const testScraper = async (courtId: string) => {
    try {
      const response = await fetch(`/api/legal-sources/juriscraper?action=test-scraper&court_id=${courtId}`)
      const result = await response.json()

      if (result.success) {
        alert(`✅ Scraper test successful for ${courtId}`)
      } else {
        alert(`❌ Scraper test failed for ${courtId}: ${result.errors.join(", ")}`)
      }
    } catch (error) {
      alert(`❌ Test failed: ${error}`)
    }
  }

  const scrapeSingleCourt = async (courtId: string, type: "opinions" | "oral-arguments") => {
    setLoading(true)
    setError("")

    try {
      const action = type === "opinions" ? "scrape-opinions" : "scrape-oral-arguments"
      const response = await fetch(`/api/legal-sources/juriscraper?action=${action}&court_id=${courtId}`)

      if (!response.ok) {
        throw new Error("Scrape failed")
      }

      const result = await response.json()
      setScrapeResults((prev) => {
        const filtered = prev.filter((r) => r.court_id !== courtId)
        return [...filtered, result]
      })

      alert(`✅ Successfully scraped ${result.metadata.total_items} items from ${courtId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Scrape failed")
    } finally {
      setLoading(false)
    }
  }

  const bulkScrape = async () => {
    if (selectedCourts.length === 0) {
      alert("Please select at least one court")
      return
    }

    setLoading(true)
    setError("")
    setBulkProgress(0)

    try {
      const response = await fetch("/api/legal-sources/juriscraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-scrape",
          courts: selectedCourts,
          includeOralArguments,
          downloadDocuments,
          maxItems,
        }),
      })

      if (!response.ok) {
        throw new Error("Bulk scrape failed")
      }

      const data = await response.json()
      setScrapeResults(data.results)
      setBulkProgress(100)

      alert(
        `✅ Bulk scrape completed: ${data.summary.total_items} items from ${data.summary.successful_courts}/${data.summary.total_courts} courts`,
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bulk scrape failed")
    } finally {
      setLoading(false)
    }
  }

  const toggleCourtSelection = (courtId: string) => {
    setSelectedCourts((prev) => (prev.includes(courtId) ? prev.filter((id) => id !== courtId) : [...prev, courtId]))
  }

  const selectAllCourts = () => {
    setSelectedCourts(courts.map((c) => c.id))
  }

  const clearSelection = () => {
    setSelectedCourts([])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "remote":
        return <Server className="h-4 w-4 text-blue-500" />
      case "unavailable":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (available: boolean) => {
    return available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const filteredCourts = courts.filter((court) => {
    if (jurisdictionFilter !== "all" && court.jurisdiction !== jurisdictionFilter) return false
    if (levelFilter !== "all" && court.level !== levelFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Juriscraper Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(status.juriscraper_available)}>
                  {status.juriscraper_available ? "Available" : "Unavailable"}
                </Badge>
                <span className="text-sm text-gray-600">Juriscraper</span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(status.webdriver_status)}
                <span className="text-sm text-gray-600">WebDriver: {status.webdriver_status}</span>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">{status.supported_courts} Courts</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Last Check: {new Date(status.last_check).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Checking status...</div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="scrape" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scrape">Court Scraping</TabsTrigger>
          <TabsTrigger value="results">Scrape Results</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="scrape" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Court Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jurisdictions</SelectItem>
                      <SelectItem value="federal">Federal</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Court Level</Label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="supreme">Supreme</SelectItem>
                      <SelectItem value="appellate">Appellate</SelectItem>
                      <SelectItem value="district">District</SelectItem>
                      <SelectItem value="bankruptcy">Bankruptcy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Courts */}
          <Card>
            <CardHeader>
              <CardTitle>Available Courts ({filteredCourts.length})</CardTitle>
              <CardDescription>Select courts to scrape for legal opinions and oral arguments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAllCourts}>
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                  <Badge variant="secondary">{selectedCourts.length} selected</Badge>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Court</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourts.map((court) => (
                        <TableRow key={court.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCourts.includes(court.id)}
                              onCheckedChange={() => toggleCourtSelection(court.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{court.name}</div>
                              <div className="text-sm text-gray-500">{court.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline">{court.jurisdiction}</Badge>
                              <Badge variant="outline">{court.level}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {court.supports_opinions && (
                                <Badge variant="secondary" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Opinions
                                </Badge>
                              )}
                              {court.supports_oral_arguments && (
                                <Badge variant="secondary" className="text-xs">
                                  <Mic className="h-3 w-3 mr-1" />
                                  Oral Args
                                </Badge>
                              )}
                              {court.requires_webdriver && (
                                <Badge variant="outline" className="text-xs">
                                  WebDriver
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testScraper(court.id)}
                                disabled={loading}
                              >
                                Test
                              </Button>
                              {court.supports_opinions && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => scrapeSingleCourt(court.id, "opinions")}
                                  disabled={loading}
                                >
                                  <FileText className="h-3 w-3" />
                                </Button>
                              )}
                              {court.supports_oral_arguments && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => scrapeSingleCourt(court.id, "oral-arguments")}
                                  disabled={loading}
                                >
                                  <Mic className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Scraping Options</CardTitle>
              <CardDescription>Configure bulk scraping parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxItems">Max Items per Court</Label>
                  <Input
                    id="maxItems"
                    type="number"
                    value={maxItems}
                    onChange={(e) => setMaxItems(Number(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeOralArguments"
                      checked={includeOralArguments}
                      onCheckedChange={setIncludeOralArguments}
                    />
                    <Label htmlFor="includeOralArguments">Include Oral Arguments</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="downloadDocuments"
                      checked={downloadDocuments}
                      onCheckedChange={setDownloadDocuments}
                    />
                    <Label htmlFor="downloadDocuments">Download Documents</Label>
                  </div>
                </div>
              </div>

              {loading && bulkProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bulk Scraping Progress</span>
                    <span>{bulkProgress}%</span>
                  </div>
                  <Progress value={bulkProgress} />
                </div>
              )}

              <Button onClick={bulkScrape} disabled={loading || selectedCourts.length === 0} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scraping {selectedCourts.length} Courts...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Start Bulk Scrape ({selectedCourts.length} courts)
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scrape Results</CardTitle>
              <CardDescription>Recent scraping results and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {scrapeResults.length > 0 ? (
                <div className="space-y-4">
                  {scrapeResults.map((result) => (
                    <div key={result.court_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{result.court_id}</h4>
                        <div className="flex items-center gap-2">
                          {result.metadata.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant="outline">{result.metadata.total_items} items</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Opinions:</span>
                          <span className="ml-1 font-medium">{result.opinions.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Oral Arguments:</span>
                          <span className="ml-1 font-medium">{result.oral_arguments.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Scraped:</span>
                          <span className="ml-1 font-medium">
                            {new Date(result.metadata.scrape_date).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Errors:</span>
                          <span className="ml-1 font-medium">{result.metadata.errors.length}</span>
                        </div>
                      </div>

                      {result.metadata.errors.length > 0 && (
                        <div className="mt-2">
                          <Alert variant="destructive">
                            <AlertDescription>{result.metadata.errors.join("; ")}</AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No scrape results yet. Start scraping courts to see results here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
