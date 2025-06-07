import { CourtListenerDashboard } from "@/src/frontend/components/court-listener/dashboard"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function CourtListenerPage() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="CourtListener Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
          <CourtListenerDashboard />
        </main>
      </div>
    </div>
  )
}
