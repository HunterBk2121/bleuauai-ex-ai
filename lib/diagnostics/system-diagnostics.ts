/**
 * Comprehensive System Diagnostics
 * Tests all platform components and integrations
 */

import { createClient } from "@supabase/supabase-js"
import { llmService } from "@/lib/ai/llm-service"
import { embeddingService } from "@/lib/ai/embedding-service"
import { strategicDossierService } from "@/lib/services/strategic-dossier"
import { contractDraftingService } from "@/lib/services/contract-drafting"
import { discoveryEngineService } from "@/lib/services/discovery-engine"
import { creditBillingService } from "@/lib/services/credit-billing"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface DiagnosticResult {
  component: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
  timestamp: string
}

export interface SystemHealth {
  overall: "healthy" | "degraded" | "critical"
  results: DiagnosticResult[]
  summary: {
    passed: number
    failed: number
    warnings: number
    total: number
  }
}

export class SystemDiagnostics {
  private results: DiagnosticResult[] = []

  private addResult(component: string, status: "pass" | "fail" | "warning", message: string, details?: any) {
    this.results.push({
      component,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Run comprehensive system diagnostics
   */
  async runFullDiagnostics(): Promise<SystemHealth> {
    this.results = []

    console.log("🔍 Starting comprehensive system diagnostics...")

    // Core Infrastructure
    await this.testDatabaseConnection()
    await this.testSupabaseIntegration()
    await this.testBlobStorage()

    // AI Services
    await this.testLLMService()
    await this.testEmbeddingService()

    // Core Features
    await this.testStrategicDossier()
    await this.testContractDrafting()
    await this.testDiscoveryEngine()
    await this.testCreditBilling()

    // Legal Sources
    await this.testCourtListenerAPI()
    await this.testLegalSources()

    // Authentication & Security
    await this.testAuthentication()
    await this.testSecurity()

    // Performance & Monitoring
    await this.testPerformance()

    const summary = this.calculateSummary()
    const overall = this.determineOverallHealth(summary)

    return {
      overall,
      results: this.results,
      summary,
    }
  }

  /**
   * Test database connection and basic operations
   */
  private async testDatabaseConnection(): Promise<void> {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Test basic connection
      const { data, error } = await supabase.from("documents").select("count").limit(1)

      if (error) {
        this.addResult("Database Connection", "fail", `Database connection failed: ${error.message}`, error)
        return
      }

      this.addResult("Database Connection", "pass", "Database connection successful")

      // Test table existence
      const tables = [
        "documents",
        "legal_sources",
        "user_credits",
        "credit_transactions",
        "case_intakes",
        "strategic_dossiers",
        "contract_drafts",
        "clause_library",
        "discovery_initiatives",
        "discovery_documents",
      ]

      for (const table of tables) {
        try {
          const { error: tableError } = await supabase.from(table).select("*").limit(1)
          if (tableError) {
            this.addResult(
              `Table: ${table}`,
              "warning",
              `Table ${table} may not exist or has issues: ${tableError.message}`,
            )
          } else {
            this.addResult(`Table: ${table}`, "pass", `Table ${table} accessible`)
          }
        } catch (err) {
          this.addResult(`Table: ${table}`, "fail", `Table ${table} test failed: ${err}`)
        }
      }
    } catch (error) {
      this.addResult("Database Connection", "fail", `Database test failed: ${error}`, error)
    }
  }

  /**
   * Test Supabase integration features
   */
  private async testSupabaseIntegration(): Promise<void> {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Test RLS policies
      const { data: authData, error: authError } = await supabase.auth.getSession()
      this.addResult("Supabase Auth", authError ? "warning" : "pass", "Supabase auth service accessible")

      // Test storage
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
      if (storageError) {
        this.addResult("Supabase Storage", "warning", `Storage test warning: ${storageError.message}`)
      } else {
        this.addResult("Supabase Storage", "pass", `Found ${buckets?.length || 0} storage buckets`)
      }
    } catch (error) {
      this.addResult("Supabase Integration", "fail", `Supabase integration test failed: ${error}`)
    }
  }

  /**
   * Test Blob storage
   */
  private async testBlobStorage(): Promise<void> {
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        this.addResult("Blob Storage", "warning", "Blob storage token not configured")
        return
      }

      // Test blob storage connection
      const response = await fetch("/api/blob/test")
      if (response.ok) {
        this.addResult("Blob Storage", "pass", "Blob storage accessible")
      } else {
        this.addResult("Blob Storage", "warning", "Blob storage test returned non-200 status")
      }
    } catch (error) {
      this.addResult("Blob Storage", "fail", `Blob storage test failed: ${error}`)
    }
  }

  /**
   * Test LLM service
   */
  private async testLLMService(): Promise<void> {
    try {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        this.addResult("LLM Service", "fail", "Google AI API key not configured")
        return
      }

      const response = await llmService.generateText({
        messages: [{ role: "user", content: "Test message for diagnostics. Respond with 'OK'." }],
        temperature: 0.1,
        maxTokens: 10,
      })

      if (response.text.toLowerCase().includes("ok")) {
        this.addResult("LLM Service", "pass", "LLM service responding correctly")
      } else {
        this.addResult("LLM Service", "warning", "LLM service responding but unexpected output")
      }
    } catch (error) {
      this.addResult("LLM Service", "fail", `LLM service test failed: ${error}`)
    }
  }

  /**
   * Test embedding service
   */
  private async testEmbeddingService(): Promise<void> {
    try {
      const embedding = await embeddingService.generateEmbedding("test text for embedding")

      if (Array.isArray(embedding) && embedding.length > 0) {
        this.addResult("Embedding Service", "pass", `Embedding service working (${embedding.length} dimensions)`)
      } else {
        this.addResult("Embedding Service", "fail", "Embedding service returned invalid result")
      }
    } catch (error) {
      this.addResult("Embedding Service", "fail", `Embedding service test failed: ${error}`)
    }
  }

  /**
   * Test Strategic Dossier service
   */
  private async testStrategicDossier(): Promise<void> {
    try {
      // Test case intake creation
      const testIntake = {
        matterId: "test-matter-diagnostics",
        title: "Diagnostic Test Case",
        factPattern: "This is a test case for diagnostic purposes.",
        parties: ["Test Party 1", "Test Party 2"],
        jurisdiction: "Test Jurisdiction",
        practiceArea: "Test Practice",
        causeOfAction: ["Test Cause"],
      }

      const intakeResult = await strategicDossierService.createCaseIntake(testIntake)

      if (intakeResult.intake && intakeResult.clarifyingQuestions) {
        this.addResult("Strategic Dossier", "pass", "Strategic Dossier service functional")

        // Clean up test data
        try {
          const supabase = createClient(supabaseUrl, supabaseKey)
          await supabase.from("case_intakes").delete().eq("matter_id", "test-matter-diagnostics")
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      } else {
        this.addResult("Strategic Dossier", "warning", "Strategic Dossier service partial functionality")
      }
    } catch (error) {
      this.addResult("Strategic Dossier", "fail", `Strategic Dossier test failed: ${error}`)
    }
  }

  /**
   * Test Contract Drafting service
   */
  private async testContractDrafting(): Promise<void> {
    try {
      // Test clause library search
      const clauses = await contractDraftingService.searchClauseLibrary("test", {
        contractType: "Service Agreement",
        industry: "Software",
      })

      this.addResult("Contract Drafting", "pass", `Contract Drafting service functional (${clauses.length} clauses)`)
    } catch (error) {
      this.addResult("Contract Drafting", "fail", `Contract Drafting test failed: ${error}`)
    }
  }

  /**
   * Test Discovery Engine service
   */
  private async testDiscoveryEngine(): Promise<void> {
    try {
      // Test discovery initiative creation
      const testInitiative = {
        name: "Diagnostic Test Initiative",
        description: "Test initiative for diagnostics",
        status: "planning" as const,
        custodians: [],
        dateRange: {
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        },
        searchTerms: ["test"],
        fileTypes: ["pdf"],
        dataSources: ["email"],
        estimatedCost: 1000,
      }

      const initiative = await discoveryEngineService.createDiscoveryInitiative("test-matter", testInitiative)

      if (initiative.id) {
        this.addResult("Discovery Engine", "pass", "Discovery Engine service functional")

        // Clean up test data
        try {
          const supabase = createClient(supabaseUrl, supabaseKey)
          await supabase.from("discovery_initiatives").delete().eq("id", initiative.id)
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      } else {
        this.addResult("Discovery Engine", "warning", "Discovery Engine service partial functionality")
      }
    } catch (error) {
      this.addResult("Discovery Engine", "fail", `Discovery Engine test failed: ${error}`)
    }
  }

  /**
   * Test Credit Billing service
   */
  private async testCreditBilling(): Promise<void> {
    try {
      // Test user credits initialization
      const testUserId = "test-user-diagnostics"
      const userCredits = await creditBillingService.initializeUserCredits(testUserId, "free")

      if (userCredits.userId === testUserId) {
        this.addResult("Credit Billing", "pass", "Credit Billing service functional")

        // Test credit consumption
        const consumeResult = await creditBillingService.consumeCredits(testUserId, "ai_chat", "general", 1, {
          test: true,
        })

        if (consumeResult.success) {
          this.addResult("Credit Consumption", "pass", "Credit consumption working")
        } else {
          this.addResult("Credit Consumption", "warning", "Credit consumption issues")
        }

        // Clean up test data
        try {
          const supabase = createClient(supabaseUrl, supabaseKey)
          await supabase.from("user_credits").delete().eq("user_id", testUserId)
          await supabase.from("credit_transactions").delete().eq("user_id", testUserId)
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      } else {
        this.addResult("Credit Billing", "warning", "Credit Billing service partial functionality")
      }
    } catch (error) {
      this.addResult("Credit Billing", "fail", `Credit Billing test failed: ${error}`)
    }
  }

  /**
   * Test Court Listener API
   */
  private async testCourtListenerAPI(): Promise<void> {
    try {
      const response = await fetch("/api/legal-sources/court-listener?action=status")
      const data = await response.json()

      if (response.ok && data.success) {
        this.addResult("Court Listener API", "pass", "Court Listener API accessible")
      } else {
        this.addResult("Court Listener API", "warning", "Court Listener API issues")
      }
    } catch (error) {
      this.addResult("Court Listener API", "fail", `Court Listener API test failed: ${error}`)
    }
  }

  /**
   * Test Legal Sources integration
   */
  private async testLegalSources(): Promise<void> {
    try {
      const response = await fetch("/api/legal-sources/status")
      const data = await response.json()

      if (response.ok) {
        this.addResult(
          "Legal Sources",
          "pass",
          `Legal Sources integration working (${data.sources?.length || 0} sources)`,
        )
      } else {
        this.addResult("Legal Sources", "warning", "Legal Sources integration issues")
      }
    } catch (error) {
      this.addResult("Legal Sources", "fail", `Legal Sources test failed: ${error}`)
    }
  }

  /**
   * Test Authentication system
   */
  private async testAuthentication(): Promise<void> {
    try {
      // Test auth configuration
      if (!process.env.NEXTAUTH_SECRET) {
        this.addResult("Authentication", "warning", "NextAuth secret not configured")
        return
      }

      this.addResult("Authentication", "pass", "Authentication configuration present")
    } catch (error) {
      this.addResult("Authentication", "fail", `Authentication test failed: ${error}`)
    }
  }

  /**
   * Test Security systems
   */
  private async testSecurity(): Promise<void> {
    try {
      // Test environment variables for security
      const securityVars = ["NEXTAUTH_SECRET", "SUPABASE_SERVICE_ROLE_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"]

      let missingVars = 0
      for (const varName of securityVars) {
        if (!process.env[varName]) {
          missingVars++
        }
      }

      if (missingVars === 0) {
        this.addResult("Security Configuration", "pass", "All critical security variables configured")
      } else {
        this.addResult("Security Configuration", "warning", `${missingVars} critical security variables missing`)
      }
    } catch (error) {
      this.addResult("Security Configuration", "fail", `Security test failed: ${error}`)
    }
  }

  /**
   * Test Performance monitoring
   */
  private async testPerformance(): Promise<void> {
    try {
      const startTime = Date.now()

      // Test database query performance
      const supabase = createClient(supabaseUrl, supabaseKey)
      await supabase.from("documents").select("id").limit(1)

      const dbTime = Date.now() - startTime

      if (dbTime < 1000) {
        this.addResult("Database Performance", "pass", `Database query time: ${dbTime}ms`)
      } else if (dbTime < 3000) {
        this.addResult("Database Performance", "warning", `Database query time: ${dbTime}ms (slow)`)
      } else {
        this.addResult("Database Performance", "fail", `Database query time: ${dbTime}ms (very slow)`)
      }
    } catch (error) {
      this.addResult("Performance", "fail", `Performance test failed: ${error}`)
    }
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary() {
    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const warnings = this.results.filter((r) => r.status === "warning").length

    return {
      passed,
      failed,
      warnings,
      total: this.results.length,
    }
  }

  /**
   * Determine overall system health
   */
  private determineOverallHealth(summary: { passed: number; failed: number; warnings: number; total: number }) {
    const failureRate = summary.failed / summary.total
    const warningRate = summary.warnings / summary.total

    if (failureRate > 0.3) return "critical"
    if (failureRate > 0.1 || warningRate > 0.5) return "degraded"
    return "healthy"
  }
}

export const systemDiagnostics = new SystemDiagnostics()
