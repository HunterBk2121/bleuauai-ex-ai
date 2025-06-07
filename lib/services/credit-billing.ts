/**
 * Transparent Credit & Billing System
 * Manages credit-based usage and subscription billing
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface CreditRate {
  action: string
  module: string
  credits: number
  description: string
  unit: string // e.g., "per page", "per query", "per document"
}

export interface CreditTransaction {
  id: string
  userId: string
  action: string
  module: string
  credits: number
  description: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface UserCredits {
  userId: string
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  subscriptionTier: "free" | "professional" | "enterprise"
  monthlyAllocation: number
  resetDate: string
  lastUpdated: string
}

export interface SubscriptionTier {
  id: string
  name: string
  monthlyCredits: number
  price: number
  features: string[]
  stripePriceId?: string
}

export class CreditBillingService {
  // Credit rates for different actions
  private static readonly CREDIT_RATES: CreditRate[] = [
    // Strategic Dossier
    {
      action: "quick_answer",
      module: "strategic_dossier",
      credits: 100,
      description: "Quick legal research answer",
      unit: "per query",
    },
    {
      action: "begin_normal_flow",
      module: "strategic_dossier",
      credits: 150,
      description: "Begin comprehensive analysis",
      unit: "per case",
    },
    {
      action: "complete_normal_flow",
      module: "strategic_dossier",
      credits: 50,
      description: "Complete analysis workflow",
      unit: "per completion",
    },
    {
      action: "follow_up_response",
      module: "strategic_dossier",
      credits: 50,
      description: "Follow-up questions and responses",
      unit: "per response",
    },
    {
      action: "generate_memo",
      module: "strategic_dossier",
      credits: 50,
      description: "Generate and download memo",
      unit: "per memo",
    },

    // Contract Drafting
    {
      action: "draft_contract",
      module: "contract_drafting",
      credits: 4,
      description: "Draft contract content",
      unit: "per page (500 words)",
    },
    {
      action: "contract_comparison",
      module: "contract_negotiation",
      credits: 3,
      description: "Initial contract comparison",
      unit: "per page (500 words)",
    },
    {
      action: "follow_up_provision",
      module: "contract_negotiation",
      credits: 5,
      description: "Follow-up responses per provision",
      unit: "per provision (200 words)",
    },
    {
      action: "review_contract_terms",
      module: "contract_negotiation",
      credits: 5,
      description: "Review contract terms",
      unit: "per page uploaded",
    },

    // Discovery & Deposition
    {
      action: "process_discovery_document",
      module: "discovery",
      credits: 2,
      description: "Process and analyze document",
      unit: "per document",
    },
    {
      action: "analyze_deposition",
      module: "discovery",
      credits: 25,
      description: "Analyze deposition transcript",
      unit: "per transcript",
    },
    {
      action: "generate_privilege_log",
      module: "discovery",
      credits: 10,
      description: "Generate privilege log",
      unit: "per initiative",
    },

    // Word Add-in
    {
      action: "proofreading",
      module: "word_addin",
      credits: 6,
      description: "AI-powered proofreading",
      unit: "per 500 words uploaded",
    },
    {
      action: "proofreading_followup",
      module: "word_addin",
      credits: 2,
      description: "Proofreading follow-up message",
      unit: "per message",
    },

    // General AI Services
    { action: "ai_chat", module: "general", credits: 5, description: "AI chat interaction", unit: "per message" },
    {
      action: "document_analysis",
      module: "general",
      credits: 10,
      description: "Document analysis",
      unit: "per document",
    },
    {
      action: "citation_validation",
      module: "general",
      credits: 3,
      description: "Citation validation",
      unit: "per citation",
    },
  ]

  private static readonly SUBSCRIPTION_TIERS: SubscriptionTier[] = [
    {
      id: "free",
      name: "Free Trial",
      monthlyCredits: 500,
      price: 0,
      features: ["Basic AI features", "Limited document processing", "Email support"],
    },
    {
      id: "professional",
      name: "Professional",
      monthlyCredits: 5000,
      price: 99,
      features: ["Full AI suite", "Unlimited document processing", "Priority support", "Advanced analytics"],
      stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      monthlyCredits: 25000,
      price: 499,
      features: ["Everything in Professional", "Team collaboration", "Custom integrations", "Dedicated support"],
      stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    },
  ]

  /**
   * Get credit rate for an action
   */
  static getCreditRate(action: string, module: string): CreditRate | null {
    return this.CREDIT_RATES.find((rate) => rate.action === action && rate.module === module) || null
  }

  /**
   * Get all credit rates
   */
  static getAllCreditRates(): CreditRate[] {
    return this.CREDIT_RATES
  }

  /**
   * Get subscription tiers
   */
  static getSubscriptionTiers(): SubscriptionTier[] {
    return this.SUBSCRIPTION_TIERS
  }

  /**
   * Initialize user credits
   */
  async initializeUserCredits(userId: string, tier = "free"): Promise<UserCredits> {
    try {
      const subscriptionTier =
        CreditBillingService.SUBSCRIPTION_TIERS.find((t) => t.id === tier) || CreditBillingService.SUBSCRIPTION_TIERS[0]

      const userCredits: UserCredits = {
        userId,
        totalCredits: subscriptionTier.monthlyCredits,
        usedCredits: 0,
        remainingCredits: subscriptionTier.monthlyCredits,
        subscriptionTier: tier as any,
        monthlyAllocation: subscriptionTier.monthlyCredits,
        resetDate: this.getNextResetDate(),
        lastUpdated: new Date().toISOString(),
      }

      const { error } = await supabase.from("user_credits").upsert({
        user_id: userId,
        total_credits: userCredits.totalCredits,
        used_credits: userCredits.usedCredits,
        remaining_credits: userCredits.remainingCredits,
        subscription_tier: userCredits.subscriptionTier,
        monthly_allocation: userCredits.monthlyAllocation,
        reset_date: userCredits.resetDate,
        last_updated: userCredits.lastUpdated,
      })

      if (error) throw error
      return userCredits
    } catch (error) {
      console.error("Error initializing user credits:", error)
      throw error
    }
  }

  /**
   * Get user credits
   */
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    try {
      const { data, error } = await supabase.from("user_credits").select("*").eq("user_id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          // User not found, initialize with free tier
          return await this.initializeUserCredits(userId, "free")
        }
        throw error
      }

      return {
        userId: data.user_id,
        totalCredits: data.total_credits,
        usedCredits: data.used_credits,
        remainingCredits: data.remaining_credits,
        subscriptionTier: data.subscription_tier,
        monthlyAllocation: data.monthly_allocation,
        resetDate: data.reset_date,
        lastUpdated: data.last_updated,
      }
    } catch (error) {
      console.error("Error fetching user credits:", error)
      return null
    }
  }

  /**
   * Consume credits for an action
   */
  async consumeCredits(
    userId: string,
    action: string,
    module: string,
    quantity = 1,
    metadata?: Record<string, any>,
  ): Promise<{
    success: boolean
    remainingCredits: number
    transaction?: CreditTransaction
    error?: string
  }> {
    try {
      const creditRate = CreditBillingService.getCreditRate(action, module)
      if (!creditRate) {
        return { success: false, remainingCredits: 0, error: "Invalid action or module" }
      }

      const creditsNeeded = creditRate.credits * quantity
      const userCredits = await this.getUserCredits(userId)

      if (!userCredits) {
        return { success: false, remainingCredits: 0, error: "User credits not found" }
      }

      if (userCredits.remainingCredits < creditsNeeded) {
        return {
          success: false,
          remainingCredits: userCredits.remainingCredits,
          error: "Insufficient credits",
        }
      }

      // Create transaction record
      const transaction: CreditTransaction = {
        id: crypto.randomUUID(),
        userId,
        action,
        module,
        credits: creditsNeeded,
        description: `${creditRate.description} (${quantity} ${creditRate.unit})`,
        metadata,
        createdAt: new Date().toISOString(),
      }

      // Update user credits and create transaction in a single operation
      const { error: transactionError } = await supabase.from("credit_transactions").insert({
        id: transaction.id,
        user_id: transaction.userId,
        action: transaction.action,
        module: transaction.module,
        credits: transaction.credits,
        description: transaction.description,
        metadata: transaction.metadata,
        created_at: transaction.createdAt,
      })

      if (transactionError) throw transactionError

      const newUsedCredits = userCredits.usedCredits + creditsNeeded
      const newRemainingCredits = userCredits.totalCredits - newUsedCredits

      const { error: updateError } = await supabase
        .from("user_credits")
        .update({
          used_credits: newUsedCredits,
          remaining_credits: newRemainingCredits,
          last_updated: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) throw updateError

      return {
        success: true,
        remainingCredits: newRemainingCredits,
        transaction,
      }
    } catch (error) {
      console.error("Error consuming credits:", error)
      return { success: false, remainingCredits: 0, error: "Failed to consume credits" }
    }
  }

  /**
   * Get credit transaction history
   */
  async getCreditTransactions(userId: string, limit = 50, offset = 0): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        module: row.module,
        credits: row.credits,
        description: row.description,
        metadata: row.metadata,
        createdAt: row.created_at,
      }))
    } catch (error) {
      console.error("Error fetching credit transactions:", error)
      return []
    }
  }

  /**
   * Reset monthly credits
   */
  async resetMonthlyCredits(userId: string): Promise<void> {
    try {
      const userCredits = await this.getUserCredits(userId)
      if (!userCredits) return

      await supabase
        .from("user_credits")
        .update({
          used_credits: 0,
          remaining_credits: userCredits.monthlyAllocation,
          reset_date: this.getNextResetDate(),
          last_updated: new Date().toISOString(),
        })
        .eq("user_id", userId)
    } catch (error) {
      console.error("Error resetting monthly credits:", error)
    }
  }

  /**
   * Update subscription tier
   */
  async updateSubscriptionTier(userId: string, newTier: string): Promise<void> {
    try {
      const tier = CreditBillingService.SUBSCRIPTION_TIERS.find((t) => t.id === newTier)
      if (!tier) throw new Error("Invalid subscription tier")

      await supabase
        .from("user_credits")
        .update({
          subscription_tier: newTier,
          monthly_allocation: tier.monthlyCredits,
          total_credits: tier.monthlyCredits,
          remaining_credits: tier.monthlyCredits,
          used_credits: 0,
          reset_date: this.getNextResetDate(),
          last_updated: new Date().toISOString(),
        })
        .eq("user_id", userId)
    } catch (error) {
      console.error("Error updating subscription tier:", error)
      throw error
    }
  }

  /**
   * Get next reset date (first day of next month)
   */
  private getNextResetDate(): string {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toISOString()
  }

  /**
   * Check if credits need to be reset
   */
  async checkAndResetCredits(userId: string): Promise<void> {
    try {
      const userCredits = await this.getUserCredits(userId)
      if (!userCredits) return

      const resetDate = new Date(userCredits.resetDate)
      const now = new Date()

      if (now >= resetDate) {
        await this.resetMonthlyCredits(userId)
      }
    } catch (error) {
      console.error("Error checking credit reset:", error)
    }
  }
}

export const creditBillingService = new CreditBillingService()
