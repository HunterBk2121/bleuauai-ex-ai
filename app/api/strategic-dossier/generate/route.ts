import { NextResponse } from "next/server"
import { strategicDossierService } from "@/lib/services/strategic-dossier"
import { creditBillingService } from "@/lib/services/credit-billing"

export async function POST(request: Request) {
  try {
    const { userId, intakeId } = await request.json()

    if (!userId || !intakeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check and consume credits
    const creditResult = await creditBillingService.consumeCredits(
      userId,
      "complete_normal_flow",
      "strategic_dossier",
      1,
      { intakeId, action: "generate_dossier" },
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

    // Generate strategic dossier
    const dossier = await strategicDossierService.generateStrategicDossier(intakeId)

    return NextResponse.json({
      success: true,
      dossier,
      remainingCredits: creditResult.remainingCredits,
    })
  } catch (error) {
    console.error("Error generating strategic dossier:", error)
    return NextResponse.json({ error: "Failed to generate strategic dossier" }, { status: 500 })
  }
}
