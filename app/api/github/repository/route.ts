import { type NextRequest, NextResponse } from "next/server"
import { createGitHubService } from "@/lib/integrations/github"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const owner = searchParams.get("owner") || process.env.GITHUB_OWNER || ""
    const repo = searchParams.get("repo") || process.env.GITHUB_REPO || ""

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ success: false, error: "GitHub token not configured" }, { status: 400 })
    }

    const github = createGitHubService(process.env.GITHUB_TOKEN, owner, repo)

    switch (action) {
      case "info":
        return NextResponse.json(await github.getRepository())

      case "contents":
        const path = searchParams.get("path") || ""
        return NextResponse.json(await github.getContents(path))

      case "branches":
        return NextResponse.json(await github.listBranches())

      case "commits":
        const branch = searchParams.get("branch")
        const filePath = searchParams.get("filePath")
        return NextResponse.json(await github.getCommits(branch || undefined, filePath || undefined))

      case "stats":
        return NextResponse.json(await github.getRepositoryStats())

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("GitHub repository API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, owner, repo, ...data } = body

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ success: false, error: "GitHub token not configured" }, { status: 400 })
    }

    const github = createGitHubService(
      process.env.GITHUB_TOKEN,
      owner || process.env.GITHUB_OWNER || "",
      repo || process.env.GITHUB_REPO || "",
    )

    switch (action) {
      case "create":
        return NextResponse.json(await github.createRepository(data))

      case "createFile":
        return NextResponse.json(await github.createOrUpdateFile(data))

      case "updateFile":
        return NextResponse.json(await github.createOrUpdateFile(data))

      case "deleteFile":
        return NextResponse.json(await github.deleteFile(data.path, data.message, data.sha, data.branch))

      case "createBranch":
        return NextResponse.json(await github.createBranch(data.branchName, data.fromBranch))

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("GitHub repository API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
