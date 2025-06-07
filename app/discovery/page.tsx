"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Plus, FileText, Search, BarChart3 } from "lucide-react"

export default function DiscoveryPage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "create" | "initiative">("dashboard")

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold flex items-center">
            <Eye className="h-10 w-10 mr-4" />
            Discovery Engine
          </h1>
          <p className="text-xl text-gray-600 mt-2">Autonomous discovery lifecycle management</p>
        </div>
        <Button onClick={() => setCurrentView("create")} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          New Discovery Initiative
        </Button>
      </div>

      {/* Feature Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Document Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              AI-powered document analysis with relevance scoring, privilege detection, and sentiment analysis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Smart Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Automated document categorization and prioritization to streamline the review process.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Deposition Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Transcript analysis with inconsistency detection and follow-up question generation.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Discovery Initiatives */}
      <Card>
        <CardHeader>
          <CardTitle>Discovery Initiatives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No discovery initiatives yet</p>
            <p className="text-sm">Create your first discovery initiative to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
