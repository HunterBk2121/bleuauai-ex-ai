/**
 * Generative Drafting & Clause Intelligence Engine
 * Context-driven contract drafting with firm-wide intelligence
 */

import { createClient } from "@supabase/supabase-js"
import { llmService } from "@/lib/ai/llm-service"
import { embeddingService } from "@/lib/ai/embedding-service"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface ContractDraftingRequest {
  contractType: string
  industry: string
  party1Name: string
  party1DefinedName: string
  party2Name: string
  party2DefinedName: string
  country: string
  jurisdiction: string
  factsAndGuidance: string
  relatedDocuments?: File[]
  matterId?: string
  templateId?: string
  customClauses?: string[]
}

export interface ClauseIntelligence {
  id: string
  clauseType: string
  title: string
  content: string
  industry: string[]
  contractTypes: string[]
  riskLevel: "low" | "medium" | "high"
  favorability: "favorable" | "neutral" | "unfavorable"
  negotiationSuccess: number // 0-1
  usageCount: number
  lastUsed: string
  createdBy: string
  tags: string[]
  alternatives: string[]
  metadata: {
    jurisdiction: string[]
    dealSize: string[]
    marketStandard: boolean
    customization: string[]
  }
}

export interface ContractDraft {
  id: string
  title: string
  content: string
  contractType: string
  industry: string
  parties: {
    party1: { name: string; definedName: string }
    party2: { name: string; definedName: string }
  }
  jurisdiction: string
  clauses: Array<{
    id: string
    type: string
    content: string
    source: "template" | "ai_generated" | "clause_library" | "custom"
    confidence: number
    alternatives?: string[]
  }>
  riskAssessment: {
    overallRisk: "low" | "medium" | "high"
    riskFactors: Array<{
      clause: string
      risk: string
      severity: number
      mitigation: string
    }>
  }
  suggestions: Array<{
    type: "improvement" | "alternative" | "addition" | "removal"
    clause: string
    suggestion: string
    rationale: string
    priority: number
  }>
  version: number
  matterId?: string
  createdAt: string
  updatedAt: string
}

export class ContractDraftingService {
  /**
   * Generate contract draft
   */
  async generateContractDraft(request: ContractDraftingRequest): Promise<ContractDraft> {
    try {
      // Analyze related documents if provided
      let documentContext = ""
      if (request.relatedDocuments && request.relatedDocuments.length > 0) {
        documentContext = await this.analyzeRelatedDocuments(request.relatedDocuments)
      }

      // Get relevant clauses from library
      const relevantClauses = await this.getRelevantClauses(
        request.contractType,
        request.industry,
        request.jurisdiction,
      )

      // Generate contract using AI
      const draftContent = await this.generateContractContent(request, documentContext, relevantClauses)

      // Perform risk assessment
      const riskAssessment = await this.assessContractRisk(draftContent, request)

      // Generate suggestions
      const suggestions = await this.generateSuggestions(draftContent, request, relevantClauses)

      const draft: ContractDraft = {
        id: crypto.randomUUID(),
        title: `${request.contractType} - ${request.party1Name} & ${request.party2Name}`,
        content: draftContent.content,
        contractType: request.contractType,
        industry: request.industry,
        parties: {
          party1: { name: request.party1Name, definedName: request.party1DefinedName },
          party2: { name: request.party2Name, definedName: request.party2DefinedName },
        },
        jurisdiction: request.jurisdiction,
        clauses: draftContent.clauses,
        riskAssessment,
        suggestions,
        version: 1,
        matterId: request.matterId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to database
      await this.saveDraft(draft)

      return draft
    } catch (error) {
      console.error("Error generating contract draft:", error)
      throw error
    }
  }

  /**
   * Generate contract content using AI
   */
  private async generateContractContent(
    request: ContractDraftingRequest,
    documentContext: string,
    relevantClauses: ClauseIntelligence[],
  ): Promise<{
    content: string
    clauses: ContractDraft["clauses"]
  }> {
    const prompt = `
      Generate a comprehensive ${request.contractType} contract with the following details:
      
      Parties:
      - ${request.party1DefinedName} ("${request.party1Name}")
      - ${request.party2DefinedName} ("${request.party2Name}")
      
      Industry: ${request.industry}
      Jurisdiction: ${request.jurisdiction}
      Country: ${request.country}
      
      Facts and Guidance: ${request.factsAndGuidance}
      
      ${documentContext ? `Related Document Context: ${documentContext}` : ""}
      
      Available Clause Library:
      ${relevantClauses.map((c) => `- ${c.title}: ${c.content.substring(0, 200)}...`).join("\n")}
      
      Generate a complete, professional contract with:
      1. Proper legal structure and formatting
      2. Industry-specific provisions
      3. Jurisdiction-appropriate language
      4. Risk-balanced terms
      5. Clear defined terms
      6. Standard boilerplate clauses
      
      Return the contract in a structured format with identified clause sections.
    `

    const response = await llmService.generateText({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      maxTokens: 4000,
    })

    // Parse the response to extract clauses
    const clauses = this.extractClausesFromContent(response.text, relevantClauses)

    return {
      content: response.text,
      clauses,
    }
  }

  /**
   * Get relevant clauses from library
   */
  private async getRelevantClauses(
    contractType: string,
    industry: string,
    jurisdiction: string,
  ): Promise<ClauseIntelligence[]> {
    try {
      const { data, error } = await supabase
        .from("clause_library")
        .select("*")
        .contains("contract_types", [contractType])
        .contains("industry", [industry])
        .order("negotiation_success", { ascending: false })
        .limit(20)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching relevant clauses:", error)
      return []
    }
  }

  /**
   * Analyze related documents
   */
  private async analyzeRelatedDocuments(documents: File[]): Promise<string> {
    // This would extract text from documents and analyze them
    // For now, return placeholder
    return "Related document analysis would be performed here"
  }

  /**
   * Extract clauses from generated content
   */
  private extractClausesFromContent(content: string, relevantClauses: ClauseIntelligence[]): ContractDraft["clauses"] {
    // This would use NLP to identify and extract clause sections
    // For now, return basic structure
    const standardClauses = [
      "Definitions",
      "Scope of Work",
      "Payment Terms",
      "Term and Termination",
      "Intellectual Property",
      "Confidentiality",
      "Limitation of Liability",
      "Indemnification",
      "Governing Law",
      "Dispute Resolution",
    ]

    return standardClauses.map((clauseType, index) => ({
      id: crypto.randomUUID(),
      type: clauseType,
      content: `[${clauseType} clause content would be extracted here]`,
      source: "ai_generated" as const,
      confidence: 0.85,
      alternatives: [],
    }))
  }

  /**
   * Assess contract risk
   */
  private async assessContractRisk(
    content: { content: string; clauses: ContractDraft["clauses"] },
    request: ContractDraftingRequest,
  ): Promise<ContractDraft["riskAssessment"]> {
    const prompt = `
      Analyze the risk factors in this contract:
      ${content.content.substring(0, 2000)}
      
      Identify:
      1. Overall risk level (low/medium/high)
      2. Specific risk factors by clause
      3. Severity ratings (1-10)
      4. Mitigation strategies
      
      Return as JSON with riskFactors array.
    `

    try {
      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      const analysis = JSON.parse(response.text)
      return {
        overallRisk: analysis.overallRisk || "medium",
        riskFactors: analysis.riskFactors || [],
      }
    } catch {
      return {
        overallRisk: "medium",
        riskFactors: [],
      }
    }
  }

  /**
   * Generate suggestions for improvement
   */
  private async generateSuggestions(
    content: { content: string; clauses: ContractDraft["clauses"] },
    request: ContractDraftingRequest,
    relevantClauses: ClauseIntelligence[],
  ): Promise<ContractDraft["suggestions"]> {
    const prompt = `
      Review this contract and provide improvement suggestions:
      ${content.content.substring(0, 2000)}
      
      Consider:
      1. Market standard practices for ${request.industry}
      2. Jurisdiction requirements for ${request.jurisdiction}
      3. Risk optimization opportunities
      4. Alternative clause options
      
      Return suggestions as JSON array with type, clause, suggestion, rationale, priority.
    `

    try {
      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      })

      const suggestions = JSON.parse(response.text)
      return suggestions.suggestions || []
    } catch {
      return []
    }
  }

  /**
   * Save draft to database
   */
  private async saveDraft(draft: ContractDraft): Promise<void> {
    try {
      await supabase.from("contract_drafts").insert({
        id: draft.id,
        title: draft.title,
        content: draft.content,
        contract_type: draft.contractType,
        industry: draft.industry,
        parties: draft.parties,
        jurisdiction: draft.jurisdiction,
        clauses: draft.clauses,
        risk_assessment: draft.riskAssessment,
        suggestions: draft.suggestions,
        version: draft.version,
        matter_id: draft.matterId,
        created_at: draft.createdAt,
        updated_at: draft.updatedAt,
      })
    } catch (error) {
      console.error("Error saving draft:", error)
      throw error
    }
  }

  /**
   * Add clause to library
   */
  async addClauseToLibrary(clause: Omit<ClauseIntelligence, "id" | "usageCount" | "lastUsed">): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("clause_library")
        .insert({
          clause_type: clause.clauseType,
          title: clause.title,
          content: clause.content,
          industry: clause.industry,
          contract_types: clause.contractTypes,
          risk_level: clause.riskLevel,
          favorability: clause.favorability,
          negotiation_success: clause.negotiationSuccess,
          usage_count: 0,
          created_by: clause.createdBy,
          tags: clause.tags,
          alternatives: clause.alternatives,
          metadata: clause.metadata,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error("Error adding clause to library:", error)
      throw error
    }
  }

  /**
   * Search clause library
   */
  async searchClauseLibrary(
    query: string,
    filters?: {
      contractType?: string
      industry?: string
      riskLevel?: string
    },
  ): Promise<ClauseIntelligence[]> {
    try {
      // Generate embedding for semantic search
      const queryEmbedding = await embeddingService.generateEmbedding(query)

      let queryBuilder = supabase.from("clause_library").select("*")

      if (filters?.contractType) {
        queryBuilder = queryBuilder.contains("contract_types", [filters.contractType])
      }
      if (filters?.industry) {
        queryBuilder = queryBuilder.contains("industry", [filters.industry])
      }
      if (filters?.riskLevel) {
        queryBuilder = queryBuilder.eq("risk_level", filters.riskLevel)
      }

      const { data, error } = await queryBuilder.order("negotiation_success", { ascending: false }).limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error searching clause library:", error)
      return []
    }
  }
}

export const contractDraftingService = new ContractDraftingService()
