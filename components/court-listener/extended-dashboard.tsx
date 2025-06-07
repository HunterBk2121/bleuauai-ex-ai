"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Gift, AlertTriangle, Network, Bell, Download, Users, FileText, Shield } from "lucide-react"

interface FinancialConflict {
  judge: any
  potentialConflicts: {
    investments: any[]
    gifts: any[]
    positions: any[]
    reimbursements: any[]
  }
  riskScore: number
}

interface CitationNetwork {
  opinion: any
  authorities: any[]
  citations: any[]
  networkMetrics: {
    authorityCount: number
    citationCount: number
    averageCitationDepth: number
    influenceScore: number
  }
}

export function CourtListenerExtendedDashboard() {
  const [activeTab, setActiveTab] = useState("financial")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Financial Disclosure State
  const [judgeId, setJudgeId] = useState("")
  const [caseKeywords, setCaseKeywords] = useState("")
  const [conflictAnalysis, setConflictAnalysis] = useState<FinancialConflict | null>(null)

  // Citation Network State
  const [opinionId, setOpinionId] = useState("")
  const [networkAnalysis, setNetworkAnalysis] = useState<CitationNetwork | null>(null)

  // Alert State
  const [alertName, setAlertName] = useState("")
  const [alertQuery, setAlertQuery] = useState("")
  const [alertRate, setAlertRate] = useState<"rt" | "dly" | "wly" | "mly">("dly")
  const [alerts, setAlerts] = useState<any[]>([])

  const analyzeJudgeConflicts = async () => {
    if (!judgeId || !caseKeywords) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `/api/legal-sources/court-listener-extended?action=judge-conflicts&judge_id=${judgeId}&keywords=${encodeURIComponent(caseKeywords)}`,
      )

      if (!response.ok) {
        throw new Error("Failed to analyze conflicts")
      }

      const data = await response.json()
      setConflictAnalysis(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const analyzeCitationNetwork = async () => {
    if (!opinionId) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `/api/legal-sources/court-listener-extended?action=citation-network&opinion_id=${opinionId}`,
      )

      if (!response.ok) {
        throw new Error("Failed to analyze citation network")
      }

      const data = await response.json()
      setNetworkAnalysis(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const createSearchAlert = async () => {
    if (!alertName || !alertQuery) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/legal-sources/court-listener-extended", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-search-alert",
          name: alertName,
          query: alertQuery,
          rate: alertRate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create alert")
      }

      const newAlert = await response.json()
      setAlerts([...alerts, newAlert])
      setAlertName("")
      setAlertQuery("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Alert creation failed")
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      const response = await fetch("/api/legal-sources/court-listener-extended?action=search-alerts")
      const data = await response.json()
      setAlerts(data.results || [])
    } catch (error) {
      console.error("Failed to load alerts:", error)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-100 text-red-800"
    if (score >= 40) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getInfluenceColor = (score: number) => {
    if (score >= 70) return "bg-purple-100 text-purple-800"
    if (score >= 40) return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CourtListener Extended Features</h2>
        <Badge variant="outline">Enterprise Analytics</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial Disclosures</TabsTrigger>
          <TabsTrigger value="citations">Citation Network</TabsTrigger>
          <TabsTrigger value="alerts">Legal Alerts</TabsTrigger>
          <TabsTrigger value="recap">RECAP Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Judge Conflict Analysis
              </CardTitle>
              <CardDescription>
                Analyze potential financial conflicts of interest for judges in specific cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Judge ID</label>
                  <Input
                    placeholder="Enter judge ID (e.g., 1213)"
                    value={judgeId}
                    onChange={(e) => setJudgeId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Case Keywords</label>
                  <Input
                    placeholder="Enter keywords (comma-separated)"
                    value={caseKeywords}
                    onChange={(e) => setCaseKeywords(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={analyzeJudgeConflicts} disabled={loading || !judgeId || !caseKeywords}>
                {loading ? "Analyzing..." : "Analyze Conflicts"}
              </Button>

              {conflictAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Analysis Results</h3>
                    <Badge className={getRiskColor(conflictAnalysis.riskScore)}>
                      Risk Score: {conflictAnalysis.riskScore}/100
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {conflictAnalysis.potentialConflicts.investments.length}
                            </div>
                            <div className="text-sm text-gray-600">Investments</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="text-2xl font-bold">{conflictAnalysis.potentialConflicts.gifts.length}</div>
                            <div className="text-sm text-gray-600">Gifts</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {conflictAnalysis.potentialConflicts.positions.length}
                            </div>
                            <div className="text-sm text-gray-600">Positions</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-orange-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {conflictAnalysis.potentialConflicts.reimbursements.length}
                            </div>
                            <div className="text-sm text-gray-600">Reimbursements</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {conflictAnalysis.riskScore > 30 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Potential conflicts detected. Review the judge's financial disclosures carefully.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Citation Network Analysis
              </CardTitle>
              <CardDescription>Analyze the citation network and influence of legal opinions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Opinion ID</label>
                <Input
                  placeholder="Enter opinion ID (e.g., 2812209)"
                  value={opinionId}
                  onChange={(e) => setOpinionId(e.target.value)}
                />
              </div>

              <Button onClick={analyzeCitationNetwork} disabled={loading || !opinionId}>
                {loading ? "Analyzing..." : "Analyze Citation Network"}
              </Button>

              {networkAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Network Metrics</h3>
                    <Badge className={getInfluenceColor(networkAnalysis.networkMetrics.influenceScore)}>
                      Influence Score: {networkAnalysis.networkMetrics.influenceScore.toFixed(1)}/100
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{networkAnalysis.networkMetrics.authorityCount}</div>
                        <div className="text-sm text-gray-600">Authorities Cited</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{networkAnalysis.networkMetrics.citationCount}</div>
                        <div className="text-sm text-gray-600">Times Cited</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {networkAnalysis.networkMetrics.averageCitationDepth.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Avg Citation Depth</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {networkAnalysis.networkMetrics.influenceScore.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">Influence Score</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Legal Alerts Management
              </CardTitle>
              <CardDescription>Create and manage search alerts for legal developments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Alert Name</label>
                  <Input
                    placeholder="Enter alert name"
                    value={alertName}
                    onChange={(e) => setAlertName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Frequency</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={alertRate}
                    onChange={(e) => setAlertRate(e.target.value as any)}
                  >
                    <option value="rt">Real-time</option>
                    <option value="dly">Daily</option>
                    <option value="wly">Weekly</option>
                    <option value="mly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Search Query</label>
                <Input
                  placeholder="Enter search query (e.g., q=constitutional+law&type=o)"
                  value={alertQuery}
                  onChange={(e) => setAlertQuery(e.target.value)}
                />
              </div>

              <Button onClick={createSearchAlert} disabled={loading || !alertName || !alertQuery}>
                {loading ? "Creating..." : "Create Alert"}
              </Button>

              {alerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Active Alerts ({alerts.length})</h3>
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{alert.name}</div>
                          <div className="text-sm text-gray-600">Rate: {alert.rate}</div>
                        </div>
                        <Badge variant="outline">{alert.alert_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                RECAP Integration
              </CardTitle>
              <CardDescription>Access PACER data and contribute to the RECAP Archive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  RECAP functionality requires PACER credentials and should be used carefully. Contact support for
                  access to PACER fetch capabilities.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">PACER Fetch</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Purchase and download PACER content using our infrastructure
                    </p>
                    <Button variant="outline" disabled>
                      Configure PACER Access
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Bulk Data Access</h4>
                    <p className="text-sm text-gray-600 mb-3">Access comprehensive bulk exports of legal data</p>
                    <Button variant="outline">View Bulk Data</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
