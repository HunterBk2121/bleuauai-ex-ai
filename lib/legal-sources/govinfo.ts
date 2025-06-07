/**
 * GovInfo.gov United States Courts Opinions API Integration
 * Federal district, appellate, bankruptcy, and Court of International Trade opinions in PDF format
 * https://www.govinfo.gov/app/collection/USCOURTS
 */

import axios from "axios"

export interface GovInfoConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
}

export interface GovInfoSearchParams {
  collection?: string
  dateIssued?: string
  endDate?: string
  pageSize?: number
  offset?: number
  courtType?: string
  circuitCode?: string
  courtCode?: string
}

export interface GovInfoPackage {
  packageId: string
  title: string
  summary: string
  dateIssued: string
  court: {
    type: string
    circuit: string
    code: string
    name: string
  }
  caseNumber: string
  documentType: string
  pdfUrl: string
  htmlUrl: string
  xmlUrl: string
  contentDetail: string
}

export interface GovInfoSearchResponse {
  count: number
  message: string
  nextPage: string | null
  previousPage: string | null
  packages: GovInfoPackage[]
}

export class GovInfoAPI {
  private baseUrl: string
  private apiKey?: string
  private timeout: number

  constructor(config: GovInfoConfig = {}) {
    this.baseUrl = config.baseUrl || "https://api.govinfo.gov/v1"
    this.apiKey = config.apiKey || process.env.GOVINFO_API_KEY
    this.timeout = config.timeout || 30000
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (this.apiKey) {
      headers["X-Api-Key"] = this.apiKey
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
   * Search for court opinions
   */
  async searchCourtOpinions(params: GovInfoSearchParams = {}): Promise<GovInfoSearchResponse> {
    // Default to USCOURTS collection if not specified
    const searchParams = {
      collection: "USCOURTS",
      ...params,
    }

    return this.makeRequest<GovInfoSearchResponse>("/collections", searchParams)
  }

  /**
   * Get a specific package by ID
   */
  async getPackage(packageId: string): Promise<GovInfoPackage> {
    return this.makeRequest<GovInfoPackage>(`/packages/${packageId}`)
  }

  /**
   * Get package content (PDF, HTML, XML)
   */
  async getPackageContent(packageId: string, contentType: "pdf" | "html" | "xml" = "pdf"): Promise<ArrayBuffer> {
    try {
      const response = await axios.get(`${this.baseUrl}/packages/${packageId}/${contentType}`, {
        headers: this.getHeaders(),
        responseType: "arraybuffer",
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
   * Get court opinions by court type
   */
  async getOpinionsByCourtType(
    courtType: string,
    params: Omit<GovInfoSearchParams, "courtType"> = {},
  ): Promise<GovInfoSearchResponse> {
    return this.searchCourtOpinions({
      ...params,
      courtType,
    })
  }

  /**
   * Get court opinions by circuit
   */
  async getOpinionsByCircuit(
    circuitCode: string,
    params: Omit<GovInfoSearchParams, "circuitCode"> = {},
  ): Promise<GovInfoSearchResponse> {
    return this.searchCourtOpinions({
      ...params,
      circuitCode,
    })
  }

  /**
   * Get court opinions by specific court
   */
  async getOpinionsByCourt(
    courtCode: string,
    params: Omit<GovInfoSearchParams, "courtCode"> = {},
  ): Promise<GovInfoSearchResponse> {
    return this.searchCourtOpinions({
      ...params,
      courtCode,
    })
  }

  /**
   * Get recent court opinions
   */
  async getRecentOpinions(days = 7): Promise<GovInfoSearchResponse> {
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    return this.searchCourtOpinions({
      dateIssued: startDate,
      endDate,
      pageSize: 100,
    })
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
      await this.searchCourtOpinions({ pageSize: 1 })
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
export const govInfoAPI = new GovInfoAPI()
