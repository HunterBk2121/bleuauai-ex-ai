/**
 * Common types for legal sources
 */

export interface LegalCase {
  id: string
  title: string
  citation: string
  court: string
  date: string
  snippet?: string
  url?: string
  source: string
  fullText?: string
  metadata?: Record<string, any>
}

export interface SearchParams {
  q?: string
  query?: string
  page?: number
  limit?: number
  page_size?: number
  jurisdiction?: string
  court?: string
  judge?: string
  date_start?: string
  date_end?: string
  citation?: string
  [key: string]: any
}

export interface SearchResponse {
  results: LegalCase[]
  total?: number
  count?: number
  next?: string | null
  previous?: string | null
  page?: number
  totalPages?: number
}

export interface LegalSourceStatus {
  status: "online" | "limited" | "offline" | "blocked"
  message: string
  hasApiKey?: boolean
}

export interface Citation {
  reporter: string
  volume: number
  page: number
}

export interface CitationValidation {
  valid: boolean
  source?: string
  url?: string
  error?: string
}

export interface Court {
  id: string
  name: string
  jurisdiction: string
  level: string
}

export interface Judge {
  id: string
  name: string
  court: string
  position: string
  appointed: string
}
