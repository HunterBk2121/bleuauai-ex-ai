"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { FileText, Upload, Zap } from "lucide-react"

interface ContractDraftingFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export function ContractDraftingForm({ onSubmit, onCancel, loading }: ContractDraftingFormProps) {
  const [formData, setFormData] = useState({
    contractType: "",
    industry: "",
    party1Name: "",
    party1DefinedName: "",
    party2Name: "",
    party2DefinedName: "",
    country: "",
    jurisdiction: "",
    factsAndGuidance: "",
    advancedModel: false,
    relatedDocuments: [] as File[],
  })

  const contractTypes = [
    "Vendor Services Agreement",
    "Software License Agreement",
    "Employment Agreement",
    "Non-Disclosure Agreement",
    "Master Service Agreement",
    "Purchase Agreement",
    "Consulting Agreement",
    "Partnership Agreement",
    "Lease Agreement",
    "Distribution Agreement",
  ]

  const industries = [
    "Software",
    "Healthcare",
    "Financial Services",
    "Manufacturing",
    "Retail",
    "Real Estate",
    "Energy",
    "Education",
    "Government",
    "Non-Profit",
  ]

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Australia",
    "Japan",
    "Singapore",
    "Other",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({
      ...prev,
      relatedDocuments: [...prev.relatedDocuments, ...files],
    }))
  }

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      relatedDocuments: prev.relatedDocuments.filter((_, i) => i !== index),
    }))
  }

  const estimatedCredits = Math.max(1, Math.ceil((formData.factsAndGuidance.length || 500) / 500)) * 4

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          Contract Drafting Engine
        </CardTitle>
        <p className="text-gray-600">Generate comprehensive contracts with AI-powered clause intelligence</p>
        <Badge variant="outline" className="w-fit">
          ~{estimatedCredits} credits (4 per page)
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contract Type and Industry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractType">Type of Contract *</Label>
              <Select
                value={formData.contractType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, contractType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parties */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contracting Parties</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="party1Name">Party 1 Name *</Label>
                <Input
                  id="party1Name"
                  value={formData.party1Name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, party1Name: e.target.value }))}
                  placeholder="Full legal name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="party1DefinedName">Party 1 Defined Name *</Label>
                <Input
                  id="party1DefinedName"
                  value={formData.party1DefinedName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, party1DefinedName: e.target.value }))}
                  placeholder="e.g., Company, Client, Vendor"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="party2Name">Party 2 Name *</Label>
                <Input
                  id="party2Name"
                  value={formData.party2Name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, party2Name: e.target.value }))}
                  placeholder="Full legal name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="party2DefinedName">Party 2 Defined Name *</Label>
                <Input
                  id="party2DefinedName"
                  value={formData.party2DefinedName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, party2DefinedName: e.target.value }))}
                  placeholder="e.g., Service Provider, Contractor"
                  required
                />
              </div>
            </div>
          </div>

          {/* Jurisdiction */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jurisdiction">Jurisdiction *</Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => setFormData((prev) => ({ ...prev, jurisdiction: e.target.value }))}
                placeholder="e.g., Delaware, New York, California"
                required
              />
            </div>
          </div>

          {/* Facts and Guidance */}
          <div>
            <Label htmlFor="factsAndGuidance">Facts to Consider or General Guidance *</Label>
            <Textarea
              id="factsAndGuidance"
              value={formData.factsAndGuidance}
              onChange={(e) => setFormData((prev) => ({ ...prev, factsAndGuidance: e.target.value }))}
              placeholder="Provide specific terms, requirements, deal structure, key provisions, or any other guidance for the contract..."
              rows={6}
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Include payment terms, deliverables, timelines, special requirements, and any specific clauses needed
            </p>
          </div>

          {/* Related Documents */}
          <div>
            <Label>Upload Related Documents (Optional)</Label>
            <div className="mt-2">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload existing contracts, templates, or related documents for personalization
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                  Choose Files
                </Button>
              </div>

              {formData.relatedDocuments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.relatedDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Model Toggle */}
          <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
            <Switch
              id="advancedModel"
              checked={formData.advancedModel}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, advancedModel: checked }))}
            />
            <div className="flex-1">
              <Label htmlFor="advancedModel" className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Advanced Model in Key Areas (Slower)
              </Label>
              <p className="text-sm text-gray-600">
                Use more sophisticated AI processing for critical contract sections
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.contractType || !formData.industry}>
              {loading ? "Generating..." : "Generate Contract"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
