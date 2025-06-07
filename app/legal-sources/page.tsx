"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LegalSourcesDashboard } from "@/components/legal-sources/sources-dashboard"

export default function LegalSourcesPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Legal Sources" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <LegalSourcesDashboard />
          </div>
        </main>
      </div>
    </div>
  )
}
