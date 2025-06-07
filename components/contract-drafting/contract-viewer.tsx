"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Share, Edit, AlertTriangle, CheckCircle, Lightbulb, Scale, Eye } from "lucide-react"
import type { ContractDraft } from "@/lib/services/contract-drafting"

interface ContractViewerProps {
  draft: ContractDraft
  onEdit?: () => void
  onExport?: () => void
  onShare?: () => void
}

export function ContractViewer({ draft, onEdit, onExport, onShare }: ContractViewerProps) {
  const [selectedClause, setSelectedClause] = useState<string | null>(null)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "improvement":
        return <Lightbulb className="h-4 w-4 text-blue-500" />
      case "alternative":
        return <Edit className="h-4 w-4 text-purple-500" />
      case "addition":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "removal":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="h-8 w-8 mr-3" />
            {draft.title}
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline">{draft.contractType}</Badge>
            <Badge variant="secondary">{draft.industry}</Badge>
            <Badge className={getRiskColor(draft.riskAssessment.overallRisk)}>
              {draft.riskAssessment.overallRisk} Risk
            </Badge>
            <span className="text-gray-600">Version {draft.version}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
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

      <Tabs defaultValue="contract" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="clauses">Clauses</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        {/* Contract Content */}
        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Document</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  Parties: {draft.parties.party1.definedName} & {draft.parties.party2.definedName}
                </span>
                <span>Jurisdiction: {draft.jurisdiction}</span>
                <span>Created: {new Date(draft.createdAt).toLocaleDateString()}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg border">
                  {draft.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clause Analysis */}
        <TabsContent value="clauses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clause Breakdown</CardTitle>
              <p className="text-gray-600">Individual clause analysis and alternatives</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {draft.clauses.map((clause, index) => (
                  <div
                    key={clause.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedClause === clause.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedClause(selectedClause === clause.id ? null : clause.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{clause.type}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {clause.source.replace("_", " ")}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(clause.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{clause.content}</p>

                    {selectedClause === clause.id && clause.alternatives && clause.alternatives.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium text-sm mb-2">Alternative Clauses:</h5>
                        <div className="space-y-2">
                          {clause.alternatives.map((alt, altIndex) => (
                            <div key={altIndex} className="p-3 bg-white rounded border text-sm">
                              {alt}
                            </div>
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

        {/* Risk Analysis */}
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="h-5 w-5 mr-2" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-medium">Overall Risk Level</h3>
                    <p className="text-sm text-gray-600">Comprehensive risk evaluation</p>
                  </div>
                  <Badge className={getRiskColor(draft.riskAssessment.overallRisk)} size="lg">
                    {draft.riskAssessment.overallRisk.toUpperCase()} RISK
                  </Badge>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Risk Factors by Clause</h4>
                  {draft.riskAssessment.riskFactors.map((factor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{factor.clause}</h5>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">Severity: {factor.severity}/10</div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                factor.severity >= 8
                                  ? "#ef4444"
                                  : factor.severity >= 6
                                    ? "#f97316"
                                    : factor.severity >= 4
                                      ? "#eab308"
                                      : "#22c55e",
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{factor.risk}</p>

                      <div className="bg-blue-50 p-3 rounded">
                        <h6 className="font-medium text-sm text-blue-800 mb-1">Mitigation Strategy:</h6>
                        <p className="text-sm text-blue-700">{factor.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {draft.suggestions
                  .sort((a, b) => b.priority - a.priority)
                  .map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getSuggestionIcon(suggestion.type)}
                          <h4 className="font-medium capitalize">
                            {suggestion.type.replace("_", " ")} - {suggestion.clause}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">Priority: {suggestion.priority}</div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                suggestion.priority >= 8
                                  ? "#ef4444"
                                  : suggestion.priority >= 6
                                    ? "#f97316"
                                    : suggestion.priority >= 4
                                      ? "#eab308"
                                      : "#22c55e",
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-sm mb-3">{suggestion.suggestion}</p>

                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm mb-1">Rationale:</h5>
                        <p className="text-sm text-gray-700">{suggestion.rationale}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
