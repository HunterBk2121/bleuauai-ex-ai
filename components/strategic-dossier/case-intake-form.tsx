"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Calendar, Users, Scale, FileText } from "lucide-react"

interface CaseIntakeFormProps {
  matterId: string
  onSubmit: (intakeData: any) => void
  onCancel: () => void
  loading?: boolean
}

export function CaseIntakeForm({ matterId, onSubmit, onCancel, loading }: CaseIntakeFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    factPattern: "",
    parties: [""],
    jurisdiction: "",
    practiceArea: "",
    causeOfAction: [""],
    proceduralHistory: "",
    keyDates: [{ date: "", event: "", significance: "" }],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Clean up empty entries
    const cleanedData = {
      ...formData,
      parties: formData.parties.filter((p) => p.trim()),
      causeOfAction: formData.causeOfAction.filter((c) => c.trim()),
      keyDates: formData.keyDates.filter((d) => d.date && d.event),
    }

    onSubmit(cleanedData)
  }

  const addParty = () => {
    setFormData((prev) => ({
      ...prev,
      parties: [...prev.parties, ""],
    }))
  }

  const removeParty = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      parties: prev.parties.filter((_, i) => i !== index),
    }))
  }

  const updateParty = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      parties: prev.parties.map((p, i) => (i === index ? value : p)),
    }))
  }

  const addCauseOfAction = () => {
    setFormData((prev) => ({
      ...prev,
      causeOfAction: [...prev.causeOfAction, ""],
    }))
  }

  const removeCauseOfAction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      causeOfAction: prev.causeOfAction.filter((_, i) => i !== index),
    }))
  }

  const updateCauseOfAction = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      causeOfAction: prev.causeOfAction.map((c, i) => (i === index ? value : c)),
    }))
  }

  const addKeyDate = () => {
    setFormData((prev) => ({
      ...prev,
      keyDates: [...prev.keyDates, { date: "", event: "", significance: "" }],
    }))
  }

  const removeKeyDate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyDates: prev.keyDates.filter((_, i) => i !== index),
    }))
  }

  const updateKeyDate = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      keyDates: prev.keyDates.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    }))
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scale className="h-6 w-6 mr-2" />
          Strategic Case Intake
        </CardTitle>
        <p className="text-gray-600">Provide comprehensive case details for AI-powered strategic analysis</p>
        <Badge variant="outline" className="w-fit">
          150 credits - Beginning Normal Flow
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Brief Descriptive Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Contract Breach - Acme Corp vs. Widget Inc."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                <Input
                  id="jurisdiction"
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData((prev) => ({ ...prev, jurisdiction: e.target.value }))}
                  placeholder="e.g., California, Federal"
                  required
                />
              </div>
              <div>
                <Label htmlFor="practiceArea">Practice Area *</Label>
                <Input
                  id="practiceArea"
                  value={formData.practiceArea}
                  onChange={(e) => setFormData((prev) => ({ ...prev, practiceArea: e.target.value }))}
                  placeholder="e.g., Commercial Litigation, Employment"
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Parties */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Involved Parties
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addParty}>
                <Plus className="h-4 w-4 mr-1" />
                Add Party
              </Button>
            </div>
            {formData.parties.map((party, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={party}
                  onChange={(e) => updateParty(index, e.target.value)}
                  placeholder="Party name and role"
                />
                {formData.parties.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeParty(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Cause of Action */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Cause(s) of Action</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCauseOfAction}>
                <Plus className="h-4 w-4 mr-1" />
                Add Cause
              </Button>
            </div>
            {formData.causeOfAction.map((cause, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={cause}
                  onChange={(e) => updateCauseOfAction(index, e.target.value)}
                  placeholder="e.g., Breach of Contract, Negligence"
                />
                {formData.causeOfAction.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeCauseOfAction(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Fact Pattern */}
          <div className="space-y-4">
            <Label htmlFor="factPattern" className="text-base font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Detailed Fact Pattern *
            </Label>
            <Textarea
              id="factPattern"
              value={formData.factPattern}
              onChange={(e) => setFormData((prev) => ({ ...prev, factPattern: e.target.value }))}
              placeholder="Provide comprehensive details including all events, facts, involved parties, procedural history, and relevant circumstances..."
              rows={8}
              required
            />
            <p className="text-sm text-gray-500">
              Include all relevant events, communications, agreements, and factual circumstances
            </p>
          </div>

          <Separator />

          {/* Key Dates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Key Dates & Events
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addKeyDate}>
                <Plus className="h-4 w-4 mr-1" />
                Add Date
              </Button>
            </div>
            {formData.keyDates.map((keyDate, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <div className="col-span-3">
                  <Input
                    type="date"
                    value={keyDate.date}
                    onChange={(e) => updateKeyDate(index, "date", e.target.value)}
                    placeholder="Date"
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    value={keyDate.event}
                    onChange={(e) => updateKeyDate(index, "event", e.target.value)}
                    placeholder="Event description"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    value={keyDate.significance}
                    onChange={(e) => updateKeyDate(index, "significance", e.target.value)}
                    placeholder="Significance"
                  />
                </div>
                <div className="col-span-1">
                  {formData.keyDates.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeKeyDate(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Procedural History */}
          <div className="space-y-4">
            <Label htmlFor="proceduralHistory" className="text-base font-medium">
              Procedural History (Optional)
            </Label>
            <Textarea
              id="proceduralHistory"
              value={formData.proceduralHistory}
              onChange={(e) => setFormData((prev) => ({ ...prev, proceduralHistory: e.target.value }))}
              placeholder="Any prior motions, rulings, discovery, or procedural developments..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Begin Strategic Analysis"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
