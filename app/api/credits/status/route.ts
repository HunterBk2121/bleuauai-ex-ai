import { NextResponse } from "next/server"
import { creditBillingService } from "@/lib/services/credit-billing"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    // Check if credits need to be reset
    await creditBillingService.checkAndResetCredits(userId)

    // Get current credit status
    const userCredits = await creditBillingService.getUserCredits(userId)

    if (!userCredits) {
      return NextResponse.json({ error: "User credits not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      credits: userCredits,
      rates: creditBillingService.getAllCreditRates(),
      subscriptionTiers: creditBillingService.getSubscriptionTiers(),
    })
  } catch (error) {
    console.error("Error fetching credit status:", error)
    return NextResponse.json({ error: "Failed to fetch credit status" }, { status: 500 })
  }
}
