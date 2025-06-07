import { CourtListenerAPI } from "./court-listener-api"

/**
 * Extended CourtListener API Client
 * Includes Financial Disclosures, Alerts, Webhooks, and RECAP functionality
 */

// Financial Disclosure Interfaces
export interface FinancialDisclosure {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  year: number
  download_filepath: string
  filepath: string
  thumbnail: string
  thumbnail_status: number
  page_count: number
  sha1: string
  date_raw: string
  date_created_raw: string
  has_been_extracted: boolean
  is_amended: boolean
  addendum_content_raw: string
  addendum_redacted: boolean
  person: string
  investments: Investment[]
  positions: DisclosurePosition[]
  agreements: Agreement[]
  non_investment_incomes: NonInvestmentIncome[]
  spouse_incomes: SpouseIncome[]
  reimbursements: Reimbursement[]
  gifts: Gift[]
  debts: Debt[]
}

export interface Investment {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  page_number: number
  description: string
  redacted: boolean
  income_during_reporting_period_code: string
  income_during_reporting_period_type: string
  gross_value_code: string
  gross_value_method: string
  transaction_during_reporting_period: string
  transaction_date_raw: string
  transaction_date: string | null
  transaction_value_code: string
  transaction_gain_code: string
  transaction_partner: string
  has_inferred_values: boolean
  financial_disclosure: string
}

export interface Gift {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  source: string
  description: string
  value: string
  redacted: boolean
  financial_disclosure: string
}

export interface Debt {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  creditor_name: string
  description: string
  value_code: string
  redacted: boolean
  financial_disclosure: string
}

export interface Reimbursement {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  source: string
  date_raw: string
  location: string
  purpose: string
  items_paid_or_provided: string
  redacted: boolean
  financial_disclosure: string
}

export interface DisclosurePosition {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  position: string
  organization_name: string
  redacted: boolean
  financial_disclosure: string
}

export interface Agreement {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  date_raw: string
  parties_and_terms: string
  redacted: boolean
  financial_disclosure: string
}

export interface NonInvestmentIncome {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  date_raw: string
  source_type: string
  income_amount: string
  redacted: boolean
  financial_disclosure: string
}

export interface SpouseIncome {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  date_raw: string
  source_type: string
  redacted: boolean
  financial_disclosure: string
}

// Citation Network Interfaces
export interface OpinionCited {
  id: number
  resource_uri: string
  citing_opinion: string
  cited_opinion: string
  depth: number
}

// Alert Interfaces
export interface SearchAlert {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  date_last_hit: string | null
  name: string
  query: string
  rate: "rt" | "dly" | "wly" | "mly"
  alert_type: string
  secret_key: string
}

export interface DocketAlert {
  id: number
  date_created: string
  date_modified: string
  date_last_hit: string | null
  secret_key: string
  alert_type: number // 0 = unsubscribe, 1 = subscribe
  docket: number
}

// RECAP Interfaces
export interface RecapFetchRequest {
  id: number
  court: string
  docket: number | null
  docket_entry: number | null
  recap_document: number | null
  date_created: string
  date_modified: string
  pacer_case_id: string
  pacer_doc_id: string
  acms_document_guid: string
  document_number: number | null
  attachment_number: number | null
  status: number // 1=queued, 2=success, 3=error, 4=processing, 5=retry, 6=invalid, 7=insufficient_metadata
  upload_type: number
  error_message: string
  debug: boolean
}

// Webhook Interfaces
export interface WebhookEvent {
  payload: any
  webhook: {
    id: number
    date_created: string
    url: string
    enabled: boolean
    event_type: number
    version: number
  }
}

// Opinion Interfaces
export interface Opinion {
  id: number
  resource_uri: string
  absolute_url: string
  cluster: string
  author: string | null
  joined_by: string | null
  date_created: string
  date_modified: string
  sha1: string
  page_count: number | null
  download_url: string | null
  local_path: string | null
  extracted_by_ocr: boolean
  date: string | null
  citations: string[]
  frontend_url: string
  name: string
  name_abbreviation: string
  decision_date: string | null
  casebody_data: any
  docket: {
    id: number
    resource_uri: string
    url: string
  }
}

export interface OpinionCluster {
  id: number
  resource_uri: string
  absolute_url: string
  duplicative: boolean
  citation_count: number
  case_name: string
  case_name_full: string
  case_name_short: string
  west_citation: string
  lexis_citation: string
  cite_url: string | null
  docket: {
    id: number
    resource_uri: string
    url: string
  }
  court: {
    id: number
    resource_uri: string
    url: string
    name: string
    name_abbreviation: string
    slug: string
  }
  judges: {
    id: number
    resource_uri: string
    name: string
  }[]
  date_created: string
  date_modified: string
}

export interface Judge {
  id: number
  resource_uri: string
  url: string
  name: string
  date_created: string
  date_modified: string
}

export interface ApiResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export class CourtListenerExtendedAPI extends CourtListenerAPI {
  // FINANCIAL DISCLOSURE APIs

  /**
   * Get financial disclosures with filtering
   */
  async getFinancialDisclosures(
    options: {
      person?: number
      year?: number
      year__gte?: number
      year__lte?: number
      has_been_extracted?: boolean
      is_amended?: boolean
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<FinancialDisclosure>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/financial-disclosures/?${searchParams}`)
  }

  /**
   * Get a specific financial disclosure by ID
   */
  async getFinancialDisclosure(id: number): Promise<FinancialDisclosure> {
    return this.makeRequest(`/financial-disclosures/${id}/`)
  }

  /**
   * Get investments with filtering
   */
  async getInvestments(
    options: {
      financial_disclosure?: number
      financial_disclosure__person?: number
      description?: string
      gross_value_code?: string
      redacted?: boolean
      has_inferred_values?: boolean
      order_by?: string
      page_size?: number
      cursor?: string
    } = {},
  ): Promise<ApiResponse<Investment>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/investments/?${searchParams}`)
  }

  /**
   * Get gifts with filtering
   */
  async getGifts(
    options: {
      financial_disclosure?: number
      financial_disclosure__person?: number
      source?: string
      value?: string
      redacted?: boolean
      order_by?: string
      page_size?: number
      cursor?: string
    } = {},
  ): Promise<ApiResponse<Gift>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/gifts/?${searchParams}`)
  }

  /**
   * Get debts with filtering
   */
  async getDebts(
    options: {
      financial_disclosure?: number
      financial_disclosure__person?: number
      creditor_name?: string
      value_code?: string
      redacted?: boolean
      order_by?: string
      page_size?: number
      cursor?: string
    } = {},
  ): Promise<ApiResponse<Debt>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/debts/?${searchParams}`)
  }

  /**
   * Get reimbursements with filtering
   */
  async getReimbursements(
    options: {
      financial_disclosure?: number
      financial_disclosure__person?: number
      source?: string
      location?: string
      redacted?: boolean
      order_by?: string
      page_size?: number
      cursor?: string
    } = {},
  ): Promise<ApiResponse<Reimbursement>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/reimbursements/?${searchParams}`)
  }

  /**
   * Get disclosure positions with filtering
   */
  async getDisclosurePositions(
    options: {
      financial_disclosure?: number
      financial_disclosure__person?: number
      organization_name?: string
      position?: string
      redacted?: boolean
      order_by?: string
      page_size?: number
      cursor?: string
    } = {},
  ): Promise<ApiResponse<DisclosurePosition>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/disclosure-positions/?${searchParams}`)
  }

  // CITATION NETWORK APIs

  /**
   * Get citation relationships between opinions
   */
  async getOpinionsCited(
    options: {
      citing_opinion?: number
      cited_opinion?: number
      depth?: number
      depth__gte?: number
      depth__lte?: number
      order_by?: string
      page_size?: number
      cursor?: string
    } = {},
  ): Promise<ApiResponse<OpinionCited>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/opinions-cited/?${searchParams}`)
  }

  /**
   * Get what an opinion cites (backward citations)
   */
  async getOpinionAuthorities(opinionId: number): Promise<OpinionCited[]> {
    const response = await this.getOpinionsCited({
      citing_opinion: opinionId,
      page_size: 1000, // Get all authorities
    })
    return response.results
  }

  /**
   * Get what cites an opinion (forward citations)
   */
  async getOpinionCitations(opinionId: number): Promise<OpinionCited[]> {
    const response = await this.getOpinionsCited({
      cited_opinion: opinionId,
      page_size: 1000, // Get all citations
    })
    return response.results
  }

  // ALERT APIs

  /**
   * Get search alerts
   */
  async getSearchAlerts(
    options: {
      name?: string
      query?: string
      rate?: "rt" | "dly" | "wly" | "mly"
      alert_type?: string
      order_by?: string
      page_size?: number
      cursor?: string
    } = {},
  ): Promise<ApiResponse<SearchAlert>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/alerts/?${searchParams}`)
  }

  /**
   * Create a search alert
   */
  async createSearchAlert(alert: {
    name: string
    query: string
    rate: "rt" | "dly" | "wly" | "mly"
    alert_type?: string
  }): Promise<SearchAlert> {
    return this.makeRequest("/alerts/", {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(alert as any),
    })
  }

  /**
   * Update a search alert
   */
  async updateSearchAlert(id: number, updates: Partial<SearchAlert>): Promise<SearchAlert> {
    return this.makeRequest(`/alerts/${id}/`, {
      method: "PATCH",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(updates as any),
    })
  }

  /**
   * Delete a search alert
   */
  async deleteSearchAlert(id: number): Promise<void> {
    await this.makeRequest(`/alerts/${id}/`, {
      method: "DELETE",
    })
  }

  /**
   * Get docket alerts
   */
  async getDocketAlerts(
    options: {
      docket?: number
      alert_type?: number
      order_by?: string
      page_size?: number
      cursor?: string
    } = {},
  ): Promise<ApiResponse<DocketAlert>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/docket-alerts/?${searchParams}`)
  }

  /**
   * Create a docket alert (subscribe to a docket)
   */
  async createDocketAlert(docketId: number): Promise<DocketAlert> {
    return this.makeRequest("/docket-alerts/", {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ docket: docketId.toString() }),
    })
  }

  /**
   * Update a docket alert
   */
  async updateDocketAlert(id: number, alertType: number): Promise<DocketAlert> {
    return this.makeRequest(`/docket-alerts/${id}/`, {
      method: "PATCH",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ alert_type: alertType.toString() }),
    })
  }

  /**
   * Delete a docket alert (unsubscribe from a docket)
   */
  async deleteDocketAlert(id: number): Promise<void> {
    await this.makeRequest(`/docket-alerts/${id}/`, {
      method: "DELETE",
    })
  }

  // RECAP APIs

  /**
   * Fetch PACER content (requires PACER credentials)
   */
  async fetchPacerContent(request: {
    request_type: number // 1=docket, 2=pdf, 3=attachment_page
    pacer_username: string
    pacer_password: string
    court?: string
    docket?: number
    docket_number?: string
    pacer_case_id?: string
    recap_document?: number
    pacer_doc_id?: string
    document_number?: number
    attachment_number?: number
    show_parties_and_counsel?: boolean
    de_date_start?: string
    de_date_end?: string
    client_code?: string
    debug?: boolean
  }): Promise<RecapFetchRequest> {
    return this.makeRequest("/recap-fetch/", {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(request as any),
    })
  }

  /**
   * Get RECAP fetch request status
   */
  async getRecapFetchStatus(id: number): Promise<RecapFetchRequest> {
    return this.makeRequest(`/recap-fetch/${id}/`)
  }

  /**
   * Get RECAP fetch requests with filtering
   */
  async getRecapFetchRequests(
    options: {
      status?: number
      court?: string
      request_type?: number
      date_created__gte?: string
      date_created__lte?: string
      order_by?: string
      page_size?: number
      cursor?: string
    } = {},
  ): Promise<ApiResponse<RecapFetchRequest>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/recap-fetch/?${searchParams}`)
  }

  // UTILITY METHODS

  /**
   * Analyze judge financial conflicts for a specific case
   */
  async analyzeJudgeConflicts(
    judgeId: number,
    caseKeywords: string[],
  ): Promise<{
    judge: Judge
    potentialConflicts: {
      investments: Investment[]
      gifts: Gift[]
      positions: DisclosurePosition[]
      reimbursements: Reimbursement[]
    }
    riskScore: number
  }> {
    try {
      // Get judge information
      const judge = await this.getJudge(judgeId)

      // Get recent financial disclosures
      const disclosures = await this.getFinancialDisclosures({
        person: judgeId,
        year__gte: new Date().getFullYear() - 3, // Last 3 years
        has_been_extracted: true,
      })

      const potentialConflicts = {
        investments: [] as Investment[],
        gifts: [] as Gift[],
        positions: [] as DisclosurePosition[],
        reimbursements: [] as Reimbursement[],
      }

      // Analyze each disclosure for potential conflicts
      for (const disclosure of disclosures.results) {
        // Check investments
        const investments = await this.getInvestments({
          financial_disclosure: disclosure.id,
        })

        for (const investment of investments.results) {
          if (this.hasKeywordMatch(investment.description, caseKeywords)) {
            potentialConflicts.investments.push(investment)
          }
        }

        // Check gifts
        const gifts = await this.getGifts({
          financial_disclosure: disclosure.id,
        })

        for (const gift of gifts.results) {
          if (this.hasKeywordMatch(`${gift.source} ${gift.description}`, caseKeywords)) {
            potentialConflicts.gifts.push(gift)
          }
        }

        // Check positions
        const positions = await this.getDisclosurePositions({
          financial_disclosure: disclosure.id,
        })

        for (const position of positions.results) {
          if (this.hasKeywordMatch(`${position.organization_name} ${position.position}`, caseKeywords)) {
            potentialConflicts.positions.push(position)
          }
        }

        // Check reimbursements
        const reimbursements = await this.getReimbursements({
          financial_disclosure: disclosure.id,
        })

        for (const reimbursement of reimbursements.results) {
          if (this.hasKeywordMatch(`${reimbursement.source} ${reimbursement.purpose}`, caseKeywords)) {
            potentialConflicts.reimbursements.push(reimbursement)
          }
        }
      }

      // Calculate risk score
      const riskScore = this.calculateConflictRiskScore(potentialConflicts)

      return {
        judge,
        potentialConflicts,
        riskScore,
      }
    } catch (error) {
      console.error("Error analyzing judge conflicts:", error)
      throw error
    }
  }

  private hasKeywordMatch(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase()
    return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))
  }

  private calculateConflictRiskScore(conflicts: {
    investments: Investment[]
    gifts: Gift[]
    positions: DisclosurePosition[]
    reimbursements: Reimbursement[]
  }): number {
    let score = 0

    // Weight different types of conflicts
    score += conflicts.investments.length * 3 // Investments are high risk
    score += conflicts.gifts.length * 2 // Gifts are medium-high risk
    score += conflicts.positions.length * 2 // Positions are medium-high risk
    score += conflicts.reimbursements.length * 1 // Reimbursements are lower risk

    // Normalize to 0-100 scale
    return Math.min(score * 10, 100)
  }

  /**
   * Get citation network analysis for an opinion
   */
  async getCitationNetworkAnalysis(opinionId: number): Promise<{
    opinion: Opinion
    authorities: OpinionCited[]
    citations: OpinionCited[]
    networkMetrics: {
      authorityCount: number
      citationCount: number
      averageCitationDepth: number
      influenceScore: number
    }
  }> {
    try {
      const opinion = await this.getOpinion(opinionId)
      const authorities = await this.getOpinionAuthorities(opinionId)
      const citations = await this.getOpinionCitations(opinionId)

      const networkMetrics = {
        authorityCount: authorities.length,
        citationCount: citations.length,
        averageCitationDepth:
          citations.length > 0 ? citations.reduce((sum, c) => sum + c.depth, 0) / citations.length : 0,
        influenceScore: this.calculateInfluenceScore(authorities.length, citations.length),
      }

      return {
        opinion,
        authorities,
        citations,
        networkMetrics,
      }
    } catch (error) {
      console.error("Error analyzing citation network:", error)
      throw error
    }
  }

  private calculateInfluenceScore(authorityCount: number, citationCount: number): number {
    // Simple influence score based on citation patterns
    // Higher score for opinions that cite many authorities and are cited by many others
    const authorityScore = Math.log(authorityCount + 1) * 10
    const citationScore = Math.log(citationCount + 1) * 20
    return Math.min(authorityScore + citationScore, 100)
  }

  /**
   * Create comprehensive case monitoring setup
   */
  async setupCaseMonitoring(params: {
    caseName: string
    docketNumber?: string
    court?: string
    keywords: string[]
    alertRate: "rt" | "dly" | "wly" | "mly"
  }): Promise<{
    searchAlert: SearchAlert
    docketAlert?: DocketAlert
    relatedCases: OpinionCluster[]
  }> {
    try {
      // Create search alert for the case and related keywords
      const searchQuery = [`case_name:"${params.caseName}"`, ...params.keywords.map((k) => `"${k}"`)].join(" OR ")

      const searchAlert = await this.createSearchAlert({
        name: `Monitoring: ${params.caseName}`,
        query: `q=${encodeURIComponent(searchQuery)}&type=o`,
        rate: params.alertRate,
      })

      // Try to find and subscribe to the specific docket
      let docketAlert: DocketAlert | undefined

      if (params.docketNumber && params.court) {
        try {
          const dockets = await this.getDockets({
            docket_number: params.docketNumber,
            court: params.court,
            page_size: 1,
          })

          if (dockets.results.length > 0) {
            docketAlert = await this.createDocketAlert(dockets.results[0].id)
          }
        } catch (error) {
          console.warn("Could not create docket alert:", error)
        }
      }

      // Find related cases
      const relatedCases = await this.searchByCaseName(params.caseName, false)

      return {
        searchAlert,
        docketAlert,
        relatedCases: relatedCases.slice(0, 10), // Limit to top 10 related cases
      }
    } catch (error) {
      console.error("Error setting up case monitoring:", error)
      throw error
    }
  }
}

// Export the extended API
export const courtListenerExtendedAPI = new CourtListenerExtendedAPI()
