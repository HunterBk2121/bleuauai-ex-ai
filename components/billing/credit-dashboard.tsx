"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, TrendingUp, Clock, Zap, Calendar, ArrowUp, ArrowDown } from "lucide-react"

interface CreditDashboardProps {
  userId: string
}

export function CreditDashboard({ userId }: CreditDashboardProps) {
  const [creditData, setCreditData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCreditData()
    fetchTransactions()
  }, [userId])

  const fetchCreditData = async () => {
    try {
      const response = await fetch(`/api/credits/status?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setCreditData(data)
      }
    } catch (error) {
      console.error("Error fetching credit data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/credits/transactions?userId=${userId}&limit=20`)
      const data = await response.json()
      if (data.success) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading credit information...</div>
  }

  if (!creditData) {
    return <div className="text-center p-8">Unable to load credit information</div>
  }

  const { credits, rates, subscriptionTiers } = creditData
  const usagePercentage = (credits.usedCredits / credits.totalCredits) * 100
  const resetDate = new Date(credits.resetDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <CreditCard className="h-8 w-8 mr-3" />
            Credit Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Transparent usage tracking and billing information</p>
        </div>
        <Button>
          <ArrowUp className="h-4 w-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>

      {/* Credit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining Credits</p>
                <p className="text-3xl font-bold">{credits.remainingCredits.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={100 - usagePercentage} className="mt-4" />
            <p className="text-xs text-gray-500 mt-2">
              {credits.usedCredits.toLocaleString()} of {credits.totalCredits.toLocaleString()} used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Plan</p>
                <p className="text-2xl font-bold capitalize">{credits.subscriptionTier}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Badge className="mt-2" variant="secondary">
              {credits.monthlyAllocation.toLocaleString()} credits/month
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reset Date</p>
                <p className="text-lg font-bold">{resetDate.toLocaleDateString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usage Rate</p>
                <p className="text-2xl font-bold">{usagePercentage.toFixed(1)}%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              {usagePercentage > 80 ? (
                <ArrowUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className={`text-xs ${usagePercentage > 80 ? "text-red-500" : "text-green-500"}`}>
                {usagePercentage > 80 ? "High usage" : "Normal usage"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
          <TabsTrigger value="rates">Credit Rates</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
        </TabsList>

        {/* Recent Transactions */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Credit Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.action.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{transaction.module}</TableCell>
                      <TableCell className="font-medium">-{transaction.credits}</TableCell>
                      <TableCell className="text-sm text-gray-600">{transaction.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Rates */}
        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Rate Schedule</CardTitle>
              <p className="text-gray-600">Transparent pricing for all platform features</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(
                  rates.reduce((acc: any, rate: any) => {
                    if (!acc[rate.module]) acc[rate.module] = []
                    acc[rate.module].push(rate)
                    return acc
                  }, {}),
                ).map(([module, moduleRates]: [string, any]) => (
                  <div key={module}>
                    <h4 className="font-medium text-lg capitalize mb-3">{module.replace("_", " ")}</h4>
                    <div className="grid gap-3">
                      {moduleRates.map((rate: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">{rate.description}</p>
                            <p className="text-sm text-gray-600">{rate.unit}</p>
                          </div>
                          <Badge variant="secondary">{rate.credits} credits</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Plans */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionTiers.map((tier: any) => (
              <Card key={tier.id} className={tier.id === credits.subscriptionTier ? "border-blue-500 bg-blue-50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {tier.name}
                    {tier.id === credits.subscriptionTier && <Badge>Current</Badge>}
                  </CardTitle>
                  <div className="text-3xl font-bold">
                    ${tier.price}
                    <span className="text-lg font-normal text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Credits</span>
                      <span className="font-medium">{tier.monthlyCredits.toLocaleString()}</span>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Features:</h5>
                      <ul className="text-sm space-y-1">
                        {tier.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {tier.id !== credits.subscriptionTier && (
                      <Button className="w-full" variant={tier.id === "enterprise" ? "default" : "outline"}>
                        {tier.price === 0 ? "Downgrade" : "Upgrade"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
