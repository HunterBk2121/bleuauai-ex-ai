import { NextResponse } from "next/server"
import { contractDraftingService } from "@/lib/services/contract-drafting"
import { creditBillingService } from "@/lib/services/credit-billing"

export async function POST(request: Request) {
  try {
    const { userId, ...draftingRequest } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    // Estimate pages (500 words per page)
    const estimatedPages = Math.max(1, Math.ceil((draftingRequest.factsAndGuidance?.length || 500) / 500))

    // Check and consume credits
    const creditResult = await creditBillingService.consumeCredits(
      userId,
      "draft_contract",
      "contract_drafting",
      estimatedPages,
      { contractType: draftingRequest.contractType, pages: estimatedPages },
    )

    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: creditResult.error,
          remainingCredits: creditResult.remainingCredits,
        },
        { status: 402 },
      )
    }

    // Generate contract draft
    const draft = await contractDraftingService.generateContractDraft(draftingRequest)

    return NextResponse.json({
      success: true,
      draft,
      remainingCredits: creditResult.remainingCredits,
    })
  } catch (error) {
    console.error("Error generating contract draft:", error)
    return NextResponse.json({ error: "Failed to generate contract draft" }, { status: 500 })
  }
}
