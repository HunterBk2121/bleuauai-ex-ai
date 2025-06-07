"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Scale,
  Target,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  Download,
  Share,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react"
import type { StrategicDossier } from "@/lib/services/strategic-dossier"

interface DossierViewerProps {
  dossier: StrategicDossier
  onExport?: () => void
  onShare?: () => void
}

export function DossierViewer({ dossier, onExport, onShare }: DossierViewerProps) {
  const getStrengthColor = (strength: number) => {
    if (strength >= 0.8) return "text-green-600 bg-green-50"
    if (strength >= 0.6) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getStrengthLabel = (strength: number) => {
    if (strength >= 0.8) return "Strong"
    if (strength >= 0.6) return "Moderate"
    return "Weak"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Scale className="h-8 w-8 mr-3" />
            Strategic Dossier
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive case analysis and strategic recommendations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Confidence Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Analysis Confidence</h3>
              <p className="text-gray-600">Overall reliability of strategic assessment</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(dossier.confidence * 100)}%</div>
              <Badge
                className={dossier.confidence >= 0.8 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
              >
                {dossier.confidence >= 0.8 ? "High Confidence" : "Moderate Confidence"}
              </Badge>
            </div>
          </div>
          <Progress value={dossier.confidence * 100} className="mt-4" />
        </CardContent>
      </Card>

      <Tabs defaultValue="elements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="elements">Legal Elements</TabsTrigger>
          <TabsTrigger value="adversarial">Red Team</TabsTrigger>
          <TabsTrigger value="outcomes">Predictions</TabsTrigger>
          <TabsTrigger value="discovery">Discovery</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="judicial">Judicial</TabsTrigger>
        </TabsList>

        {/* Legal Elements Analysis */}
        <TabsContent value="elements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Legal Elements Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dossier.legalElements.map((element, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-lg">{element.element}</h4>
                      <Badge className={getStrengthColor(element.strength)}>
                        {getStrengthLabel(element.strength)} ({Math.round(element.strength * 100)}%)
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-4">{element.description}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm text-green-700 mb-2">Evidence Required:</h5>
                        <ul className="text-sm space-y-1">
                          {element.evidenceRequired.map((evidence, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {evidence}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {element.gaps.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm text-red-700 mb-2">Evidence Gaps:</h5>
                          <ul className="text-sm space-y-1">
                            {element.gaps.map((gap, idx) => (
                              <li key={idx} className="flex items-start">
                                <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adversarial Analysis */}
        <TabsContent value="adversarial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Adversarial Analysis (Red Team)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Position Strength Assessment</h4>
                    <p className="text-sm text-gray-600">Overall strength against adversarial challenges</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {Math.round(dossier.adversarialAnalysis.strengthAssessment * 100)}%
                    </div>
                    <Badge className={getStrengthColor(dossier.adversarialAnalysis.strengthAssessment)}>
                      {getStrengthLabel(dossier.adversarialAnalysis.strengthAssessment)}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Likely Defenses</h4>
                    <ul className="space-y-2">
                      {dossier.adversarialAnalysis.likelyDefenses.map((defense, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-sm">{defense}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Counter-Arguments</h4>
                    <ul className="space-y-2">
                      {dossier.adversarialAnalysis.counterArguments.map((argument, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-sm">{argument}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Position Weaknesses</h4>
                    <ul className="space-y-2">
                      {dossier.adversarialAnalysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Risk Factors</h4>
                    <ul className="space-y-2">
                      {dossier.adversarialAnalysis.riskFactors.map((risk, index) => (
                        <li key={index} className="flex items-start">
                          <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outcome Modeling */}
        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Predictive Outcome Modeling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Summary Judgment Probability</h4>
                    <div className="flex items-center justify-between">
                      <Progress
                        value={dossier.outcomeModeling.summaryJudgmentProbability * 100}
                        className="flex-1 mr-4"
                      />
                      <span className="font-bold">
                        {Math.round(dossier.outcomeModeling.summaryJudgmentProbability * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Trial Success Probability</h4>
                    <div className="flex items-center justify-between">
                      <Progress value={dossier.outcomeModeling.trialSuccessProbability * 100} className="flex-1 mr-4" />
                      <span className="font-bold">
                        {Math.round(dossier.outcomeModeling.trialSuccessProbability * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Settlement Range
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Low:</span>
                        <span className="font-medium">
                          ${dossier.outcomeModeling.settlementRange.low.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">High:</span>
                        <span className="font-medium">
                          ${dossier.outcomeModeling.settlementRange.high.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Recommended:</span>
                        <span className="font-bold text-green-600">
                          ${dossier.outcomeModeling.settlementRange.recommended.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Timeline & Costs
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Time to Resolution:</span>
                        <span className="font-medium">{dossier.outcomeModeling.timeToResolution} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Estimated Costs:</span>
                        <span className="font-medium">${dossier.outcomeModeling.estimatedCosts.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discovery Strategy */}
        <TabsContent value="discovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Discovery Imperatives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dossier.discoveryImperatives.map((imperative, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{imperative.category}</h4>
                        <p className="text-sm text-gray-600">{imperative.timeline}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            imperative.priority === "critical"
                              ? "bg-red-100 text-red-800"
                              : imperative.priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : imperative.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }
                        >
                          {imperative.priority}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">${imperative.estimatedCost.toLocaleString()}</div>
                      </div>
                    </div>
                    <p className="text-sm">{imperative.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategic Recommendations */}
        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dossier.recommendations
                  .sort((a, b) => b.priority - a.priority)
                  .map((recommendation, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium capitalize">{recommendation.type.replace("_", " ")}</h4>
                          <p className="text-sm text-gray-600">{recommendation.timeline}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">Priority: {recommendation.priority}</div>
                          <div
                            className="w-3 h-3 rounded-full bg-blue-500"
                            style={{
                              backgroundColor:
                                recommendation.priority >= 8
                                  ? "#ef4444"
                                  : recommendation.priority >= 6
                                    ? "#f97316"
                                    : recommendation.priority >= 4
                                      ? "#eab308"
                                      : "#22c55e",
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-sm mb-3">{recommendation.description}</p>

                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm mb-2">Rationale:</h5>
                        <p className="text-sm text-gray-700">{recommendation.rationale}</p>
                      </div>

                      {recommendation.resources.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium text-sm mb-2">Required Resources:</h5>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.resources.map((resource, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Judicial Analysis */}
        <TabsContent value="judicial" className="space-y-4">
          {dossier.judicialAnalysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="h-5 w-5 mr-2" />
                  Judicial Analysis - {dossier.judicialAnalysis.judgeName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Judicial Preferences</h4>
                      <ul className="space-y-2">
                        {dossier.judicialAnalysis.preferences.map((preference, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{preference}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Key Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Average Ruling Time:</span>
                          <span className="font-medium">{dossier.judicialAnalysis.averageRulingTime} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Favorability Score:</span>
                          <span className="font-medium">
                            {Math.round(dossier.judicialAnalysis.favorabilityScore * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Historical Rulings</h4>
                    <div className="space-y-3">
                      {dossier.judicialAnalysis.historicalRulings.map((ruling, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-sm">{ruling.case}</h5>
                            <Badge variant="outline">{Math.round(ruling.relevance * 100)}% relevant</Badge>
                          </div>
                          <p className="text-sm text-gray-700">{ruling.ruling}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Judicial Analysis Unavailable</h3>
                <p className="text-gray-600">
                  Judicial analytics require specific judge assignment and historical data access.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
