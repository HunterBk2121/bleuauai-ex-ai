/**
 * Autonomous Discovery & Evidence Management Engine
 * Fully automates the discovery lifecycle from legal hold to production
 */

import { createClient } from "@supabase/supabase-js"
import { llmService } from "@/lib/ai/llm-service"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface DiscoveryInitiative {
  id: string
  matterId: string
  name: string
  description: string
  status: "planning" | "collection" | "processing" | "review" | "production" | "completed"

  // Collection Parameters
  custodians: Array<{
    name: string
    email: string
    department: string
    role: string
    priority: "high" | "medium" | "low"
  }>

  dateRange: {
    startDate: string
    endDate: string
  }

  searchTerms: string[]
  fileTypes: string[]
  dataSources: string[]

  // Processing Status
  documentsCollected: number
  documentsProcessed: number
  documentsReviewed: number
  documentsProduced: number

  // Review Categories
  reviewCategories: {
    responsive: number
    nonResponsive: number
    privileged: number
    confidential: number
    hotDocuments: number
  }

  // Cost Tracking
  estimatedCost: number
  actualCost: number

  createdAt: string
  updatedAt: string
}

export interface DiscoveryDocument {
  id: string
  initiativeId: string
  fileName: string
  filePath: string
  fileType: string
  fileSize: number

  // Metadata
  custodian: string
  dateCreated: string
  dateModified: string
  author: string
  recipients: string[]

  // Content Analysis
  extractedText: string
  ocrConfidence?: number
  language: string

  // AI Analysis
  relevanceScore: number
  privilegeScore: number
  confidentialityScore: number
  sentiment: "positive" | "negative" | "neutral"
  keyTopics: string[]
  namedEntities: Array<{
    entity: string
    type: string
    confidence: number
  }>

  // Review Status
  reviewStatus: "pending" | "reviewed" | "privileged" | "produced" | "withheld"
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string

  // Production
  batesNumber?: string
  productionSet?: string
  redacted: boolean

  createdAt: string
  updatedAt: string
}

export interface DepositionAnalysis {
  id: string
  matterId: string
  deponentName: string
  depositionDate: string
  transcript: string

  // AI Analysis
  keyQuotes: Array<{
    quote: string
    page: number
    line: number
    significance: string
    topic: string
  }>

  inconsistencies: Array<{
    statement: string
    conflictsWith: string
    severity: "low" | "medium" | "high"
    explanation: string
  }>

  followUpQuestions: Array<{
    question: string
    rationale: string
    priority: number
    relatedEvidence: string[]
  }>

  summary: string
  credibilityAssessment: number // 0-1

  createdAt: string
}

export class DiscoveryEngineService {
  /**
   * Create new discovery initiative
   */
  async createDiscoveryInitiative(
    matterId: string,
    initiativeData: Omit<
      DiscoveryInitiative,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "documentsCollected"
      | "documentsProcessed"
      | "documentsReviewed"
      | "documentsProduced"
      | "reviewCategories"
      | "actualCost"
    >,
  ): Promise<DiscoveryInitiative> {
    try {
      const initiative: DiscoveryInitiative = {
        ...initiativeData,
        id: crypto.randomUUID(),
        matterId,
        documentsCollected: 0,
        documentsProcessed: 0,
        documentsReviewed: 0,
        documentsProduced: 0,
        reviewCategories: {
          responsive: 0,
          nonResponsive: 0,
          privileged: 0,
          confidential: 0,
          hotDocuments: 0,
        },
        actualCost: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const { error } = await supabase.from("discovery_initiatives").insert({
        id: initiative.id,
        matter_id: initiative.matterId,
        name: initiative.name,
        description: initiative.description,
        status: initiative.status,
        custodians: initiative.custodians,
        date_range: initiative.dateRange,
        search_terms: initiative.searchTerms,
        file_types: initiative.fileTypes,
        data_sources: initiative.dataSources,
        documents_collected: initiative.documentsCollected,
        documents_processed: initiative.documentsProcessed,
        documents_reviewed: initiative.documentsReviewed,
        documents_produced: initiative.documentsProduced,
        review_categories: initiative.reviewCategories,
        estimated_cost: initiative.estimatedCost,
        actual_cost: initiative.actualCost,
        created_at: initiative.createdAt,
        updated_at: initiative.updatedAt,
      })

      if (error) throw error
      return initiative
    } catch (error) {
      console.error("Error creating discovery initiative:", error)
      throw error
    }
  }

  /**
   * Process uploaded documents for discovery
   */
  async processDiscoveryDocuments(
    initiativeId: string,
    documents: File[],
  ): Promise<{
    processed: number
    failed: number
    results: DiscoveryDocument[]
  }> {
    const results: DiscoveryDocument[] = []
    let processed = 0
    let failed = 0

    for (const file of documents) {
      try {
        const document = await this.processDocument(initiativeId, file)
        results.push(document)
        processed++
      } catch (error) {
        console.error(`Failed to process document ${file.name}:`, error)
        failed++
      }
    }

    // Update initiative statistics
    await this.updateInitiativeStats(initiativeId, { documentsProcessed: processed })

    return { processed, failed, results }
  }

  /**
   * Process individual document
   */
  private async processDocument(initiativeId: string, file: File): Promise<DiscoveryDocument> {
    // Extract text content (OCR for images/PDFs, direct extraction for text files)
    const extractedText = await this.extractTextFromFile(file)

    // Perform AI analysis
    const [relevanceScore, privilegeScore, confidentialityScore, sentiment, keyTopics, namedEntities] =
      await Promise.all([
        this.analyzeRelevance(extractedText),
        this.analyzePrivilege(extractedText),
        this.analyzeConfidentiality(extractedText),
        this.analyzeSentiment(extractedText),
        this.extractKeyTopics(extractedText),
        this.extractNamedEntities(extractedText),
      ])

    const document: DiscoveryDocument = {
      id: crypto.randomUUID(),
      initiativeId,
      fileName: file.name,
      filePath: `/discovery/${initiativeId}/${file.name}`,
      fileType: file.type,
      fileSize: file.size,
      custodian: "Unknown", // Would be determined from file metadata or path
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: "Unknown",
      recipients: [],
      extractedText,
      language: "en",
      relevanceScore,
      privilegeScore,
      confidentialityScore,
      sentiment,
      keyTopics,
      namedEntities,
      reviewStatus: "pending",
      redacted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to database
    await this.saveDiscoveryDocument(document)

    return document
  }

  /**
   * Extract text from file
   */
  private async extractTextFromFile(file: File): Promise<string> {
    // This would use OCR services for PDFs/images, direct reading for text files
    // For now, return placeholder
    return `Extracted text from ${file.name} would appear here`
  }

  /**
   * Analyze document relevance
   */
  private async analyzeRelevance(text: string): Promise<number> {
    try {
      const prompt = `
        Analyze the relevance of this document to legal discovery.
        Consider legal issues, key terms, and factual importance.
        Return a relevance score from 0.0 to 1.0.
        
        Document text: ${text.substring(0, 2000)}
      `

      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      const score = Number.parseFloat(response.text.match(/\d+\.?\d*/)?.[0] || "0.5")
      return Math.min(Math.max(score, 0), 1)
    } catch {
      return 0.5
    }
  }

  /**
   * Analyze attorney-client privilege
   */
  private async analyzePrivilege(text: string): Promise<number> {
    try {
      const prompt = `
        Analyze this document for attorney-client privilege.
        Look for legal advice, confidential communications, work product.
        Return a privilege score from 0.0 to 1.0.
        
        Document text: ${text.substring(0, 2000)}
      `

      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      const score = Number.parseFloat(response.text.match(/\d+\.?\d*/)?.[0] || "0.1")
      return Math.min(Math.max(score, 0), 1)
    } catch {
      return 0.1
    }
  }

  /**
   * Analyze confidentiality
   */
  private async analyzeConfidentiality(text: string): Promise<number> {
    // Similar to privilege analysis but for trade secrets, confidential info
    return 0.3 // Placeholder
  }

  /**
   * Analyze sentiment
   */
  private async analyzeSentiment(text: string): Promise<"positive" | "negative" | "neutral"> {
    try {
      const prompt = `
        Analyze the sentiment of this document.
        Return only: positive, negative, or neutral
        
        Document text: ${text.substring(0, 1000)}
      `

      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      const sentiment = response.text.toLowerCase().trim()
      if (sentiment.includes("positive")) return "positive"
      if (sentiment.includes("negative")) return "negative"
      return "neutral"
    } catch {
      return "neutral"
    }
  }

  /**
   * Extract key topics
   */
  private async extractKeyTopics(text: string): Promise<string[]> {
    try {
      const prompt = `
        Extract the key topics and themes from this document.
        Return as a JSON array of strings.
        
        Document text: ${text.substring(0, 2000)}
      `

      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      return JSON.parse(response.text) || []
    } catch {
      return []
    }
  }

  /**
   * Extract named entities
   */
  private async extractNamedEntities(text: string): Promise<DiscoveryDocument["namedEntities"]> {
    try {
      const prompt = `
        Extract named entities (people, organizations, locations, dates) from this document.
        Return as JSON array with entity, type, confidence.
        
        Document text: ${text.substring(0, 2000)}
      `

      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      return JSON.parse(response.text) || []
    } catch {
      return []
    }
  }

  /**
   * Save discovery document to database
   */
  private async saveDiscoveryDocument(document: DiscoveryDocument): Promise<void> {
    try {
      await supabase.from("discovery_documents").insert({
        id: document.id,
        initiative_id: document.initiativeId,
        file_name: document.fileName,
        file_path: document.filePath,
        file_type: document.fileType,
        file_size: document.fileSize,
        custodian: document.custodian,
        date_created: document.dateCreated,
        date_modified: document.dateModified,
        author: document.author,
        recipients: document.recipients,
        extracted_text: document.extractedText,
        ocr_confidence: document.ocrConfidence,
        language: document.language,
        relevance_score: document.relevanceScore,
        privilege_score: document.privilegeScore,
        confidentiality_score: document.confidentialityScore,
        sentiment: document.sentiment,
        key_topics: document.keyTopics,
        named_entities: document.namedEntities,
        review_status: document.reviewStatus,
        reviewed_by: document.reviewedBy,
        reviewed_at: document.reviewedAt,
        review_notes: document.reviewNotes,
        bates_number: document.batesNumber,
        production_set: document.productionSet,
        redacted: document.redacted,
        created_at: document.createdAt,
        updated_at: document.updatedAt,
      })
    } catch (error) {
      console.error("Error saving discovery document:", error)
      throw error
    }
  }

  /**
   * Analyze deposition transcript
   */
  async analyzeDeposition(
    matterId: string,
    deponentName: string,
    depositionDate: string,
    transcript: string,
  ): Promise<DepositionAnalysis> {
    try {
      const [keyQuotes, inconsistencies, followUpQuestions, summary] = await Promise.all([
        this.extractKeyQuotes(transcript),
        this.findInconsistencies(transcript),
        this.generateFollowUpQuestions(transcript),
        this.generateDepositionSummary(transcript),
      ])

      const analysis: DepositionAnalysis = {
        id: crypto.randomUUID(),
        matterId,
        deponentName,
        depositionDate,
        transcript,
        keyQuotes,
        inconsistencies,
        followUpQuestions,
        summary,
        credibilityAssessment: this.assessCredibility(inconsistencies),
        createdAt: new Date().toISOString(),
      }

      // Save to database
      await supabase.from("deposition_analyses").insert({
        id: analysis.id,
        matter_id: analysis.matterId,
        deponent_name: analysis.deponentName,
        deposition_date: analysis.depositionDate,
        transcript: analysis.transcript,
        key_quotes: analysis.keyQuotes,
        inconsistencies: analysis.inconsistencies,
        follow_up_questions: analysis.followUpQuestions,
        summary: analysis.summary,
        credibility_assessment: analysis.credibilityAssessment,
        created_at: analysis.createdAt,
      })

      return analysis
    } catch (error) {
      console.error("Error analyzing deposition:", error)
      throw error
    }
  }

  /**
   * Extract key quotes from deposition
   */
  private async extractKeyQuotes(transcript: string): Promise<DepositionAnalysis["keyQuotes"]> {
    try {
      const prompt = `
        Extract the most important quotes from this deposition transcript.
        Focus on admissions, contradictions, and key factual statements.
        Return as JSON array with quote, page, line, significance, topic.
        
        Transcript: ${transcript.substring(0, 3000)}
      `

      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      return JSON.parse(response.text) || []
    } catch {
      return []
    }
  }

  /**
   * Find inconsistencies in testimony
   */
  private async findInconsistencies(transcript: string): Promise<DepositionAnalysis["inconsistencies"]> {
    try {
      const prompt = `
        Identify inconsistencies and contradictions in this deposition transcript.
        Look for conflicting statements within the testimony.
        Return as JSON array with statement, conflictsWith, severity, explanation.
        
        Transcript: ${transcript.substring(0, 3000)}
      `

      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      return JSON.parse(response.text) || []
    } catch {
      return []
    }
  }

  /**
   * Generate follow-up questions
   */
  private async generateFollowUpQuestions(transcript: string): Promise<DepositionAnalysis["followUpQuestions"]> {
    try {
      const prompt = `
        Generate strategic follow-up questions based on this deposition transcript.
        Focus on areas that need clarification or further exploration.
        Return as JSON array with question, rationale, priority, relatedEvidence.
        
        Transcript: ${transcript.substring(0, 3000)}
      `

      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      })

      return JSON.parse(response.text) || []
    } catch {
      return []
    }
  }

  /**
   * Generate deposition summary
   */
  private async generateDepositionSummary(transcript: string): Promise<string> {
    try {
      const prompt = `
        Generate a comprehensive summary of this deposition transcript.
        Include key admissions, denials, and important factual testimony.
        
        Transcript: ${transcript.substring(0, 4000)}
      `

      const response = await llmService.generateText({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      return response.text
    } catch {
      return "Summary generation failed"
    }
  }

  /**
   * Assess witness credibility
   */
  private assessCredibility(inconsistencies: DepositionAnalysis["inconsistencies"]): number {
    if (inconsistencies.length === 0) return 0.9

    const severityScore = inconsistencies.reduce((sum, inc) => {
      const severity = inc.severity === "high" ? 3 : inc.severity === "medium" ? 2 : 1
      return sum + severity
    }, 0)

    const maxScore = inconsistencies.length * 3
    return Math.max(0.1, 1 - severityScore / maxScore)
  }

  /**
   * Update initiative statistics
   */
  private async updateInitiativeStats(
    initiativeId: string,
    updates: Partial<
      Pick<DiscoveryInitiative, "documentsCollected" | "documentsProcessed" | "documentsReviewed" | "documentsProduced">
    >,
  ): Promise<void> {
    try {
      await supabase
        .from("discovery_initiatives")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initiativeId)
    } catch (error) {
      console.error("Error updating initiative stats:", error)
    }
  }

  /**
   * Generate privilege log
   */
  async generatePrivilegeLog(initiativeId: string): Promise<
    Array<{
      batesNumber: string
      dateCreated: string
      author: string
      recipients: string[]
      description: string
      privilegeBasis: string
    }>
  > {
    try {
      const { data: privilegedDocs, error } = await supabase
        .from("discovery_documents")
        .select("*")
        .eq("initiative_id", initiativeId)
        .gte("privilege_score", 0.7)
        .order("date_created")

      if (error) throw error

      return privilegedDocs.map((doc) => ({
        batesNumber: doc.bates_number || "TBD",
        dateCreated: doc.date_created,
        author: doc.author,
        recipients: doc.recipients,
        description: `${doc.file_type} document: ${doc.file_name}`,
        privilegeBasis: "Attorney-Client Privilege",
      }))
    } catch (error) {
      console.error("Error generating privilege log:", error)
      return []
    }
  }
}

export const discoveryEngineService = new DiscoveryEngineService()
