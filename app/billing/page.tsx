"use client"

import { CreditDashboard } from "@/components/billing/credit-dashboard"

export default function BillingPage() {
  // Mock user ID - in real app, get from auth
  const userId = "user-123"

  return (
    <div className="container mx-auto py-8">
      <CreditDashboard userId={userId} />
    </div>
  )
}
