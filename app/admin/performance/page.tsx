import { DatabaseSetupStatus } from "@/components/database-setup-status"

import { DatabaseOptimization } from "@/components/database-optimization"
import { MemoryMonitor } from "@/components/memory-monitor"
import { PerformanceMonitor } from "@/components/performance-monitor"

export default function PerformancePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Performance Monitoring</h1>

      <div className="grid gap-6">
        <DatabaseSetupStatus />
        <DatabaseOptimization />
        <MemoryMonitor />
        <PerformanceMonitor />
      </div>
    </div>
  )
}
