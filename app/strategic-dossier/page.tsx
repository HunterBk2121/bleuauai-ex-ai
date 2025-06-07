"use client"

import { useState } from "react"
import { CaseIntakeForm } from "@/components/strategic-dossier/case-intake-form"
import { DossierViewer } from "@/components/strategic-dossier/dossier-viewer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Plus, FileText, TrendingUp } from "lucide-react"

export default function StrategicDossierPage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "intake" | "dossier">("dashboard")
  const [currentDossier, setCurrentDossier] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Mock user ID - in real app, get from auth
  const userId = "user-123"
  const matterId = "matter-456"

  const handleIntakeSubmit = async (intakeData: any) => {
    setLoading(true)
    try {
      // Create case intake
      const intakeResponse = await fetch("/api/strategic-dossier/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, matterId, ...intakeData }),
      })

      const intakeResult = await intakeResponse.json()

      if (!intakeResult.success) {
        throw new Error(intakeResult.error)
      }

      // Generate strategic dossier
      const dossierResponse = await fetch("/api/strategic-dossier/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, intakeId: intakeResult.intake.id }),
      })

      const dossierResult = await dossierResponse.json()

      if (!dossierResult.success) {
        throw new Error(dossierResult.error)
      }

      setCurrentDossier(dossierResult.dossier)
      setCurrentView("dossier")
    } catch (error) {
      console.error("Error generating dossier:", error)
      alert("Failed to generate strategic dossier. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleExportDossier = () => {
    // Export functionality
    console.log("Exporting dossier...")
  }

  const handleShareDossier = () => {
    // Share functionality
    console.log("Sharing dossier...")
  }

  if (currentView === "intake") {
    return (
      <div className="container mx-auto py-8">
        <CaseIntakeForm
          matterId={matterId}
          onSubmit={handleIntakeSubmit}
          onCancel={() => setCurrentView("dashboard")}
          loading={loading}
        />
      </div>
    )
  }

  if (currentView === "dossier" && currentDossier) {
    return (
      <div className="container mx-auto py-8">
        <DossierViewer dossier={currentDossier} onExport={handleExportDossier} onShare={handleShareDossier} />
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
            <Scale className="h-10 w-10 mr-4" />
            Strategic Dossier
          </h1>
          <p className="text-xl text-gray-600 mt-2">Transform reactive research into proactive strategic planning</p>
        </div>
        <Button onClick={() => setCurrentView("intake")} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          New Case Analysis
        </Button>
      </div>

      {/* Feature Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Socratic Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              AI-guided case intake with intelligent follow-up questions to ensure comprehensive fact gathering.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Predictive Modeling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Advanced outcome modeling with settlement ranges, success probabilities, and timeline predictions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              Adversarial Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Red team analysis identifying weaknesses, likely defenses, and counter-strategies.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Dossiers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Strategic Dossiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Scale className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No strategic dossiers yet</p>
            <p className="text-sm">Create your first case analysis to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
