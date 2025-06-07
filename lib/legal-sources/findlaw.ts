/**
 * FindLaw API Integration
 * Searchable database of decisions from federal and state courts
 */

import axios from "axios"
import * as cheerio from "cheerio"

export interface FindLawConfig {
  baseUrl?: string
  timeout?: number
}

export interface FindLawSearchParams {
  query: string
  court?: string
  jurisdiction?: string
  dateRange?: {
    start: string
    end: string
  }
  page?: number
}

export interface FindLawCase {
  title: string
  url: string
  court: string
  date: string
  snippet: string
  citation?: string
}

export interface FindLawSearchResponse {
  results: FindLawCase[]
  totalResults: number
  currentPage: number
  hasNextPage: boolean
}

export class FindLawAPI {
  private baseUrl: string
  private timeout: number

  constructor(config: FindLawConfig = {}) {
    this.baseUrl = config.baseUrl || "https://caselaw.findlaw.com"
    this.timeout = config.timeout || 30000
  }

  /**
   * Search for cases using web scraping (FindLaw doesn't have a public API)
   */
  async searchCases(params: FindLawSearchParams): Promise<FindLawSearchResponse> {
    try {
      const searchUrl = this.buildSearchUrl(params)
      const response = await axios.get(searchUrl, { timeout: this.timeout })

      return this.parseSearchResults(response.data, params.page || 1)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`FindLaw error: ${error.response.status} ${error.response.statusText}`)
        } else if (error.request) {
          throw new Error("Network error: No response received from FindLaw")
        }
      }
      throw error
    }
  }

  /**
   * Get case details by URL
   */
  async getCaseByUrl(url: string): Promise<{
    title: string
    court: string
    date: string
    citation: string
    content: string
    relatedCases: string[]
  }> {
    try {
      const response = await axios.get(url, { timeout: this.timeout })
      return this.parseCaseDetails(response.data, url)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`FindLaw error: ${error.response.status} ${error.response.statusText}`)
        } else if (error.request) {
          throw new Error("Network error: No response received from FindLaw")
        }
      }
      throw error
    }
  }

  /**
   * Build search URL from parameters
   */
  private buildSearchUrl(params: FindLawSearchParams): string {
    const queryParams = new URLSearchParams()
    queryParams.append("query", params.query)

    if (params.court) {
      queryParams.append("court", params.court)
    }

    if (params.jurisdiction) {
      queryParams.append("jurisdiction", params.jurisdiction)
    }

    if (params.dateRange) {
      queryParams.append("startDate", params.dateRange.start)
      queryParams.append("endDate", params.dateRange.end)
    }

    if (params.page && params.page > 1) {
      queryParams.append("page", params.page.toString())
    }

    return `${this.baseUrl}/search?${queryParams.toString()}`
  }

  /**
   * Parse search results HTML
   */
  private parseSearchResults(html: string, currentPage: number): FindLawSearchResponse {
    const $ = cheerio.load(html)
    const results: FindLawCase[] = []

    // This is a simplified example - actual selectors would need to be adjusted based on FindLaw's HTML structure
    $(".search-result").each((i, element) => {
      const title = $(element).find(".case-title").text().trim()
      const url = $(element).find(".case-title a").attr("href") || ""
      const court = $(element).find(".case-court").text().trim()
      const date = $(element).find(".case-date").text().trim()
      const snippet = $(element).find(".case-snippet").text().trim()
      const citation = $(element).find(".case-citation").text().trim()

      results.push({
        title,
        url: this.resolveUrl(url),
        court,
        date,
        snippet,
        citation,
      })
    })

    const totalResults =
      Number.parseInt(
        $(".result-count")
          .text()
          .replace(/[^0-9]/g, ""),
        10,
      ) || 0
    const hasNextPage = $(".pagination .next").length > 0

    return {
      results,
      totalResults,
      currentPage,
      hasNextPage,
    }
  }

  /**
   * Parse case details HTML
   */
  private parseCaseDetails(
    html: string,
    url: string,
  ): {
    title: string
    court: string
    date: string
    citation: string
    content: string
    relatedCases: string[]
  } {
    const $ = cheerio.load(html)

    // This is a simplified example - actual selectors would need to be adjusted based on FindLaw's HTML structure
    const title = $(".case-header h1").text().trim()
    const court = $(".case-court").text().trim()
    const date = $(".case-date").text().trim()
    const citation = $(".case-citation").text().trim()
    const content = $(".case-content").text().trim()

    const relatedCases: string[] = []
    $(".related-cases a").each((i, element) => {
      relatedCases.push($(element).text().trim())
    })

    return {
      title,
      court,
      date,
      citation,
      content,
      relatedCases,
    }
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  private resolveUrl(url: string): string {
    if (url.startsWith("http")) {
      return url
    }
    return `${this.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
  }

  /**
   * Test connection to FindLaw
   */
  async testConnection(): Promise<{
    status: "online" | "offline"
    message: string
  }> {
    try {
      await axios.get(this.baseUrl, { timeout: this.timeout })
      return {
        status: "online",
        message: "Connected to FindLaw",
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
export const findLawAPI = new FindLawAPI()
