import { insertLegalDocument } from "@/lib/database"

/**
 * CourtListener REST API v4.1 Client
 * Complete integration with CourtListener's comprehensive legal database
 * Based on official API documentation: https://www.courtlistener.com/help/api/rest/
 */

export interface CourtListenerConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
}

// Core API Interfaces based on official documentation
export interface OpinionCluster {
  id: number
  absolute_url: string
  resource_uri: string
  date_created: string
  date_modified: string
  date_filed: string
  date_filed_is_approximate: boolean
  slug: string
  case_name: string
  case_name_short: string
  case_name_full: string
  federal_cite_one: string
  federal_cite_two: string
  federal_cite_three: string
  state_cite_one: string
  state_cite_two: string
  state_cite_three: string
  neutral_cite: string
  scdb_id: string
  scdb_decision_direction: number
  scdb_votes_majority: number
  scdb_votes_minority: number
  source: string
  procedural_history: string
  attorneys: string
  nature_of_suit: string
  posture: string
  syllabus: string
  headnotes: string
  summary: string
  disposition: string
  history: string
  other_dates: string
  cross_reference: string
  correction: string
  citation_count: number
  precedential_status: string
  date_blocked: string
  blocked: boolean
  court: string
  sub_opinions: Opinion[]
  citations: Citation[]
  docket: string
  panel: string[]
  non_participating_judges: string[]
  tags: string[]
}

export interface Opinion {
  id: number
  resource_uri: string
  absolute_url: string
  author: string
  per_curiam: boolean
  joined_by: string[]
  type: string
  sha1: string
  page_count: number
  download_url: string
  local_path: string
  plain_text: string
  html: string
  html_lawbox: string
  html_columbia: string
  html_anon_2020: string
  xml_harvard: string
  html_with_citations: string
  extracted_by_ocr: boolean
  author_str: string
  joined_by_str: string
  cluster: string
}

export interface Docket {
  id: number
  absolute_url: string
  resource_uri: string
  date_created: string
  date_modified: string
  source: number
  appeal_from: string
  appeal_from_str: string
  originating_court_information: string
  date_cert_granted: string
  date_cert_denied: string
  date_argued: string
  date_reargued: string
  date_reargument_denied: string
  date_filed: string
  date_terminated: string
  date_last_filing: string
  case_name: string
  case_name_short: string
  case_name_full: string
  slug: string
  docket_number: string
  docket_number_core: string
  pacer_case_id: string
  cause: string
  nature_of_suit: string
  jury_demand: string
  jurisdiction_type: string
  appellate_fee_status: string
  appellate_case_type_information: string
  mdl_status: string
  filepath_local: string
  filepath_ia: string
  filepath_ia_json: string
  ia_upload_failure_count: number
  ia_needs_upload: boolean
  ia_date_first_change: string
  view_count: number
  date_blocked: string
  blocked: boolean
  court: string
  clusters: string[]
  audio_files: string[]
  assigned_to: string
  assigned_to_str: string
  referred_to: string
  referred_to_str: string
  panel: string[]
  tags: string[]
  parties: Party[]
}

export interface DocketEntry {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  date_filed: string
  entry_number: number
  recap_sequence_number: string
  pacer_sequence_number: string
  description: string
  docket: string
  recap_documents: RecapDocument[]
}

export interface RecapDocument {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  sha1: string
  page_count: number
  file_size: number
  filepath_local: string
  filepath_ia: string
  ia_upload_failure_count: number
  thumbnail: string
  thumbnail_status: number
  plain_text: string
  ocr_status: number
  is_available: boolean
  is_free_on_pacer: boolean
  is_sealed: boolean
  date_upload: string
  document_number: string
  attachment_number: number
  pacer_doc_id: string
  document_type: number
  description: string
  docket_entry: string
  tags: string[]
}

export interface Party {
  id: number
  date_created: string
  date_modified: string
  name: string
  extra_info: string
  party_types: PartyType[]
  attorneys: AttorneyRole[]
}

export interface PartyType {
  id: number
  name: string
  docket: string
  date_terminated: string
  extra_info: string
  highest_offense_level_opening: string
  highest_offense_level_terminated: string
  criminal_counts: any[]
  criminal_complaints: any[]
}

export interface Attorney {
  id: number
  resource_uri: string
  date_created: string
  date_modified: string
  name: string
  contact_raw: string
  phone: string
  fax: string
  email: string
  docket: string
  parties_represented: AttorneyRole[]
}

export interface AttorneyRole {
  role: number
  docket: string
  party: string
  date_action: string
  attorney?: string
  attorney_id?: number
}

export interface Court {
  id: string
  resource_uri: string
  url: string
  full_name: string
  short_name: string
  position: number
  in_use: boolean
  has_opinion_scraper: boolean
  has_oral_argument_scraper: boolean
  start_date: string
  end_date: string
  jurisdiction: string
  notes: string
}

export interface Judge {
  id: number
  resource_uri: string
  absolute_url: string
  date_created: string
  date_modified: string
  date_dob: string
  date_granularity_dob: string
  date_dod: string
  date_granularity_dod: string
  name_first: string
  name_middle: string
  name_last: string
  name_suffix: string
  date_completed: string
  fjc_id: number
  slug: string
  gender: string
  religion: string
  ftm_total_received: number
  ftm_eid: string
  has_photo: boolean
  positions: Position[]
}

export interface Position {
  id: number
  position_type: string
  job_title: string
  sector: number
  person: string
  court: string
  school: string
  organization_name: string
  location_city: string
  location_state: string
  appointer: string
  supervisor: string
  predecessor: string
  date_nominated: string
  date_elected: string
  date_recess_appointment: string
  date_referred_to_judicial_committee: string
  date_judicial_committee_action: string
  judicial_committee_action: string
  date_hearing: string
  date_confirmation: string
  date_start: string
  date_granularity_start: string
  date_termination: string
  date_granularity_termination: string
  date_retirement: string
  termination_reason: string
  votes_yes: number
  votes_no: number
  votes_yes_percent: number
  votes_no_percent: number
  how_selected: string
  has_inferred_values: boolean
}

export interface Citation {
  id: number
  volume: number
  reporter: string
  page: string
  type: number
  cluster: string
}

export interface CitationValidationResult {
  citation: string
  normalized_citations: string[]
  start_index: number
  end_index: number
  status: number
  error_message: string
  isValid: boolean
  isAmbiguous: boolean
  clusters: OpinionCluster[]
  validationTimestamp: string
}

export interface SearchOptions {
  q?: string // Query string
  type?: "o" | "r" | "p" | "d" | "oa" // opinions, recap, people, dockets, oral arguments
  order_by?: string
  court?: string
  judge?: string
  filed_after?: string
  filed_before?: string
  cited_gt?: number
  cited_lt?: number
  page?: number
  page_size?: number
  cursor?: string
  count?: "on" // For count-only requests
  fields?: string // Comma-separated field list
}

export interface ApiResponse<T> {
  count: number | string // Can be number or URL for count endpoint
  next: string | null
  previous: string | null
  results: T[]
}

export class CourtListenerAPI {
  private baseUrl: string
  private apiKey?: string
  private timeout: number

  constructor(config: CourtListenerConfig = {}) {
    this.baseUrl = config.baseUrl || "https://www.courtlistener.com/api/rest/v4"
    this.apiKey = config.apiKey || process.env.COURT_LISTENER_API_KEY
    this.timeout = config.timeout || 30000
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "LegalAI-Platform/1.0",
    }

    if (this.apiKey) {
      headers["Authorization"] = `Token ${this.apiKey}`
    }

    return headers
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!response.ok) {
      if (response.status === 429) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          `Rate limited. ${data.wait_until ? `Wait until: ${data.wait_until}` : "Please try again later."}`,
        )
      }
      throw new Error(`CourtListener API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get API root information and available endpoints
   */
  async getApiRoot(): Promise<any> {
    return this.makeRequest("/")
  }

  /**
   * Get API options for any endpoint
   */
  async getApiOptions(endpoint: string): Promise<any> {
    return this.makeRequest(endpoint, { method: "OPTIONS" })
  }

  // CASE LAW APIs

  /**
   * Search opinion clusters (case law)
   */
  async searchOpinions(options: SearchOptions = {}): Promise<ApiResponse<OpinionCluster>> {
    const searchParams = new URLSearchParams()

    // Set default type to opinions if not specified
    if (!options.type) {
      options.type = "o"
    }

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/search/?${searchParams}`)
  }

  /**
   * Get opinion clusters with advanced filtering
   */
  async getOpinionClusters(
    options: {
      court?: string
      date_filed__gte?: string
      date_filed__lte?: string
      citation_count__gte?: number
      precedential_status?: string
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<OpinionCluster>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/clusters/?${searchParams}`)
  }

  /**
   * Get a specific opinion cluster by ID
   */
  async getOpinionCluster(id: number): Promise<OpinionCluster> {
    return this.makeRequest(`/clusters/${id}/`)
  }

  /**
   * Get opinions with filtering
   */
  async getOpinions(
    options: {
      cluster?: number
      cluster__court?: string
      cluster__date_filed__gte?: string
      cluster__date_filed__lte?: string
      author?: number
      type?: string
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<Opinion>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/opinions/?${searchParams}`)
  }

  /**
   * Get a specific opinion by ID
   */
  async getOpinion(id: number): Promise<Opinion> {
    return this.makeRequest(`/opinions/${id}/`)
  }

  // PACER DATA APIs

  /**
   * Get dockets with filtering
   */
  async getDockets(
    options: {
      court?: string
      case_name?: string
      docket_number?: string
      date_filed__gte?: string
      date_filed__lte?: string
      nature_of_suit?: string
      assigned_to?: number
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<Docket>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/dockets/?${searchParams}`)
  }

  /**
   * Get a specific docket by ID
   */
  async getDocket(id: number): Promise<Docket> {
    return this.makeRequest(`/dockets/${id}/`)
  }

  /**
   * Get docket entries for a specific docket
   */
  async getDocketEntries(
    docketId: number,
    options: {
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<DocketEntry>> {
    const searchParams = new URLSearchParams()
    searchParams.append("docket", docketId.toString())

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/docket-entries/?${searchParams}`)
  }

  /**
   * Get RECAP documents with filtering
   */
  async getRecapDocuments(
    options: {
      docket_entry__docket?: number
      docket_entry__docket__court?: string
      is_available?: boolean
      document_type?: number
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<RecapDocument>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/recap-documents/?${searchParams}`)
  }

  /**
   * Fast document lookup by PACER document IDs
   */
  async recapQuery(
    courtId: string,
    pacerDocIds: string[],
  ): Promise<{
    results: Array<{
      pacer_doc_id: string
      filepath_local: string
      id: number
    }>
  }> {
    const searchParams = new URLSearchParams()
    searchParams.append("docket_entry__docket__court", courtId)
    searchParams.append("pacer_doc_id__in", pacerDocIds.join(","))

    return this.makeRequest(`/recap-query/?${searchParams}`)
  }

  /**
   * Get parties for a specific docket
   */
  async getParties(
    docketId: number,
    options: {
      filter_nested_results?: boolean
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<Party>> {
    const searchParams = new URLSearchParams()
    searchParams.append("docket", docketId.toString())

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/parties/?${searchParams}`)
  }

  /**
   * Get attorneys for a specific docket
   */
  async getAttorneys(
    docketId: number,
    options: {
      filter_nested_results?: boolean
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<Attorney>> {
    const searchParams = new URLSearchParams()
    searchParams.append("docket", docketId.toString())

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/attorneys/?${searchParams}`)
  }

  // COURT AND JUDGE APIs

  /**
   * Get all courts
   */
  async getCourts(
    options: {
      jurisdiction?: string
      in_use?: boolean
      order_by?: string
      page_size?: number
      fields?: string
    } = {},
  ): Promise<ApiResponse<Court>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/courts/?${searchParams}`)
  }

  /**
   * Get a specific court by ID
   */
  async getCourt(id: string): Promise<Court> {
    return this.makeRequest(`/courts/${id}/`)
  }

  /**
   * Get judges (people)
   */
  async getJudges(
    options: {
      name_first?: string
      name_last?: string
      date_dob__gte?: string
      date_dob__lte?: string
      gender?: string
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<Judge>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/people/?${searchParams}`)
  }

  /**
   * Get a specific judge by ID
   */
  async getJudge(id: number): Promise<Judge> {
    return this.makeRequest(`/people/${id}/`)
  }

  /**
   * Get judicial positions
   */
  async getPositions(
    options: {
      person?: number
      court?: string
      position_type?: string
      date_start__gte?: string
      date_start__lte?: string
      order_by?: string
      page_size?: number
      cursor?: string
      fields?: string
    } = {},
  ): Promise<ApiResponse<Position>> {
    const searchParams = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest(`/positions/?${searchParams}`)
  }

  // CITATION VALIDATION API

  /**
   * Validate citations in text using the Citation Lookup API
   */
  async validateCitations(text: string): Promise<CitationValidationResult[]> {
    if (text.length > 64000) {
      throw new Error("Text too long. Maximum 64,000 characters allowed.")
    }

    const response = await fetch(`${this.baseUrl}/citation-lookup/`, {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ text }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          `Rate limited. ${data.wait_until ? `Wait until: ${data.wait_until}` : "Please try again later."}`,
        )
      }
      throw new Error(`Citation validation failed: ${response.status} ${response.statusText}`)
    }

    const results = await response.json()
    return results.map(this.transformCitationResult)
  }

  /**
   * Validate a specific citation using volume/reporter/page
   */
  async validateSpecificCitation(volume: string, reporter: string, page: string): Promise<CitationValidationResult> {
    const response = await fetch(`${this.baseUrl}/citation-lookup/`, {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ volume, reporter, page }),
    })

    if (!response.ok) {
      throw new Error(`Citation validation failed: ${response.status} ${response.statusText}`)
    }

    const [result] = await response.json()
    return this.transformCitationResult(result)
  }

  private transformCitationResult(result: any): CitationValidationResult {
    return {
      citation: result.citation,
      normalizedCitations: result.normalized_citations,
      startIndex: result.start_index,
      endIndex: result.end_index,
      status: result.status,
      errorMessage: result.error_message,
      isValid: result.status === 200,
      isAmbiguous: result.status === 300,
      clusters: result.clusters || [],
      validationTimestamp: new Date().toISOString(),
    }
  }

  // UTILITY METHODS

  /**
   * Get count of items matching query without fetching data
   */
  async getCount(endpoint: string, filters: Record<string, any> = {}): Promise<number> {
    const searchParams = new URLSearchParams()
    searchParams.append("count", "on")

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const response = await this.makeRequest<{ count: number }>(`${endpoint}?${searchParams}`)
    return response.count
  }

  /**
   * Test API connection and authentication
   */
  async testConnection(): Promise<{
    status: "online" | "limited" | "offline"
    message: string
    hasApiKey: boolean
    endpoints: string[]
    rateLimit?: {
      limit: number
      remaining: number
      reset: string
    }
  }> {
    try {
      const apiInfo = await this.getApiRoot()
      const hasApiKey = !!this.apiKey

      // Test a simple search to verify functionality
      const testSearch = await this.searchOpinions({ q: "constitutional law", page_size: 1 })

      return {
        status: hasApiKey ? "online" : "limited",
        message: hasApiKey
          ? "Connected with full API access (5,000 queries/hour)"
          : "Connected with limited access (100 queries/day)",
        hasApiKey,
        endpoints: Object.keys(apiInfo).filter((key) => key.endsWith("_url")),
      }
    } catch (error) {
      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
        hasApiKey: !!this.apiKey,
        endpoints: [],
      }
    }
  }

  /**
   * Advanced search with multiple filters and smart field selection
   */
  async advancedSearch(params: {
    query?: string
    court?: string
    judge?: string
    dateRange?: { start: string; end: string }
    citationRange?: { min: number; max: number }
    precedentialStatus?: string
    documentType?: "opinions" | "dockets" | "recap"
    limit?: number
    fields?: string[]
  }): Promise<OpinionCluster[] | Docket[] | RecapDocument[]> {
    const searchOptions: SearchOptions = {
      q: params.query,
      court: params.court,
      judge: params.judge,
      page_size: params.limit || 20,
    }

    if (params.fields) {
      searchOptions.fields = params.fields.join(",")
    }

    if (params.dateRange) {
      searchOptions.filed_after = params.dateRange.start
      searchOptions.filed_before = params.dateRange.end
    }

    if (params.citationRange) {
      searchOptions.cited_gt = params.citationRange.min
      searchOptions.cited_lt = params.citationRange.max
    }

    switch (params.documentType) {
      case "dockets":
        searchOptions.type = "d"
        const docketResponse = await this.makeRequest<ApiResponse<Docket>>(
          `/search/?${new URLSearchParams(searchOptions as any)}`,
        )
        return docketResponse.results
      case "recap":
        searchOptions.type = "r"
        const recapResponse = await this.makeRequest<ApiResponse<RecapDocument>>(
          `/search/?${new URLSearchParams(searchOptions as any)}`,
        )
        return recapResponse.results
      default:
        searchOptions.type = "o"
        const opinionResponse = await this.searchOpinions(searchOptions)
        return opinionResponse.results
    }
  }

  /**
   * Get trending cases (most cited recent cases)
   */
  async getTrendingCases(days = 30, limit = 50): Promise<OpinionCluster[]> {
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    const response = await this.getOpinionClusters({
      date_filed__gte: dateThreshold.toISOString().split("T")[0],
      citation_count__gte: 1,
      order_by: "-citation_count",
      page_size: limit,
    })

    return response.results
  }

  /**
   * Search by case name with fuzzy matching
   */
  async searchByCaseName(caseName: string, exact = false): Promise<OpinionCluster[]> {
    const query = exact ? `case_name:"${caseName}"` : caseName
    const response = await this.searchOpinions({
      q: query,
      page_size: 10,
    })
    return response.results
  }

  /**
   * Get cases by specific court with date filtering
   */
  async getCasesByCourtId(
    courtId: string,
    options: {
      limit?: number
      dateRange?: { start: string; end: string }
      precedentialStatus?: string
    } = {},
  ): Promise<OpinionCluster[]> {
    const filters: any = {
      court: courtId,
      page_size: options.limit || 20,
      order_by: "-date_filed",
    }

    if (options.dateRange) {
      filters.date_filed__gte = options.dateRange.start
      filters.date_filed__lte = options.dateRange.end
    }

    if (options.precedentialStatus) {
      filters.precedential_status = options.precedentialStatus
    }

    const response = await this.getOpinionClusters(filters)
    return response.results
  }

  /**
   * Download and save legal documents to database
   */
  async searchAndDownload(query: string, options: any = {}): Promise<any[]> {
    try {
      const searchResults = await this.searchOpinions({
        q: query,
        page_size: options.limit || 10,
        fields: "id,case_name,court,date_filed,federal_cite_one,neutral_cite,absolute_url",
      })

      const downloadedDocuments = []

      for (const cluster of searchResults.results.slice(0, options.limit || 5)) {
        try {
          // Get full opinion details if needed
          const fullCluster = options.includeFullText ? await this.getOpinionCluster(cluster.id) : cluster

          const documentContent = await this.extractDocumentContent(fullCluster)
          const documentId = await this.saveToDatabase(documentContent)

          downloadedDocuments.push({
            sourceId: cluster.id.toString(),
            documentId,
            title: cluster.case_name,
            status: "downloaded",
          })
        } catch (error) {
          console.error(`Failed to download document ${cluster.case_name}:`, error)
          downloadedDocuments.push({
            sourceId: cluster.id.toString(),
            title: cluster.case_name,
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      return downloadedDocuments
    } catch (error) {
      console.error("CourtListener search and download error:", error)
      throw error
    }
  }

  private async extractDocumentContent(cluster: OpinionCluster) {
    // Get the main opinion text if available
    let content = cluster.syllabus || cluster.summary || cluster.headnotes || ""

    if (cluster.sub_opinions && cluster.sub_opinions.length > 0) {
      const mainOpinion = cluster.sub_opinions[0]
      if (mainOpinion.plain_text) {
        content = mainOpinion.plain_text
      } else if (mainOpinion.html) {
        // Strip HTML tags for plain text content
        content = mainOpinion.html.replace(/<[^>]*>/g, "")
      }
    }

    return {
      title: cluster.case_name,
      content,
      citation: cluster.federal_cite_one || cluster.neutral_cite || cluster.state_cite_one,
      court: cluster.court,
      date: cluster.date_filed,
      url: cluster.absolute_url,
      jurisdiction: "US",
      practiceArea: this.inferPracticeArea(cluster),
      documentType: "CASE_LAW",
      source: "COURT_LISTENER",
      metadata: {
        courtListenerId: cluster.id,
        precedentialStatus: cluster.precedential_status,
        citationCount: cluster.citation_count,
        docketNumber: cluster.docket,
        extractedAt: new Date().toISOString(),
        citations: cluster.citations,
        procedural_history: cluster.procedural_history,
        disposition: cluster.disposition,
        scdb_id: cluster.scdb_id,
        nature_of_suit: cluster.nature_of_suit,
        posture: cluster.posture,
      },
    }
  }

  private inferPracticeArea(cluster: OpinionCluster): string {
    const text = `${cluster.case_name} ${cluster.nature_of_suit || ""} ${cluster.syllabus || ""}`.toLowerCase()

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

  private async saveToDatabase(documentContent: any): Promise<string> {
    return await insertLegalDocument({
      title: documentContent.title,
      content: documentContent.content,
      documentTypeCode: documentContent.documentType,
      jurisdictionCode: documentContent.jurisdiction,
      practiceAreaCode: documentContent.practiceArea,
      source: documentContent.source,
      sourceUrl: documentContent.url,
      metadata: documentContent.metadata,
    })
  }
}

// Export a default instance
export const courtListenerAPI = new CourtListenerAPI()

// Export utility functions for PACER court ID mapping
export const PACER_COURT_MAPPING = {
  azb: "arb", // Arizona Bankruptcy Court
  cofc: "uscfc", // Court of Federal Claims
  neb: "nebraskab", // Nebraska Bankruptcy
  "nysb-mega": "nysb", // Do not use "mega"
} as const

export function normalizePacerDocId(docId: string): string {
  // Normalize fourth digit to zero as required by CourtListener
  if (docId.length >= 4) {
    return docId.substring(0, 3) + "0" + docId.substring(4)
  }
  return docId
}
