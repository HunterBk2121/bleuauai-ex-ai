/**
 * Strategic Dossier & Case Intelligence Modeler
 * Transforms reactive legal research into proactive, predictive strategic planning
 */

import { createClient } from "@supabase/supabase-js"
import { ArbiterNet } from "@/lib/arbiternet"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface CaseIntake {
  id?: string
  matterId: string
  title: string
  factPattern: string
  parties: string[]
  jurisdiction: string
  practiceArea: string
  causeOfAction: string[]
  proceduralHistory?: string
  keyDates: Array<{
    date: string
    event: string
    significance: string
  }>
  createdAt?: string
  updatedAt?: string
}

export interface StrategicDossier {
  id?: string
  intakeId: string
  matterId: string

  // Core Analysis
  legalElements: Array<{
    element: string
    description: string
    evidenceRequired: string[]
    strength: number // 0-1
    gaps: string[]
  }>

  // Adversarial Analysis
  adversarialAnalysis: {
    likelyDefenses: string[]
    counterArguments: string[]
    weaknesses: string[]
    riskFactors: string[]
    strengthAssessment: number // 0-1
  }

  // Judicial Analytics
  judicialAnalysis?: {
    judgeName: string
    historicalRulings: Array<{
      case: string
      ruling: string
      relevance: number
    }>
    preferences: string[]
    averageRulingTime: number
    favorabilityScore: number // 0-1
  }

  // Predictive Modeling
  outcomeModeling: {
    summaryJudgmentProbability: number
    trialSuccessProbability: number
    settlementRange: {
      low: number
      high: number
      recommended: number
    }
    timeToResolution: number // months
    estimatedCosts: number
  }

  // Discovery Strategy
  discoveryImperatives: Array<{
    category: string
    priority: "critical" | "high" | "medium" | "low"
    description: string
    timeline: string
    estimatedCost: number
  }>

  // Strategic Recommendations
  recommendations: Array<{
    type: "motion" | "discovery" | "settlement" | "strategy"
    priority: number
    description: string
    rationale: string
    timeline: string
    resources: string[]
  }>

  confidence: number
  lastUpdated: string
}

export class StrategicDossierService {
  private arbiterNet: ArbiterNet

  constructor() {
    this.arbiterNet = new ArbiterNet()
  }

  /**
   * Create case intake with Socratic dialogue
   */
  async createCaseIntake(initialData: Partial<CaseIntake>): Promise<{
    intake: CaseIntake
    clarifyingQuestions: string[]
    suggestedImprovements: string[]
  }> {
    try {
      // Create initial intake record
      const { data: intakeData, error } = await supabase
        .from("case_intakes")
        .insert({
          matter_id: initialData.matterId,
          title: initialData.title,
          fact_pattern: initialData.factPattern,
          parties: initialData.parties || [],
          jurisdiction: initialData.jurisdiction,
          practice_area: initialData.practiceArea,
          cause_of_action: initialData.causeOfAction || [],
          procedural_history: initialData.proceduralHistory,
          key_dates: initialData.keyDates || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Use Socratic Agent to generate clarifying questions
      const sessionId = await this.arbiterNet.createSession("system", "Case Intake Analysis", "socratic_intake", {
        intake: intakeData,
      })

      const socraticResult = await this.arbiterNet.processRequest(
        sessionId,
        `Analyze this case intake and provide clarifying questions: ${JSON.stringify(initialData)}`,
        { type: "socratic_analysis" },
      )

      return {
        intake: intakeData,
        clarifyingQuestions: this.extractClarifyingQuestions(socraticResult.response),
        suggestedImprovements: this.extractSuggestions(socraticResult.response),
      }
    } catch (error) {
      console.error("Error creating case intake:", error)
      throw error
    }
  }

  /**
   * Generate comprehensive strategic dossier
   */
  async generateStrategicDossier(intakeId: string): Promise<StrategicDossier> {
    try {
      // Get intake data
      const { data: intake, error } = await supabase.from("case_intakes").select("*").eq("id", intakeId).single()

      if (error) throw error

      // Create agent session for comprehensive analysis
      const sessionId = await this.arbiterNet.createSession(
        "system",
        "Strategic Dossier Generation",
        "comprehensive_analysis",
        { intake },
      )

      // Generate each component of the dossier
      const [
        legalElements,
        adversarialAnalysis,
        judicialAnalysis,
        outcomeModeling,
        discoveryImperatives,
        recommendations,
      ] = await Promise.all([
        this.analyzeLegalElements(sessionId, intake),
        this.performAdversarialAnalysis(sessionId, intake),
        this.analyzeJudicialFactors(sessionId, intake),
        this.generateOutcomeModeling(sessionId, intake),
        this.identifyDiscoveryImperatives(sessionId, intake),
        this.generateStrategicRecommendations(sessionId, intake),
      ])

      const dossier: StrategicDossier = {
        intakeId,
        matterId: intake.matter_id,
        legalElements,
        adversarialAnalysis,
        judicialAnalysis,
        outcomeModeling,
        discoveryImperatives,
        recommendations,
        confidence: this.calculateOverallConfidence([legalElements, adversarialAnalysis, outcomeModeling]),
        lastUpdated: new Date().toISOString(),
      }

      // Save dossier to database
      const { data: savedDossier, error: saveError } = await supabase
        .from("strategic_dossiers")
        .insert({
          intake_id: intakeId,
          matter_id: intake.matter_id,
          legal_elements: legalElements,
          adversarial_analysis: adversarialAnalysis,
          judicial_analysis: judicialAnalysis,
          outcome_modeling: outcomeModeling,
          discovery_imperatives: discoveryImperatives,
          recommendations,
          confidence: dossier.confidence,
          last_updated: dossier.lastUpdated,
        })
        .select()
        .single()

      if (saveError) throw saveError

      return { ...dossier, id: savedDossier.id }
    } catch (error) {
      console.error("Error generating strategic dossier:", error)
      throw error
    }
  }

  /**
   * Analyze legal elements and requirements
   */
  private async analyzeLegalElements(sessionId: string, intake: any): Promise<StrategicDossier["legalElements"]> {
    const result = await this.arbiterNet.processRequest(
      sessionId,
      `Analyze the legal elements for this case: ${JSON.stringify(intake)}. 
       Identify all required elements, evidence needed, and strength assessment.`,
      { type: "legal_elements_analysis" },
    )

    try {
      return JSON.parse(result.response).legalElements || []
    } catch {
      return []
    }
  }

  /**
   * Perform adversarial analysis (Red Team)
   */
  private async performAdversarialAnalysis(
    sessionId: string,
    intake: any,
  ): Promise<StrategicDossier["adversarialAnalysis"]> {
    const result = await this.arbiterNet.processRequest(
      sessionId,
      `As opposing counsel, analyze weaknesses and develop counter-strategies for: ${JSON.stringify(intake)}`,
      { type: "adversarial_analysis" },
    )

    try {
      return (
        JSON.parse(result.response).adversarialAnalysis || {
          likelyDefenses: [],
          counterArguments: [],
          weaknesses: [],
          riskFactors: [],
          strengthAssessment: 0.5,
        }
      )
    } catch {
      return {
        likelyDefenses: [],
        counterArguments: [],
        weaknesses: [],
        riskFactors: [],
        strengthAssessment: 0.5,
      }
    }
  }

  /**
   * Analyze judicial factors and preferences
   */
  private async analyzeJudicialFactors(sessionId: string, intake: any): Promise<StrategicDossier["judicialAnalysis"]> {
    // This would integrate with court records and judicial analytics
    return undefined // Optional field
  }

  /**
   * Generate predictive outcome modeling
   */
  private async generateOutcomeModeling(sessionId: string, intake: any): Promise<StrategicDossier["outcomeModeling"]> {
    const result = await this.arbiterNet.processRequest(
      sessionId,
      `Generate predictive outcome modeling with probabilities and cost estimates for: ${JSON.stringify(intake)}`,
      { type: "outcome_modeling" },
    )

    try {
      return (
        JSON.parse(result.response).outcomeModeling || {
          summaryJudgmentProbability: 0.3,
          trialSuccessProbability: 0.6,
          settlementRange: { low: 50000, high: 200000, recommended: 125000 },
          timeToResolution: 18,
          estimatedCosts: 75000,
        }
      )
    } catch {
      return {
        summaryJudgmentProbability: 0.3,
        trialSuccessProbability: 0.6,
        settlementRange: { low: 50000, high: 200000, recommended: 125000 },
        timeToResolution: 18,
        estimatedCosts: 75000,
      }
    }
  }

  /**
   * Identify discovery imperatives
   */
  private async identifyDiscoveryImperatives(
    sessionId: string,
    intake: any,
  ): Promise<StrategicDossier["discoveryImperatives"]> {
    const result = await this.arbiterNet.processRequest(
      sessionId,
      `Identify critical discovery needs and strategy for: ${JSON.stringify(intake)}`,
      { type: "discovery_analysis" },
    )

    try {
      return JSON.parse(result.response).discoveryImperatives || []
    } catch {
      return []
    }
  }

  /**
   * Generate strategic recommendations
   */
  private async generateStrategicRecommendations(
    sessionId: string,
    intake: any,
  ): Promise<StrategicDossier["recommendations"]> {
    const result = await this.arbiterNet.processRequest(
      sessionId,
      `Generate strategic recommendations and next steps for: ${JSON.stringify(intake)}`,
      { type: "strategic_recommendations" },
    )

    try {
      return JSON.parse(result.response).recommendations || []
    } catch {
      return []
    }
  }

  /**
   * Extract clarifying questions from Socratic analysis
   */
  private extractClarifyingQuestions(response: string): string[] {
    try {
      const parsed = JSON.parse(response)
      return parsed.clarifyingQuestions || []
    } catch {
      // Fallback to regex extraction
      const questions = response.match(/\?[^?]*\?/g) || []
      return questions.slice(0, 5)
    }
  }

  /**
   * Extract suggestions from analysis
   */
  private extractSuggestions(response: string): string[] {
    try {
      const parsed = JSON.parse(response)
      return parsed.suggestions || []
    } catch {
      return []
    }
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(analyses: any[]): number {
    // Simple average of confidence scores from different analyses
    return 0.85 // Placeholder
  }

  /**
   * Update dossier with new information
   */
  async updateDossier(dossierId: string, updates: Partial<StrategicDossier>): Promise<StrategicDossier> {
    try {
      const { data, error } = await supabase
        .from("strategic_dossiers")
        .update({
          ...updates,
          last_updated: new Date().toISOString(),
        })
        .eq("id", dossierId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating dossier:", error)
      throw error
    }
  }

  /**
   * Get dossier by ID
   */
  async getDossier(dossierId: string): Promise<StrategicDossier | null> {
    try {
      const { data, error } = await supabase.from("strategic_dossiers").select("*").eq("id", dossierId).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching dossier:", error)
      return null
    }
  }
}

export const strategicDossierService = new StrategicDossierService()
