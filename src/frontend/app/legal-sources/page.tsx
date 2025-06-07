import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LegalSourceStatus } from "@/src/frontend/components/legal-sources/source-status"

export default function LegalSourcesPage() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Legal Sources" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Legal Sources Dashboard</h1>
            <LegalSourceStatus />
          </div>
        </main>
      </div>
    </div>
  )
}
