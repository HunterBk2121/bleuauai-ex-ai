/**
 * Google Scholar Case Law Search Integration
 * Links to legal opinions and law review articles
 */

import axios from "axios"
import * as cheerio from "cheerio"

export interface GoogleScholarConfig {
  baseUrl?: string
  timeout?: number
  userAgent?: string
}

export interface GoogleScholarSearchParams {
  q: string
  as_sdt?: "6" | "7" // 6 = case law, 7 = articles
  as_ylo?: string // year low
  as_yhi?: string // year high
  start?: number // pagination start
  num?: number // results per page
}

export interface GoogleScholarCase {
  title: string
  url: string
  snippet: string
  citation?: string
  date?: string
  court?: string
  cited_by?: number
  related_articles?: number
}

export interface GoogleScholarSearchResponse {
  results: GoogleScholarCase[]
  totalResults: number | null
  currentPage: number
  hasNextPage: boolean
  nextPageStart?: number
}

export class GoogleScholarAPI {
  private baseUrl: string
  private timeout: number
  private userAgent: string

  constructor(config: GoogleScholarConfig = {}) {
    this.baseUrl = config.baseUrl || "https://scholar.google.com"
    this.timeout = config.timeout || 30000
    this.userAgent =
      config.userAgent ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  }

  /**
   * Search for case law using web scraping (Google Scholar doesn't have a public API)
   */
  async searchCaseLaw(params: GoogleScholarSearchParams): Promise<GoogleScholarSearchResponse> {
    try {
      // Ensure we're searching for case law
      params.as_sdt = "6"

      const searchUrl = this.buildSearchUrl(params)
      const response = await axios.get(searchUrl, {
        timeout: this.timeout,
        headers: {
          "User-Agent": this.userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      })

      return this.parseSearchResults(response.data, params.start || 0)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("Access denied: Google Scholar may be blocking automated requests")
        } else if (error.response) {
          throw new Error(`Google Scholar error: ${error.response.status} ${error.response.statusText}`)
        } else if (error.request) {
          throw new Error("Network error: No response received from Google Scholar")
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
    citation: string
    court?: string
    date?: string
    content: string
    cited_by?: number
    how_cited?: string[]
  }> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          "User-Agent": this.userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      })

      return this.parseCaseDetails(response.data, url)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("Access denied: Google Scholar may be blocking automated requests")
        } else if (error.response) {
          throw new Error(`Google Scholar error: ${error.response.status} ${error.response.statusText}`)
        } else if (error.request) {
          throw new Error("Network error: No response received from Google Scholar")
        }
      }
      throw error
    }
  }

  /**
   * Build search URL from parameters
   */
  private buildSearchUrl(params: GoogleScholarSearchParams): string {
    const queryParams = new URLSearchParams()
    queryParams.append("q", params.q)

    if (params.as_sdt) {
      queryParams.append("as_sdt", params.as_sdt)
    }

    if (params.as_ylo) {
      queryParams.append("as_ylo", params.as_ylo)
    }

    if (params.as_yhi) {
      queryParams.append("as_yhi", params.as_yhi)
    }

    if (params.start) {
      queryParams.append("start", params.start.toString())
    }

    if (params.num) {
      queryParams.append("num", params.num.toString())
    }

    queryParams.append("hl", "en")

    return `${this.baseUrl}/scholar?${queryParams.toString()}`
  }

  /**
   * Parse search results HTML
   */
  private parseSearchResults(html: string, currentStart: number): GoogleScholarSearchResponse {
    const $ = cheerio.load(html)
    const results: GoogleScholarCase[] = []

    // Parse each result
    $(".gs_ri").each((i, element) => {
      const titleElement = $(element).find(".gs_rt a")
      const title = titleElement.text().trim()
      const url = titleElement.attr("href") || ""

      const snippetElement = $(element).find(".gs_rs")
      const snippet = snippetElement.text().trim()

      const metaElement = $(element).find(".gs_a")
      const metaText = metaElement.text().trim()

      // Try to extract citation, date, and court from meta text
      const citation = this.extractCitation(metaText)
      const date = this.extractDate(metaText)
      const court = this.extractCourt(metaText)

      // Extract cited by count
      const citedByText = $(element).find('.gs_fl a:contains("Cited by")').text()
      const citedByMatch = citedByText.match(/Cited by (\d+)/)
      const cited_by = citedByMatch ? Number.parseInt(citedByMatch[1], 10) : undefined

      // Extract related articles count
      const relatedText = $(element).find('.gs_fl a:contains("Related articles")').text()
      const relatedMatch = relatedText.match(/Related articles $$(\d+)$$/)
      const related_articles = relatedMatch ? Number.parseInt(relatedMatch[1], 10) : undefined

      results.push({
        title,
        url,
        snippet,
        citation,
        date,
        court,
        cited_by,
        related_articles,
      })
    })

    // Try to extract total results count
    let totalResults: number | null = null
    const resultStatsText = $("#gs_ab_md").text()
    const resultStatsMatch = resultStatsText.match(/About ([\d,]+) results/)
    if (resultStatsMatch) {
      totalResults = Number.parseInt(resultStatsMatch[1].replace(/,/g, ""), 10)
    }

    // Check if there's a next page
    const hasNextPage = $("#gs_n td.b a.gs_nma").length > 0
    let nextPageStart: number | undefined

    if (hasNextPage) {
      const nextPageLink = $("#gs_n td.b a.gs_nma").attr("href")
      if (nextPageLink) {
        const startMatch = nextPageLink.match(/start=(\d+)/)
        if (startMatch) {
          nextPageStart = Number.parseInt(startMatch[1], 10)
        }
      }
    }

    return {
      results,
      totalResults,
      currentPage: Math.floor(currentStart / 10) + 1,
      hasNextPage,
      nextPageStart,
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
    citation: string
    court?: string
    date?: string
    content: string
    cited_by?: number
    how_cited?: string[]
  } {
    const $ = cheerio.load(html)

    const title = $("#gs_opinion_title").text().trim()
    const metaText = $("#gs_opinion_date").text().trim()

    const citation = this.extractCitation(metaText)
    const date = this.extractDate(metaText)
    const court = this.extractCourt(metaText)

    const content = $("#gs_opinion_content").text().trim()

    // Extract cited by count
    const citedByText = $('.gs_fl a:contains("Cited by")').text()
    const citedByMatch = citedByText.match(/Cited by (\d+)/)
    const cited_by = citedByMatch ? Number.parseInt(citedByMatch[1], 10) : undefined

    // Extract how cited information
    const how_cited: string[] = []
    $(".how_cited_card").each((i, element) => {
      how_cited.push($(element).text().trim())
    })

    return {
      title,
      citation,
      court,
      date,
      content,
      cited_by,
      how_cited,
    }
  }

  /**
   * Extract citation from meta text
   */
  private extractCitation(metaText: string): string {
    // This is a simplified extraction - actual implementation would be more robust
    const citationPatterns = [
      /(\d+\s+U\.S\.\s+\d+)/,
      /(\d+\s+S\.Ct\.\s+\d+)/,
      /(\d+\s+F\.\d+d\s+\d+)/,
      /(\d+\s+F\.\s+Supp\.\s+\d+)/,
      /(\d+\s+F\.\s+Supp\.\s+\d+d\s+\d+)/,
      /(\d+\s+[A-Za-z.]+\s+\d+)/,
    ]

    for (const pattern of citationPatterns) {
      const match = metaText.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return ""
  }

  /**
   * Extract date from meta text
   */
  private extractDate(metaText: string): string | undefined {
    const datePattern = /(\d{4})/
    const match = metaText.match(datePattern)
    return match ? match[1] : undefined
  }

  /**
   * Extract court from meta text
   */
  private extractCourt(metaText: string): string | undefined {
    const courtPatterns = [/Supreme Court/i, /Court of Appeals/i, /District Court/i, /Circuit/i]

    for (const pattern of courtPatterns) {
      const match = metaText.match(pattern)
      if (match) {
        // Try to extract the full court name
        const courtNamePattern = new RegExp(`([\\w\\s]+${match[0]})`, "i")
        const courtNameMatch = metaText.match(courtNamePattern)
        return courtNameMatch ? courtNameMatch[1].trim() : match[0]
      }
    }

    return undefined
  }

  /**
   * Test connection to Google Scholar
   */
  async testConnection(): Promise<{
    status: "online" | "offline" | "blocked"
    message: string
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/scholar?q=test&as_sdt=6`, {
        timeout: this.timeout,
        headers: {
          "User-Agent": this.userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      })

      // Check if we're blocked or got a captcha
      if (response.data.includes("captcha") || response.data.includes("unusual traffic")) {
        return {
          status: "blocked",
          message: "Google Scholar is showing a captcha or has blocked automated access",
        }
      }

      return {
        status: "online",
        message: "Connected to Google Scholar",
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return {
          status: "blocked",
          message: "Google Scholar has blocked automated access",
        }
      }

      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
      }
    }
  }
}

// Export a default instance
export const googleScholarAPI = new GoogleScholarAPI()
