import { Octokit } from "@octokit/rest"

interface GitHubConfig {
  token: string
  owner: string
  repo: string
}

interface GitHubFile {
  path: string
  content: string
  sha?: string
  message: string
  branch?: string
}

interface GitHubRepository {
  name: string
  description: string
  private: boolean
  auto_init?: boolean
  gitignore_template?: string
  license_template?: string
}

interface GitHubIssue {
  title: string
  body: string
  labels?: string[]
  assignees?: string[]
  milestone?: number
}

interface GitHubPullRequest {
  title: string
  body: string
  head: string
  base: string
  draft?: boolean
}

export class GitHubService {
  private octokit: Octokit
  private config: GitHubConfig

  constructor(config: GitHubConfig) {
    this.config = config
    this.octokit = new Octokit({
      auth: config.token,
    })
  }

  /**
   * Create a new repository
   */
  async createRepository(repo: GitHubRepository) {
    try {
      const response = await this.octokit.repos.createForAuthenticatedUser({
        name: repo.name,
        description: repo.description,
        private: repo.private,
        auto_init: repo.auto_init,
        gitignore_template: repo.gitignore_template,
        license_template: repo.license_template,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Create repository error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Get repository information
   */
  async getRepository() {
    try {
      const response = await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Get repository error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Repository not found",
      }
    }
  }

  /**
   * List repository contents
   */
  async getContents(path = "") {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Get contents error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Create or update a file
   */
  async createOrUpdateFile(file: GitHubFile) {
    try {
      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: file.path,
        message: file.message,
        content: Buffer.from(file.content).toString("base64"),
        sha: file.sha,
        branch: file.branch,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Create/update file error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string, message: string, sha: string, branch?: string) {
    try {
      const response = await this.octokit.repos.deleteFile({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message,
        sha,
        branch,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Delete file error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string, fromBranch = "main") {
    try {
      // Get the SHA of the source branch
      const refResponse = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${fromBranch}`,
      })

      // Create the new branch
      const response = await this.octokit.git.createRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `refs/heads/${branchName}`,
        sha: refResponse.data.object.sha,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Create branch error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * List branches
   */
  async listBranches() {
    try {
      const response = await this.octokit.repos.listBranches({
        owner: this.config.owner,
        repo: this.config.repo,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("List branches error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(pr: GitHubPullRequest) {
    try {
      const response = await this.octokit.pulls.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title: pr.title,
        body: pr.body,
        head: pr.head,
        base: pr.base,
        draft: pr.draft,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Create pull request error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * List pull requests
   */
  async listPullRequests(state: "open" | "closed" | "all" = "open") {
    try {
      const response = await this.octokit.pulls.list({
        owner: this.config.owner,
        repo: this.config.repo,
        state,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("List pull requests error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Create an issue
   */
  async createIssue(issue: GitHubIssue) {
    try {
      const response = await this.octokit.issues.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title: issue.title,
        body: issue.body,
        labels: issue.labels,
        assignees: issue.assignees,
        milestone: issue.milestone,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Create issue error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * List issues
   */
  async listIssues(state: "open" | "closed" | "all" = "open") {
    try {
      const response = await this.octokit.issues.listForRepo({
        owner: this.config.owner,
        repo: this.config.repo,
        state,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("List issues error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Get commit history
   */
  async getCommits(branch?: string, path?: string) {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        sha: branch,
        path,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Get commits error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Search repositories
   */
  async searchRepositories(query: string) {
    try {
      const response = await this.octokit.search.repos({
        q: query,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Search repositories error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Get repository statistics
   */
  async getRepositoryStats() {
    try {
      const [repoInfo, contributors, languages, commits] = await Promise.all([
        this.getRepository(),
        this.octokit.repos.listContributors({
          owner: this.config.owner,
          repo: this.config.repo,
        }),
        this.octokit.repos.listLanguages({
          owner: this.config.owner,
          repo: this.config.repo,
        }),
        this.getCommits(),
      ])

      return {
        success: true,
        data: {
          repository: repoInfo.data,
          contributors: contributors.data,
          languages: languages.data,
          totalCommits: commits.data?.length || 0,
        },
      }
    } catch (error) {
      console.error("Get repository stats error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const createGitHubService = (token: string, owner: string, repo: string) => {
  return new GitHubService({ token, owner, repo })
}
