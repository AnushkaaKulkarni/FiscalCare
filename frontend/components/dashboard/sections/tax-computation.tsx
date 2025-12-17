"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, TrendingUp } from "lucide-react"

export function TaxComputation() {
  const monthlyData = [
    { month: "Aug", cgst: 12000, sgst: 12000, igst: 8000, total: 32000 },
    { month: "Sep", cgst: 15000, sgst: 15000, igst: 10000, total: 40000 },
    { month: "Oct", cgst: 18000, sgst: 18000, igst: 12000, total: 48000 },
  ]

  const taxDistribution = [
    { name: "CGST", value: 45000, percentage: 37.5 },
    { name: "SGST", value: 45000, percentage: 37.5 },
    { name: "IGST", value: 30000, percentage: 25 },
  ]

  const taxRateBreakdown = [
    { rate: "5%", amount: 25000, invoices: 45 },
    { rate: "12%", amount: 48000, invoices: 32 },
    { rate: "18%", amount: 35000, invoices: 28 },
    { rate: "28%", amount: 12000, invoices: 8 },
  ]

  const COLORS = ["#0066cc", "#10b981", "#f59e0b"]

  const summaryStats = [
    { label: "Total Taxable Value", value: "₹2,85,000", change: "+12.5%" },
    { label: "Total Tax Liability", value: "₹1,20,000", change: "+8.3%" },
    { label: "Average Tax Rate", value: "42.1%", change: "-2.1%" },
    { label: "ITC Available", value: "₹28,500", change: "+15.2%" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Tax Computation</h2>
        <p className="text-muted-foreground">Detailed tax calculations and analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, i) => (
          <Card key={i} className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                {stat.change}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Monthly Liability</TabsTrigger>
            <TabsTrigger value="distribution">Tax Distribution</TabsTrigger>
            <TabsTrigger value="breakdown">Rate Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Monthly Tax Liability Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="cgst" fill="#0066cc" name="CGST" />
                  <Bar dataKey="sgst" fill="#10b981" name="SGST" />
                  <Bar dataKey="igst" fill="#f59e0b" name="IGST" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Tax Type Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taxDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taxDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                      }}
                      formatter={(value) => `₹${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
                {taxDistribution.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-background/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-border/40 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[i],
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-foreground font-semibold mt-2">₹{item.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tax Rate Breakdown</h3>
              <div className="space-y-3">
                {taxRateBreakdown.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-background/50 border border-border/40">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">{item.rate} Tax Rate</p>
                        <p className="text-sm text-muted-foreground">{item.invoices} invoices</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">₹{item.amount.toLocaleString()}</p>
                    </div>
                    <div className="w-full bg-border/40 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${(item.amount / 120000) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="flex gap-3">
        <Button className="bg-primary hover:bg-primary/90 flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export Computation
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Recalculate
        </Button>
      </div>
    </div>
  )
}
