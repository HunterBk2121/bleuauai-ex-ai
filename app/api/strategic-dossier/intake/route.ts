import { NextResponse } from "next/server"
import { strategicDossierService } from "@/lib/services/strategic-dossier"
import { creditBillingService } from "@/lib/services/credit-billing"

export async function POST(request: Request) {
  try {
    const { userId, matterId, ...intakeData } = await request.json()

    if (!userId || !matterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check and consume credits
    const creditResult = await creditBillingService.consumeCredits(
      userId,
      "begin_normal_flow",
      "strategic_dossier",
      1,
      { matterId, action: "case_intake" },
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

    // Create case intake
    const result = await strategicDossierService.createCaseIntake({
      matterId,
      ...intakeData,
    })

    return NextResponse.json({
      success: true,
      ...result,
      remainingCredits: creditResult.remainingCredits,
    })
  } catch (error) {
    console.error("Error creating case intake:", error)
    return NextResponse.json({ error: "Failed to create case intake" }, { status: 500 })
  }
}
