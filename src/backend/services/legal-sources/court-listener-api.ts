/**
 * CourtListener API Service
 * Provides access to the CourtListener REST API for legal opinions and case data
 */
import axios from "axios"
import { rateLimit } from "@/src/backend/utils/rate-limiter"

// Types for CourtListener API responses
export interface CourtListenerOpinion {
  id: number
  absolute_url: string
  author: string
  case_name: string
  citation: {
    cite: string
    type: string
  }
  court: string
  date_filed: string
  download_url: string
  snippet: string
  status: string
  type: string
}

export interface CourtListenerSearchResponse {
  count: number
  next: string | null
  previous: string | null
  results: CourtListenerOpinion[]
}

export interface CourtListenerDocket {
  id: number
  court: string
  date_filed: string
  date_terminated: string | null
  case_name: string
  case_name_short: string
  docket_number: string
  source: string
  assigned_to: string | null
  referred_to: string | null
  nature_of_suit: string | null
  jury_demand: string | null
  cause: string | null
  jurisdiction_type: string | null
  absolute_url: string
}

export interface CourtListenerCourt {
  id: string
  full_name: string
  short_name: string
  url: string
  jurisdiction: string
  has_opinion_scraper: boolean
  has_oral_argument_scraper: boolean
  position: number
  citation_string: string
  date_modified: string
}

export interface CourtListenerJudge {
  id: number
  name: string
  name_first: string
  name_last: string
  position_type: string
  court: string
  date_nominated: string | null
  date_elected: string | null
  date_recess_appointment: string | null
  date_referred_to_judicial_committee: string | null
  date_judicial_committee_action: string | null
  date_hearing: string | null
  date_confirmation: string | null
  date_start: string
  date_retirement: string | null
  date_termination: string | null
  termination_reason: string | null
}

export interface CitationValidationResponse {
  id: number
  reporter: string
  volume: number
  page: number
  valid: boolean
  match_url: string | null
  match_id: number | null
  error: string | null
}

/**
 * CourtListener API client
 */
class CourtListenerAPI {
  private baseUrl = "https://www.courtlistener.com/api/rest/v3"
  private apiKey: string | null = null
  private limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  })

  /**
   * Set the API key for authenticated requests
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Get the authorization headers for API requests
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.apiKey) {
      headers["Authorization"] = `Token ${this.apiKey}`
    }

    return headers
  }

  /**
   * Make a rate-limited API request
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    await this.limiter.wait()

    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params,
      })
      return response.data as T
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`CourtListener API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      }
      throw error
    }
  }

  /**
   * Search for opinions
   */
  async searchOpinions(params: Record<string, any> = {}): Promise<CourtListenerSearchResponse> {
    return this.makeRequest<CourtListenerSearchResponse>("/search/", params)
  }

  /**
   * Get an opinion by ID
   */
  async getOpinion(id: number): Promise<CourtListenerOpinion> {
    return this.makeRequest<CourtListenerOpinion>(`/opinions/${id}/`)
  }

  /**
   * Get a docket by ID
   */
  async getDocket(id: number): Promise<CourtListenerDocket> {
    return this.makeRequest<CourtListenerDocket>(`/dockets/${id}/`)
  }

  /**
   * Get a list of courts
   */
  async getCourts(params: Record<string, any> = {}): Promise<CourtListenerCourt[]> {
    const response = await this.makeRequest<{ results: CourtListenerCourt[] }>("/courts/", params)
    return response.results
  }

  /**
   * Get a court by ID
   */
  async getCourt(id: string): Promise<CourtListenerCourt> {
    return this.makeRequest<CourtListenerCourt>(`/courts/${id}/`)
  }

  /**
   * Get a list of judges
   */
  async getJudges(params: Record<string, any> = {}): Promise<CourtListenerJudge[]> {
    const response = await this.makeRequest<{ results: CourtListenerJudge[] }>("/people/", params)
    return response.results
  }

  /**
   * Get a judge by ID
   */
  async getJudge(id: number): Promise<CourtListenerJudge> {
    return this.makeRequest<CourtListenerJudge>(`/people/${id}/`)
  }

  /**
   * Validate a citation
   */
  async validateCitation(reporter: string, volume: number, page: number): Promise<CitationValidationResponse> {
    return this.makeRequest<CitationValidationResponse>("/citation/", {
      reporter,
      volume,
      page,
    })
  }

  /**
   * Test the connection to the CourtListener API
   */
  async testConnection(): Promise<{
    status: "online" | "limited" | "offline"
    message: string
    hasApiKey?: boolean
  }> {
    try {
      // Try to get a list of courts (works without API key)
      await this.getCourts({ limit: 1 })

      // Check if we have an API key
      if (this.apiKey) {
        try {
          // Try an authenticated endpoint
          await this.searchOpinions({ q: "test", limit: 1 })
          return {
            status: "online",
            message: "Connected to CourtListener API with full access",
            hasApiKey: true,
          }
        } catch (error) {
          return {
            status: "limited",
            message: "Connected to CourtListener API with limited access (API key issue)",
            hasApiKey: true,
          }
        }
      } else {
        return {
          status: "limited",
          message: "Connected to CourtListener API with limited access (no API key)",
          hasApiKey: false,
        }
      }
    } catch (error) {
      return {
        status: "offline",
        message: `Failed to connect to CourtListener API: ${error instanceof Error ? error.message : String(error)}`,
        hasApiKey: !!this.apiKey,
      }
    }
  }
}

// Initialize with API key if available
export const courtListenerAPI = new CourtListenerAPI()
if (process.env.COURT_LISTENER_API_KEY) {
  courtListenerAPI.setApiKey(process.env.COURT_LISTENER_API_KEY)
}
