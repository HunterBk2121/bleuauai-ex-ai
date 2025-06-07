import { type NextRequest, NextResponse } from "next/server"
import { createGitHubService } from "@/lib/integrations/github"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = (searchParams.get("state") as "open" | "closed" | "all") || "open"
    const owner = searchParams.get("owner") || process.env.GITHUB_OWNER || ""
    const repo = searchParams.get("repo") || process.env.GITHUB_REPO || ""

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ success: false, error: "GitHub token not configured" }, { status: 400 })
    }

    const github = createGitHubService(process.env.GITHUB_TOKEN, owner, repo)
    return NextResponse.json(await github.listIssues(state))
  } catch (error) {
    console.error("GitHub issues API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { owner, repo, ...issueData } = body

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ success: false, error: "GitHub token not configured" }, { status: 400 })
    }

    const github = createGitHubService(
      process.env.GITHUB_TOKEN,
      owner || process.env.GITHUB_OWNER || "",
      repo || process.env.GITHUB_REPO || "",
    )

    return NextResponse.json(await github.createIssue(issueData))
  } catch (error) {
    console.error("GitHub create issue API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
