"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import GitHubDashboard from "@/components/github/github-dashboard"

export default function GitHubPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="GitHub Integration" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <GitHubDashboard />
          </div>
        </main>
      </div>
    </div>
  )
}
