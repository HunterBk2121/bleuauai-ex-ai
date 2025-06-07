"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

interface CitationResult {
  citationId: string
  originalCitation: string
  validationStatus: "valid" | "invalid" | "suspicious" | "corrected"
  semanticSimilarity: number
  textualMatch: boolean
  authorityScore: number
  correctedCitation?: string
  sourceDocument?: any
}

export function CitationValidator() {
  const [text, setText] = useState("")
  const [results, setResults] = useState<CitationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateCitations = async () => {
    if (!text.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/citations/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          options: {
            strictMode: false,
            autoCorrect: true,
            requireCryptographicMatch: false,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Validation failed")
      }

      const data = await response.json()
      setResults(data.checks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "suspicious":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "corrected":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800"
      case "invalid":
        return "bg-red-100 text-red-800"
      case "suspicious":
        return "bg-yellow-100 text-yellow-800"
      case "corrected":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Citation Validator</CardTitle>
          <CardDescription>
            Validate legal citations using CourtListener's database of 18+ million citations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter text containing legal citations to validate..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
          <Button onClick={validateCitations} disabled={loading || !text.trim()}>
            {loading ? "Validating..." : "Validate Citations"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Found {results.length} citation{results.length !== 1 ? "s" : ""} in the text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.validationStatus)}
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{result.originalCitation}</code>
                    </div>
                    <Badge className={getStatusColor(result.validationStatus)}>{result.validationStatus}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Similarity:</span> {Math.round(result.semanticSimilarity * 100)}%
                    </div>
                    <div>
                      <span className="font-medium">Authority:</span> {result.authorityScore}/100
                    </div>
                    <div>
                      <span className="font-medium">Text Match:</span> {result.textualMatch ? "Yes" : "No"}
                    </div>
                  </div>

                  {result.correctedCitation && (
                    <div className="bg-blue-50 p-3 rounded">
                      <span className="font-medium text-blue-800">Suggested correction:</span>
                      <code className="ml-2 text-sm bg-blue-100 px-2 py-1 rounded">{result.correctedCitation}</code>
                    </div>
                  )}

                  {result.sourceDocument && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Source:</span>
                        {result.sourceDocument.url && (
                          <a
                            href={result.sourceDocument.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {result.sourceDocument.title || result.sourceDocument.caseName}
                      </div>
                      {result.sourceDocument.court && (
                        <div className="text-xs text-gray-500">{result.sourceDocument.court}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
