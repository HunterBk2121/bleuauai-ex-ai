import { NextResponse } from "next/server"
import { discoveryEngineService } from "@/lib/services/discovery-engine"

export async function POST(request: Request) {
  try {
    const { matterId, ...initiativeData } = await request.json()

    if (!matterId) {
      return NextResponse.json({ error: "Missing matter ID" }, { status: 400 })
    }

    const initiative = await discoveryEngineService.createDiscoveryInitiative(matterId, initiativeData)

    return NextResponse.json({
      success: true,
      initiative,
    })
  } catch (error) {
    console.error("Error creating discovery initiative:", error)
    return NextResponse.json({ error: "Failed to create discovery initiative" }, { status: 500 })
  }
}
