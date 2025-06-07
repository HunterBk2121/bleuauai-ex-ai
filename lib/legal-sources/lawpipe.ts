/**
 * LawPipe API Integration
 * Case summaries database for efficient legal research
 */

import axios from "axios"

export interface LawPipeConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
}

export interface LawPipeSearchParams {
  query: string
  jurisdiction?: string
  court?: string
  date_start?: string
  date_end?: string
  page?: number
  limit?: number
}

export interface LawPipeCase {
  id: string
  title: string
  summary: string
  citation: string
  court: string
  date: string
  url: string
  jurisdiction: string
  key_points: string[]
  tags: string[]
}

export interface LawPipeSearchResponse {
  results: LawPipeCase[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export class LawPipeAPI {
  private baseUrl: string
  private apiKey?: string
  private timeout: number

  constructor(config: LawPipeConfig = {}) {
    this.baseUrl = config.baseUrl || "https://api.lawpipe.com/v1"
    this.apiKey = config.apiKey || process.env.LAWPIPE_API_KEY
    this.timeout = config.timeout || 30000
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`
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
          throw new Error("Unauthorized: Invalid API key")
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
   * Search for case summaries
   */
  async searchCases(params: LawPipeSearchParams): Promise<LawPipeSearchResponse> {
    return this.makeRequest<LawPipeSearchResponse>("/search", params)
  }

  /**
   * Get a specific case by ID
   */
  async getCase(id: string): Promise<LawPipeCase> {
    return this.makeRequest<LawPipeCase>(`/cases/${id}`)
  }

  /**
   * Get similar cases
   */
  async getSimilarCases(id: string, limit = 5): Promise<LawPipeCase[]> {
    return this.makeRequest<LawPipeCase[]>(`/cases/${id}/similar`, { limit })
  }

  /**
   * Get recent cases
   */
  async getRecentCases(limit = 10): Promise<LawPipeCase[]> {
    return this.makeRequest<LawPipeCase[]>("/cases/recent", { limit })
  }

  /**
   * Get cases by jurisdiction
   */
  async getCasesByJurisdiction(jurisdiction: string, limit = 10): Promise<LawPipeCase[]> {
    return this.makeRequest<LawPipeCase[]>("/cases", { jurisdiction, limit })
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{
    status: "online" | "offline"
    message: string
    hasApiKey: boolean
  }> {
    try {
      if (!this.apiKey) {
        return {
          status: "offline",
          message: "No API key provided",
          hasApiKey: false,
        }
      }

      await this.getRecentCases(1)

      return {
        status: "online",
        message: "Connected with API access",
        hasApiKey: true,
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
export const lawPipeAPI = new LawPipeAPI()
