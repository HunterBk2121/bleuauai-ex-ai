"use client"

import { useState } from "react"
import { ContractDraftingForm } from "@/components/contract-drafting/contract-drafting-form"
import { ContractViewer } from "@/components/contract-drafting/contract-viewer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, Zap, Shield, Brain } from "lucide-react"

export default function ContractDraftingPage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "form" | "viewer">("dashboard")
  const [currentDraft, setCurrentDraft] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Mock user ID - in real app, get from auth
  const userId = "user-123"

  const handleDraftingSubmit = async (draftingData: any) => {
    setLoading(true)
    try {
      const response = await fetch("/api/contract-drafting/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...draftingData }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      setCurrentDraft(result.draft)
      setCurrentView("viewer")
    } catch (error) {
      console.error("Error generating contract:", error)
      alert("Failed to generate contract. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditContract = () => {
    setCurrentView("form")
  }

  const handleExportContract = () => {
    // Export functionality
    console.log("Exporting contract...")
  }

  const handleShareContract = () => {
    // Share functionality
    console.log("Sharing contract...")
  }

  if (currentView === "form") {
    return (
      <div className="container mx-auto py-8">
        <ContractDraftingForm
          onSubmit={handleDraftingSubmit}
          onCancel={() => setCurrentView("dashboard")}
          loading={loading}
        />
      </div>
    )
  }

  if (currentView === "viewer" && currentDraft) {
    return (
      <div className="container mx-auto py-8">
        <ContractViewer
          draft={currentDraft}
          onEdit={handleEditContract}
          onExport={handleExportContract}
          onShare={handleShareContract}
        />
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold flex items-center">
            <FileText className="h-10 w-10 mr-4" />
            Contract Drafting Engine
          </h1>
          <p className="text-xl text-gray-600 mt-2">Context-driven contract generation with firm-wide intelligence</p>
        </div>
        <Button onClick={() => setCurrentView("form")} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Draft New Contract
        </Button>
      </div>

      {/* Feature Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Clause Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              AI-powered clause library with negotiation success rates and market-standard alternatives.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Comprehensive risk analysis with mitigation strategies and favorability scoring.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Smart Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Context-aware drafting with industry-specific provisions and jurisdiction compliance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contract Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No contract drafts yet</p>
            <p className="text-sm">Create your first contract to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
