/**
 * Casetext API Integration
 * Note: Casetext's AI tools are now part of Thomson Reuters' CoCounsel
 */

import axios from "axios"

export interface CasetextConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
}

export interface CasetextSearchParams {
  q: string
  jurisdiction?: string
  court?: string
  date_start?: string
  date_end?: string
  page?: number
  page_size?: number
  sort?: "relevance" | "date" | "citations"
}

export interface CasetextCase {
  id: string
  name: string
  citation: string
  court: string
  date: string
  url: string
  snippet: string
  jurisdiction: string
  document_type: string
}

export interface CasetextSearchResponse {
  total: number
  page: number
  page_size: number
  results: CasetextCase[]
}

export class CasetextAPI {
  private baseUrl: string
  private apiKey?: string
  private timeout: number

  constructor(config: CasetextConfig = {}) {
    this.baseUrl = config.baseUrl || "https://api.casetext.com/v1"
    this.apiKey = config.apiKey || process.env.CASETEXT_API_KEY
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
   * Search for cases
   */
  async searchCases(params: CasetextSearchParams): Promise<CasetextSearchResponse> {
    return this.makeRequest<CasetextSearchResponse>("/search", params)
  }

  /**
   * Get a specific case by ID
   */
  async getCase(id: string): Promise<CasetextCase> {
    return this.makeRequest<CasetextCase>(`/cases/${id}`)
  }

  /**
   * Get similar cases
   */
  async getSimilarCases(id: string, limit = 10): Promise<CasetextCase[]> {
    return this.makeRequest<CasetextCase[]>(`/cases/${id}/similar`, { limit })
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

      await this.searchCases({ q: "test", page_size: 1 })

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
export const casetextAPI = new CasetextAPI()
