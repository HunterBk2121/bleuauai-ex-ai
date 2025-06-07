/**
 * Juriscraper Integration for Legal AI Platform
 * Provides direct court scraping capabilities via Python subprocess calls
 * Complements CourtListener API with real-time scraping
 */

import { spawn } from "child_process"
import { readFile, unlink } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import { randomUUID } from "crypto"

export interface JuriscraperConfig {
  pythonPath?: string
  juriscraperPath?: string
  timeout?: number
  webdriverConnection?: string
  seleniumVisible?: boolean
}

export interface CourtScrapeResult {
  court_id: string
  opinions: Opinion[]
  oral_arguments: OralArgument[]
  metadata: {
    scrape_date: string
    total_items: number
    success: boolean
    errors: string[]
  }
}

export interface Opinion {
  title: string
  url: string
  date: string
  court: string
  docket_number?: string
  citation?: string
  summary?: string
  download_url?: string
  local_path?: string
  judges?: string[]
  nature_of_suit?: string
  status?: string
}

export interface OralArgument {
  title: string
  url: string
  date: string
  court: string
  docket_number?: string
  duration?: string
  download_url?: string
  local_path?: string
  judges?: string[]
  case_name?: string
}

export interface AvailableCourt {
  id: string
  name: string
  jurisdiction: "federal" | "state"
  level: "appellate" | "supreme" | "district" | "bankruptcy"
  supports_opinions: boolean
  supports_oral_arguments: boolean
  requires_webdriver: boolean
}

export class JuriscraperIntegration {
  private config: JuriscraperConfig
  private tempDir: string

  constructor(config: JuriscraperConfig = {}) {
    this.config = {
      pythonPath: config.pythonPath || "python3",
      juriscraperPath: config.juriscraperPath || "juriscraper",
      timeout: config.timeout || 300000, // 5 minutes
      webdriverConnection: config.webdriverConnection || process.env.WEBDRIVER_CONN,
      seleniumVisible: config.seleniumVisible || !!process.env.SELENIUM_VISIBLE,
      ...config,
    }
    this.tempDir = tmpdir()
  }

  /**
   * Get list of all available courts that can be scraped
   */
  async getAvailableCourts(): Promise<AvailableCourt[]> {
    const courts: AvailableCourt[] = [
      // Federal Appellate Courts
      {
        id: "ca1",
        name: "First Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca2",
        name: "Second Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca3",
        name: "Third Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca4",
        name: "Fourth Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca5",
        name: "Fifth Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca6",
        name: "Sixth Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca7",
        name: "Seventh Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca8",
        name: "Eighth Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca9",
        name: "Ninth Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca10",
        name: "Tenth Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "ca11",
        name: "Eleventh Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "cadc",
        name: "D.C. Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },
      {
        id: "cafc",
        name: "Federal Circuit Court of Appeals",
        jurisdiction: "federal",
        level: "appellate",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },

      // Supreme Court
      {
        id: "scotus",
        name: "Supreme Court of the United States",
        jurisdiction: "federal",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: true,
        requires_webdriver: false,
      },

      // State Supreme Courts (sample)
      {
        id: "cal",
        name: "California Supreme Court",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: false,
      },
      {
        id: "ny",
        name: "New York Court of Appeals",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: false,
      },
      {
        id: "tex",
        name: "Texas Supreme Court",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: false,
      },
      {
        id: "fla",
        name: "Florida Supreme Court",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: false,
      },
      {
        id: "ill",
        name: "Illinois Supreme Court",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: false,
      },
      {
        id: "pa",
        name: "Pennsylvania Supreme Court",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: false,
      },
      {
        id: "ohio",
        name: "Ohio Supreme Court",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: false,
      },
      {
        id: "mich",
        name: "Michigan Supreme Court",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: false,
      },
      {
        id: "wash",
        name: "Washington Supreme Court",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: false,
      },
      {
        id: "kan_p",
        name: "Kansas Supreme Court (Precedential)",
        jurisdiction: "state",
        level: "supreme",
        supports_opinions: true,
        supports_oral_arguments: false,
        requires_webdriver: true,
      },
    ]

    return courts
  }

  /**
   * Scrape opinions from a specific court
   */
  async scrapeCourtOpinions(courtId: string): Promise<CourtScrapeResult> {
    const scrapeId = randomUUID()
    const outputFile = join(this.tempDir, `juriscraper_${scrapeId}.json`)

    try {
      const result = await this.runJuriscraperCommand([
        "-c",
        `juriscraper.opinions.united_states.federal_appellate.${courtId}`,
        "--output",
        outputFile,
        "--format",
        "json",
      ])

      const data = await this.readOutputFile(outputFile)

      return {
        court_id: courtId,
        opinions: data.opinions || [],
        oral_arguments: [],
        metadata: {
          scrape_date: new Date().toISOString(),
          total_items: data.opinions?.length || 0,
          success: result.success,
          errors: result.errors,
        },
      }
    } catch (error) {
      return {
        court_id: courtId,
        opinions: [],
        oral_arguments: [],
        metadata: {
          scrape_date: new Date().toISOString(),
          total_items: 0,
          success: false,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        },
      }
    } finally {
      await this.cleanupFile(outputFile)
    }
  }

  /**
   * Scrape oral arguments from a specific court
   */
  async scrapeCourtOralArguments(courtId: string): Promise<CourtScrapeResult> {
    const scrapeId = randomUUID()
    const outputFile = join(this.tempDir, `juriscraper_oa_${scrapeId}.json`)

    try {
      const result = await this.runJuriscraperCommand([
        "-c",
        `juriscraper.oral_args.united_states.federal_appellate.${courtId}`,
        "--output",
        outputFile,
        "--format",
        "json",
      ])

      const data = await this.readOutputFile(outputFile)

      return {
        court_id: courtId,
        opinions: [],
        oral_arguments: data.oral_arguments || [],
        metadata: {
          scrape_date: new Date().toISOString(),
          total_items: data.oral_arguments?.length || 0,
          success: result.success,
          errors: result.errors,
        },
      }
    } catch (error) {
      return {
        court_id: courtId,
        opinions: [],
        oral_arguments: [],
        metadata: {
          scrape_date: new Date().toISOString(),
          total_items: 0,
          success: false,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        },
      }
    } finally {
      await this.cleanupFile(outputFile)
    }
  }

  /**
   * Scrape multiple courts in parallel
   */
  async scrapeMultipleCourts(courtIds: string[], includeOralArguments = false): Promise<CourtScrapeResult[]> {
    const promises = courtIds.map(async (courtId) => {
      const [opinions, oralArgs] = await Promise.all([
        this.scrapeCourtOpinions(courtId),
        includeOralArguments ? this.scrapeCourtOralArguments(courtId) : Promise.resolve(null),
      ])

      return {
        court_id: courtId,
        opinions: opinions.opinions,
        oral_arguments: oralArgs?.oral_arguments || [],
        metadata: {
          scrape_date: new Date().toISOString(),
          total_items: opinions.opinions.length + (oralArgs?.oral_arguments.length || 0),
          success: opinions.metadata.success && oralArgs?.metadata.success !== false,
          errors: [...opinions.metadata.errors, ...(oralArgs?.metadata.errors || [])],
        },
      }
    })

    return Promise.all(promises)
  }

  /**
   * Test scraper functionality with a specific court
   */
  async testScraper(courtId: string): Promise<{
    success: boolean
    message: string
    sampleData?: any
    errors: string[]
  }> {
    try {
      const result = await this.runJuriscraperCommand([
        "-c",
        `juriscraper.opinions.united_states.federal_appellate.${courtId}`,
        "--test",
      ])

      return {
        success: result.success,
        message: result.success ? "Scraper test successful" : "Scraper test failed",
        sampleData: result.data,
        errors: result.errors,
      }
    } catch (error) {
      return {
        success: false,
        message: "Scraper test failed with exception",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      }
    }
  }

  /**
   * Download and process a specific document
   */
  async downloadDocument(
    url: string,
    type: "opinion" | "oral_argument",
  ): Promise<{
    success: boolean
    localPath?: string
    cleanedContent?: string
    metadata?: any
    error?: string
  }> {
    const downloadId = randomUUID()
    const outputFile = join(this.tempDir, `download_${downloadId}`)

    try {
      const result = await this.runJuriscraperCommand([
        "--download",
        url,
        "--output",
        outputFile,
        "--type",
        type,
        "--cleanup",
      ])

      if (result.success && result.data?.localPath) {
        const content = await readFile(result.data.localPath, "utf-8")

        return {
          success: true,
          localPath: result.data.localPath,
          cleanedContent: content,
          metadata: result.data.metadata,
        }
      }

      return {
        success: false,
        error: result.errors.join("; "),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      }
    }
  }

  /**
   * Get scraper status and health check
   */
  async getScraperStatus(): Promise<{
    juriscraper_available: boolean
    python_version?: string
    webdriver_status: "available" | "unavailable" | "remote"
    supported_courts: number
    last_check: string
  }> {
    try {
      const result = await this.runJuriscraperCommand(["--status"])

      return {
        juriscraper_available: result.success,
        python_version: result.data?.python_version,
        webdriver_status: this.getWebDriverStatus(),
        supported_courts: (await this.getAvailableCourts()).length,
        last_check: new Date().toISOString(),
      }
    } catch (error) {
      return {
        juriscraper_available: false,
        webdriver_status: "unavailable",
        supported_courts: 0,
        last_check: new Date().toISOString(),
      }
    }
  }

  /**
   * Bulk scrape with filtering and processing
   */
  async bulkScrape(options: {
    courts: string[]
    dateRange?: { start: string; end: string }
    keywords?: string[]
    maxItems?: number
    includeOralArguments?: boolean
    downloadDocuments?: boolean
  }): Promise<{
    results: CourtScrapeResult[]
    summary: {
      total_courts: number
      successful_courts: number
      total_items: number
      total_errors: number
    }
  }> {
    const results = await this.scrapeMultipleCourts(options.courts, options.includeOralArguments)

    // Apply filtering if specified
    const filteredResults = results.map((result) => ({
      ...result,
      opinions: this.filterItems(result.opinions, options),
      oral_arguments: this.filterItems(result.oral_arguments, options),
    }))

    // Download documents if requested
    if (options.downloadDocuments) {
      for (const result of filteredResults) {
        for (const opinion of result.opinions) {
          if (opinion.download_url) {
            const download = await this.downloadDocument(opinion.download_url, "opinion")
            if (download.success) {
              opinion.local_path = download.localPath
            }
          }
        }
      }
    }

    const summary = {
      total_courts: results.length,
      successful_courts: results.filter((r) => r.metadata.success).length,
      total_items: results.reduce((sum, r) => sum + r.metadata.total_items, 0),
      total_errors: results.reduce((sum, r) => sum + r.metadata.errors.length, 0),
    }

    return { results: filteredResults, summary }
  }

  private async runJuriscraperCommand(args: string[]): Promise<{
    success: boolean
    data?: any
    errors: string[]
  }> {
    return new Promise((resolve) => {
      const env = { ...process.env }

      if (this.config.webdriverConnection) {
        env.WEBDRIVER_CONN = this.config.webdriverConnection
      }

      if (this.config.seleniumVisible) {
        env.SELENIUM_VISIBLE = "yes"
      }

      const child = spawn(this.config.pythonPath!, ["-m", "juriscraper.sample_caller", ...args], {
        env,
        timeout: this.config.timeout,
      })

      let stdout = ""
      let stderr = ""

      child.stdout?.on("data", (data) => {
        stdout += data.toString()
      })

      child.stderr?.on("data", (data) => {
        stderr += data.toString()
      })

      child.on("close", (code) => {
        const errors = stderr ? [stderr] : []

        try {
          const data = stdout ? JSON.parse(stdout) : null
          resolve({
            success: code === 0,
            data,
            errors,
          })
        } catch (parseError) {
          resolve({
            success: false,
            data: null,
            errors: [...errors, `JSON parse error: ${parseError}`],
          })
        }
      })

      child.on("error", (error) => {
        resolve({
          success: false,
          data: null,
          errors: [error.message],
        })
      })
    })
  }

  private async readOutputFile(filePath: string): Promise<any> {
    try {
      const content = await readFile(filePath, "utf-8")
      return JSON.parse(content)
    } catch (error) {
      throw new Error(`Failed to read output file: ${error}`)
    }
  }

  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath)
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  private getWebDriverStatus(): "available" | "unavailable" | "remote" {
    if (this.config.webdriverConnection && this.config.webdriverConnection !== "local") {
      return "remote"
    }
    // This is a simplified check - in reality, you'd want to test geckodriver availability
    return "available"
  }

  private filterItems(items: any[], options: any): any[] {
    let filtered = [...items]

    // Date range filtering
    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start)
      const endDate = new Date(options.dateRange.end)

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // Keyword filtering
    if (options.keywords && options.keywords.length > 0) {
      filtered = filtered.filter((item) => {
        const searchText = `${item.title} ${item.summary || ""} ${item.case_name || ""}`.toLowerCase()
        return options.keywords.some((keyword: string) => searchText.includes(keyword.toLowerCase()))
      })
    }

    // Limit results
    if (options.maxItems) {
      filtered = filtered.slice(0, options.maxItems)
    }

    return filtered
  }
}

// Export default instance
export const juriscraperIntegration = new JuriscraperIntegration()

// Export utility functions
export function getCourtModule(courtId: string, type: "opinions" | "oral_args" = "opinions"): string {
  const courts = {
    // Federal Appellate
    ca1: "federal_appellate.ca1",
    ca2: "federal_appellate.ca2",
    ca3: "federal_appellate.ca3",
    ca4: "federal_appellate.ca4",
    ca5: "federal_appellate.ca5",
    ca6: "federal_appellate.ca6",
    ca7: "federal_appellate.ca7",
    ca8: "federal_appellate.ca8",
    ca9: "federal_appellate.ca9",
    ca10: "federal_appellate.ca10",
    ca11: "federal_appellate.ca11",
    cadc: "federal_appellate.cadc",
    cafc: "federal_appellate.cafc",

    // Supreme Court
    scotus: "federal.scotus",

    // State Courts
    cal: "state.cal",
    ny: "state.ny",
    tex: "state.tex",
    fla: "state.fla",
    ill: "state.ill",
    pa: "state.pa",
    ohio: "state.ohio",
    mich: "state.mich",
    wash: "state.wash",
    kan_p: "state.kan_p",
  } as const

  const courtPath = courts[courtId as keyof typeof courts]
  if (!courtPath) {
    throw new Error(`Unknown court ID: ${courtId}`)
  }

  return `juriscraper.${type}.united_states.${courtPath}`
}

export function inferPracticeArea(opinion: Opinion): string {
  const text = `${opinion.title} ${opinion.summary || ""} ${opinion.nature_of_suit || ""}`.toLowerCase()

  if (text.includes("constitutional") || text.includes("amendment")) return "CONST"
  if (text.includes("criminal") || text.includes("prosecution")) return "CRIM"
  if (text.includes("contract") || text.includes("breach")) return "CONTRACT"
  if (text.includes("tort") || text.includes("negligence")) return "TORT"
  if (text.includes("employment") || text.includes("labor")) return "LABOR"
  if (text.includes("intellectual property") || text.includes("patent") || text.includes("copyright")) return "IP"
  if (text.includes("tax") || text.includes("revenue")) return "TAX"
  if (text.includes("immigration") || text.includes("deportation")) return "IMMIGRATION"
  if (text.includes("environmental") || text.includes("epa")) return "ENVIRONMENTAL"
  if (text.includes("securities") || text.includes("sec ")) return "SECURITIES"
  if (text.includes("antitrust") || text.includes("monopoly")) return "ANTITRUST"
  if (text.includes("bankruptcy") || text.includes("debtor")) return "BANKRUPTCY"
  if (text.includes("civil rights") || text.includes("discrimination")) return "CIVIL_RIGHTS"

  return "GENERAL"
}
