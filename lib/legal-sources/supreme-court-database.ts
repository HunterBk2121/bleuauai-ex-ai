/**
 * Supreme Court Database API Integration
 * Contains over two hundred pieces of information about each case decided by the Court between 1791 and 2018
 * http://scdb.wustl.edu/
 */

import axios from "axios"

export interface SCDBConfig {
  baseUrl?: string
  timeout?: number
}

export interface SCDBSearchParams {
  term?: string
  caseId?: string
  docketId?: string
  usCite?: string
  sctCite?: string
  ledCite?: string
  lexisCite?: string
  term_start?: number
  term_end?: number
  chief?: string
  issue?: string
  issueArea?: string
  decisionDirection?: string
  decisionType?: string
  authorityDecision1?: string
  authorityDecision2?: string
  majOpinWriter?: string
  majOpinAssigner?: string
  splitVote?: boolean
  majVotes?: number
  minVotes?: number
  justice?: number
  dateDecision_start?: string
  dateDecision_end?: string
  declarationUncon?: boolean
  caseDisposition?: string
  caseDispositionUnusual?: boolean
  partyWinning?: string
  precedentAlteration?: boolean
  voteUnclear?: boolean
  page?: number
  limit?: number
}

export interface SCDBCase {
  caseId: string
  docketId: string
  caseIssuesId: string
  dateDecision: string
  decisionType: string
  usCite: string
  sctCite: string
  ledCite: string
  lexisCite: string
  term: number
  naturalCourt: number
  chief: string
  docket: string
  caseName: string
  dateArgument: string
  dateReargument: string
  petitioner: string
  petitionerState: string
  respondent: string
  respondentState: string
  jurisdiction: string
  adminAction: string
  adminActionState: string
  threeJudgeFdc: string
  caseOrigin: string
  caseOriginState: string
  caseSource: string
  caseSourceState: string
  lcDisagreement: string
  certReason: string
  lcDisposition: string
  lcDispositionDirection: string
  caseDisposition: string
  caseDispositionUnusual: string
  partyWinning: string
  precedentAlteration: string
  voteUnclear: string
  issue: string
  issueArea: string
  decisionDirection: string
  decisionDirectionDissent: string
  authorityDecision1: string
  authorityDecision2: string
  lawType: string
  lawSupp: string
  lawMinor: string
  majOpinWriter: string
  majOpinAssigner: string
  splitVote: string
  majVotes: number
  minVotes: number
}

export interface SCDBSearchResponse {
  results: SCDBCase[]
  total: number
  page: number
  limit: number
}

export interface SCDBJustice {
  justice: number
  justiceName: string
  justiceLastName: string
  justiceFirstName: string
  dateStart: string
  dateEnd: string | null
  courtName: string
}

export class SupremeCourtDatabaseAPI {
  private baseUrl: string
  private timeout: number

  constructor(config: SCDBConfig = {}) {
    this.baseUrl = config.baseUrl || "http://scdb.wustl.edu/api"
    this.timeout = config.timeout || 30000
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params,
        timeout: this.timeout,
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`API error: ${error.response.status} ${error.response.statusText}`)
        } else if (error.request) {
          throw new Error("Network error: No response received")
        }
      }
      throw error
    }
  }

  /**
   * Search for cases
   */
  async searchCases(params: SCDBSearchParams = {}): Promise<SCDBSearchResponse> {
    return this.makeRequest<SCDBSearchResponse>("/cases", params)
  }

  /**
   * Get a specific case by ID
   */
  async getCase(caseId: string): Promise<SCDBCase> {
    return this.makeRequest<SCDBCase>(`/cases/${caseId}`)
  }

  /**
   * Get cases by term
   */
  async getCasesByTerm(term: number): Promise<SCDBCase[]> {
    return this.makeRequest<SCDBCase[]>("/cases", { term })
  }

  /**
   * Get cases by justice
   */
  async getCasesByJustice(justice: number): Promise<SCDBCase[]> {
    return this.makeRequest<SCDBCase[]>("/cases", { justice })
  }

  /**
   * Get cases by issue area
   */
  async getCasesByIssueArea(issueArea: string): Promise<SCDBCase[]> {
    return this.makeRequest<SCDBCase[]>("/cases", { issueArea })
  }

  /**
   * Get all justices
   */
  async getJustices(): Promise<SCDBJustice[]> {
    return this.makeRequest<SCDBJustice[]>("/justices")
  }

  /**
   * Get a specific justice by ID
   */
  async getJustice(justiceId: number): Promise<SCDBJustice> {
    return this.makeRequest<SCDBJustice>(`/justices/${justiceId}`)
  }

  /**
   * Get vote data for a specific case
   */
  async getVotes(caseId: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/cases/${caseId}/votes`)
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{
    status: "online" | "offline"
    message: string
  }> {
    try {
      await this.getJustices()
      return {
        status: "online",
        message: "Connected to Supreme Court Database API",
      }
    } catch (error) {
      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
      }
    }
  }
}

// Export a default instance
export const supremeCourtDatabaseAPI = new SupremeCourtDatabaseAPI()
