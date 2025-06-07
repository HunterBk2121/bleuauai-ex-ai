import { NextResponse } from "next/server"
import { discoveryEngineService } from "@/lib/services/discovery-engine"
import { creditBillingService } from "@/lib/services/credit-billing"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const userId = formData.get("userId") as string
    const initiativeId = formData.get("initiativeId") as string
    const files = formData.getAll("documents") as File[]

    if (!userId || !initiativeId || files.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check and consume credits for document processing
    const creditResult = await creditBillingService.consumeCredits(
      userId,
      "process_discovery_document",
      "discovery",
      files.length,
      { initiativeId, documentCount: files.length },
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

    // Process documents
    const result = await discoveryEngineService.processDiscoveryDocuments(initiativeId, files)

    return NextResponse.json({
      success: true,
      ...result,
      remainingCredits: creditResult.remainingCredits,
    })
  } catch (error) {
    console.error("Error processing discovery documents:", error)
    return NextResponse.json({ error: "Failed to process documents" }, { status: 500 })
  }
}
