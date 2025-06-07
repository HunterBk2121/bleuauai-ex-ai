"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Bug,
  Plus,
  RefreshCw,
  FileText,
  Users,
  Star,
  Eye,
  AlertCircle,
  Code,
} from "lucide-react"

interface GitHubRepository {
  name: string
  description: string
  private: boolean
  html_url: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  language: string
  created_at: string
  updated_at: string
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string
  state: string
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  labels: Array<{
    name: string
    color: string
  }>
}

interface GitHubPullRequest {
  id: number
  number: number
  title: string
  body: string
  state: string
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  head: {
    ref: string
  }
  base: {
    ref: string
  }
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
  }
}

export default function GitHubDashboard() {
  const [repository, setRepository] = useState<GitHubRepository | null>(null)
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([])
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [newIssue, setNewIssue] = useState({
    title: "",
    body: "",
    labels: "",
  })
  const [newPR, setNewPR] = useState({
    title: "",
    body: "",
    head: "",
    base: "main",
  })

  const fetchRepositoryInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/github/repository?action=info")
      const result = await response.json()

      if (result.success) {
        setRepository(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to fetch repository information")
    } finally {
      setLoading(false)
    }
  }

  const fetchIssues = async () => {
    try {
      const response = await fetch("/api/github/issues")
      const result = await response.json()

      if (result.success) {
        setIssues(result.data)
      }
    } catch (err) {
      console.error("Failed to fetch issues:", err)
    }
  }

  const fetchPullRequests = async () => {
    try {
      const response = await fetch("/api/github/pull-requests")
      const result = await response.json()

      if (result.success) {
        setPullRequests(result.data)
      }
    } catch (err) {
      console.error("Failed to fetch pull requests:", err)
    }
  }

  const fetchCommits = async () => {
    try {
      const response = await fetch("/api/github/repository?action=commits")
      const result = await response.json()

      if (result.success) {
        setCommits(result.data.slice(0, 10)) // Show last 10 commits
      }
    } catch (err) {
      console.error("Failed to fetch commits:", err)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/github/repository?action=branches")
      const result = await response.json()

      if (result.success) {
        setBranches(result.data)
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err)
    }
  }

  const createIssue = async () => {
    try {
      const response = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newIssue.title,
          body: newIssue.body,
          labels: newIssue.labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setNewIssue({ title: "", body: "", labels: "" })
        fetchIssues()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to create issue")
    }
  }

  const createPullRequest = async () => {
    try {
      const response = await fetch("/api/github/pull-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPR),
      })

      const result = await response.json()

      if (result.success) {
        setNewPR({ title: "", body: "", head: "", base: "main" })
        fetchPullRequests()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to create pull request")
    }
  }

  const refreshAll = async () => {
    await Promise.all([fetchRepositoryInfo(), fetchIssues(), fetchPullRequests(), fetchCommits(), fetchBranches()])
  }

  useEffect(() => {
    refreshAll()
  }, [])

  const getStateColor = (state: string) => {
    switch (state) {
      case "open":
        return "bg-green-500"
      case "closed":
        return "bg-red-500"
      case "merged":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GitHub Integration</h1>
          <p className="text-muted-foreground">Manage your legal documents repository and collaborate with your team</p>
        </div>
        <Button onClick={refreshAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {repository && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {repository.name}
              {repository.private && <Badge variant="secondary">Private</Badge>}
            </CardTitle>
            <CardDescription>{repository.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{repository.stargazers_count} stars</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>{repository.watchers_count} watchers</span>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-green-500" />
                <span>{repository.forks_count} forks</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-purple-500" />
                <span>{repository.language}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="pulls">Pull Requests</TabsTrigger>
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                <Bug className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{issues.filter((i) => i.state === "open").length}</div>
                <p className="text-xs text-muted-foreground">
                  {issues.filter((i) => i.state === "closed").length} closed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open PRs</CardTitle>
                <GitPullRequest className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pullRequests.filter((pr) => pr.state === "open").length}</div>
                <p className="text-xs text-muted-foreground">
                  {pullRequests.filter((pr) => pr.state === "closed").length} closed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Branches</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branches.length}</div>
                <p className="text-xs text-muted-foreground">Active branches</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {commits.map((commit, index) => (
                    <div key={commit.sha} className="flex items-start gap-3">
                      <GitCommit className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{commit.commit.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{commit.commit.author.name}</span>
                          <span>•</span>
                          <span>{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Issues</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Issue</DialogTitle>
                  <DialogDescription>Report a bug or request a feature</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="issue-title">Title</Label>
                    <Input
                      id="issue-title"
                      value={newIssue.title}
                      onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issue-body">Description</Label>
                    <Textarea
                      id="issue-body"
                      value={newIssue.body}
                      onChange={(e) => setNewIssue({ ...newIssue, body: e.target.value })}
                      placeholder="Detailed description of the issue"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="issue-labels">Labels (comma-separated)</Label>
                    <Input
                      id="issue-labels"
                      value={newIssue.labels}
                      onChange={(e) => setNewIssue({ ...newIssue, labels: e.target.value })}
                      placeholder="bug, enhancement, documentation"
                    />
                  </div>
                  <Button onClick={createIssue} className="w-full">
                    Create Issue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {issues.map((issue) => (
              <Card key={issue.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStateColor(issue.state)}>{issue.state}</Badge>
                        <span className="text-sm text-muted-foreground">#{issue.number}</span>
                      </div>
                      <h4 className="font-semibold mb-2">{issue.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{issue.body}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>by {issue.user.login}</span>
                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {issue.labels.length > 0 && (
                    <div className="flex gap-1 mt-3">
                      {issue.labels.map((label) => (
                        <Badge key={label.name} variant="outline" style={{ backgroundColor: `#${label.color}20` }}>
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pulls" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Pull Requests</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New PR
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Pull Request</DialogTitle>
                  <DialogDescription>Propose changes to the repository</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pr-title">Title</Label>
                    <Input
                      id="pr-title"
                      value={newPR.title}
                      onChange={(e) => setNewPR({ ...newPR, title: e.target.value })}
                      placeholder="Brief description of changes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pr-body">Description</Label>
                    <Textarea
                      id="pr-body"
                      value={newPR.body}
                      onChange={(e) => setNewPR({ ...newPR, body: e.target.value })}
                      placeholder="Detailed description of changes"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pr-head">From Branch</Label>
                      <Input
                        id="pr-head"
                        value={newPR.head}
                        onChange={(e) => setNewPR({ ...newPR, head: e.target.value })}
                        placeholder="feature-branch"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pr-base">To Branch</Label>
                      <Input
                        id="pr-base"
                        value={newPR.base}
                        onChange={(e) => setNewPR({ ...newPR, base: e.target.value })}
                        placeholder="main"
                      />
                    </div>
                  </div>
                  <Button onClick={createPullRequest} className="w-full">
                    Create Pull Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {pullRequests.map((pr) => (
              <Card key={pr.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStateColor(pr.state)}>{pr.state}</Badge>
                        <span className="text-sm text-muted-foreground">#{pr.number}</span>
                      </div>
                      <h4 className="font-semibold mb-2">{pr.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{pr.body}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>by {pr.user.login}</span>
                        <span>
                          {pr.head.ref} → {pr.base.ref}
                        </span>
                        <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commits" className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Commits</h3>
          <div className="space-y-4">
            {commits.map((commit) => (
              <Card key={commit.sha}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <GitCommit className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">{commit.commit.message}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{commit.commit.author.name}</span>
                        <span>{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{commit.sha.substring(0, 7)}</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <h3 className="text-lg font-semibold">Branches</h3>
          <div className="space-y-4">
            {branches.map((branch) => (
              <Card key={branch.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        {branch.protected && (
                          <Badge variant="secondary" className="mt-1">
                            Protected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{branch.commit.sha.substring(0, 7)}</code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <h3 className="text-lg font-semibold">Repository Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Documents</CardTitle>
                <CardDescription>Backup legal documents to GitHub repository</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Start Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Changes</CardTitle>
                <CardDescription>Sync local changes with remote repository</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create Release</CardTitle>
                <CardDescription>Create a new release with current documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Release
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>Manage team access and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
