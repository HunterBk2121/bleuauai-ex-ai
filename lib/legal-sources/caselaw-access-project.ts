/**
 * Caselaw Access Project (CAP) API Integration
 * Harvard Law Library's collection of digitized U.S. court decisions
 * https://case.law/
 */

import axios from "axios"

export interface CAPConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
}

export interface CAPSearchParams {
  q?: string
  jurisdiction?: string
  court?: string
  decision_date_min?: string
  decision_date_max?: string
  cite?: string
  reporter?: string
  page_size?: number
  cursor?: string
  full_case?: boolean
}

export interface CAPCase {
  id: number
  url: string
  name: string
  name_abbreviation: string
  decision_date: string
  docket_number: string
  first_page: string
  last_page: string
  citation: string
  citations: CAPCitation[]
  court: {
    id: number
    name: string
    slug: string
    url: string
  }
  jurisdiction: {
    id: number
    name: string
    slug: string
    url: string
  }
  frontend_url: string
  last_updated: string
  preview: string[]
  analysis: {
    word_count: number
    sha256: string
    char_count: number
    ocr_confidence: number
    pagerank: {
      percentile: number
    }
  }
  casebody?: {
    data: {
      head_matter: string
      opinions: CAPOpinion[]
      corrections: string
    }
    status: string
  }
}

export interface CAPCitation {
  type: string
  cite: string
}

export interface CAPOpinion {
  type: string
  author: string
  text: string
}

export interface CAPSearchResponse {
  count: number
  next: string | null
  previous: string | null
  results: CAPCase[]
}

export interface CAPJurisdiction {
  id: number
  name: string
  slug: string
  whitelisted: boolean
}

export interface CAPReporter {
  id: number
  full_name: string
  short_name: string
  start_date: string
  end_date: string
  jurisdiction_ids: number[]
  url: string
}

export interface CAPCourt {
  id: number
  name: string
  name_abbreviation: string
  slug: string
  jurisdiction_id: number
  jurisdiction_slug: string
  url: string
}

export class CaselawAccessProject {
  private baseUrl: string
  private apiKey?: string
  private timeout: number

  constructor(config: CAPConfig = {}) {
    this.baseUrl = config.baseUrl || "https://api.case.law/v1"
    this.apiKey = config.apiKey || process.env.CASELAW_ACCESS_PROJECT_API_KEY
    this.timeout = config.timeout || 30000
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (this.apiKey) {
      headers["Authorization"] = `Token ${this.apiKey}`
    }

    return headers
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
        params,
        timeout: this.timeout,
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Unauthorized: Invalid API key or authentication required")
        } else if (error.response?.status === 429) {
          throw new Error("Rate limited: Too many requests")
        } else if (error.response) {
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
  async searchCases(params: CAPSearchParams = {}): Promise<CAPSearchResponse> {
    return this.makeRequest<CAPSearchResponse>("/cases/", params)
  }

  /**
   * Get a specific case by ID
   */
  async getCase(id: number, fullCase = false): Promise<CAPCase> {
    return this.makeRequest<CAPCase>(`/cases/${id}/`, { full_case: fullCase })
  }

  /**
   * Get a list of all jurisdictions
   */
  async getJurisdictions(): Promise<{ count: number; results: CAPJurisdiction[] }> {
    return this.makeRequest<{ count: number; results: CAPJurisdiction[] }>("/jurisdictions/")
  }

  /**
   * Get a list of all reporters
   */
  async getReporters(): Promise<{ count: number; results: CAPReporter[] }> {
    return this.makeRequest<{ count: number; results: CAPReporter[] }>("/reporters/")
  }

  /**
   * Get a list of all courts
   */
  async getCourts(): Promise<{ count: number; results: CAPCourt[] }> {
    return this.makeRequest<{ count: number; results: CAPCourt[] }>("/courts/")
  }

  /**
   * Get a specific court by ID
   */
  async getCourt(id: number): Promise<CAPCourt> {
    return this.makeRequest<CAPCourt>(`/courts/${id}/`)
  }

  /**
   * Get a specific jurisdiction by ID or slug
   */
  async getJurisdiction(idOrSlug: number | string): Promise<CAPJurisdiction> {
    return this.makeRequest<CAPJurisdiction>(`/jurisdictions/${idOrSlug}/`)
  }

  /**
   * Get cases from a specific jurisdiction
   */
  async getCasesByJurisdiction(
    jurisdictionSlug: string,
    params: Omit<CAPSearchParams, "jurisdiction"> = {},
  ): Promise<CAPSearchResponse> {
    return this.makeRequest<CAPSearchResponse>(`/cases/?jurisdiction=${jurisdictionSlug}`, params)
  }

  /**
   * Get cases from a specific court
   */
  async getCasesByCourt(courtId: number, params: Omit<CAPSearchParams, "court"> = {}): Promise<CAPSearchResponse> {
    return this.makeRequest<CAPSearchResponse>(`/cases/?court=${courtId}`, params)
  }

  /**
   * Get cases by citation
   */
  async getCasesByCitation(citation: string): Promise<CAPSearchResponse> {
    return this.makeRequest<CAPSearchResponse>(`/cases/?cite=${encodeURIComponent(citation)}`)
  }

  /**
   * Get bulk data information
   */
  async getBulkData(): Promise<any> {
    return this.makeRequest<any>("/bulk/")
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{
    status: "online" | "limited" | "offline"
    message: string
    hasApiKey: boolean
  }> {
    try {
      await this.getJurisdictions()
      const hasApiKey = !!this.apiKey

      return {
        status: hasApiKey ? "online" : "limited",
        message: hasApiKey ? "Connected with full API access" : "Connected with limited access (public data only)",
        hasApiKey,
      }
    } catch (error) {
      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
        hasApiKey: !!this.apiKey,
      }
    }
  }
}

// Export a default instance
export const caselawAccessProject = new CaselawAccessProject()
