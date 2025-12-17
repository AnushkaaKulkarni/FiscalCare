"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Calendar, BarChart3 } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")

  const filingTrends = [
    { month: "Jun", filed: 1, pending: 0, revenue: 250000 },
    { month: "Jul", filed: 2, pending: 1, revenue: 320000 },
    { month: "Aug", filed: 3, pending: 0, revenue: 380000 },
    { month: "Sep", filed: 4, pending: 1, revenue: 420000 },
    { month: "Oct", filed: 5, pending: 2, revenue: 510000 },
  ]

  const taxTrends = [
    { month: "Jun", tax: 45000, itc: 12000, payable: 33000 },
    { month: "Jul", tax: 57600, itc: 15200, payable: 42400 },
    { month: "Aug", tax: 68400, itc: 18200, payable: 50200 },
    { month: "Sep", tax: 75600, itc: 20100, payable: 55500 },
    { month: "Oct", tax: 91800, itc: 24300, payable: 67500 },
  ]

  const reports = [
    {
      id: 1,
      name: "October 2024 Monthly Report",
      date: "Oct 31, 2024",
      type: "Monthly",
      size: "2.4 MB",
      status: "ready",
    },
    {
      id: 2,
      name: "Q3 2024 Quarterly Report",
      date: "Sep 30, 2024",
      type: "Quarterly",
      size: "5.8 MB",
      status: "ready",
    },
    {
      id: 3,
      name: "September 2024 Monthly Report",
      date: "Sep 30, 2024",
      type: "Monthly",
      size: "2.1 MB",
      status: "ready",
    },
    {
      id: 4,
      name: "August 2024 Monthly Report",
      date: "Aug 31, 2024",
      type: "Monthly",
      size: "2.3 MB",
      status: "ready",
    },
    {
      id: 5,
      name: "H1 2024 Half-Yearly Report",
      date: "Jun 30, 2024",
      type: "Half-Yearly",
      size: "8.2 MB",
      status: "ready",
    },
  ]

  const complianceSummary = {
    totalFiled: 5,
    onTime: 4,
    late: 1,
    pending: 2,
    compliance: "80%",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h2>
        <p className="text-muted-foreground">Download reports and view filing analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Total Filed</p>
          <p className="text-2xl font-bold text-foreground">{complianceSummary.totalFiled}</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">On Time</p>
          <p className="text-2xl font-bold text-green-600">{complianceSummary.onTime}</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Late</p>
          <p className="text-2xl font-bold text-red-600">{complianceSummary.late}</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{complianceSummary.pending}</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Compliance</p>
          <p className="text-2xl font-bold text-primary">{complianceSummary.compliance}</p>
        </Card>
      </div>

      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
        <Tabs defaultValue="filing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="filing">Filing Trends</TabsTrigger>
            <TabsTrigger value="tax">Tax Analysis</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="filing" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Filing Status Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="filed" stroke="#10b981" strokeWidth={2} name="Filed" />
                  <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="tax" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Tax Liability & ITC Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taxTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="tax" fill="#0066cc" name="Total Tax" />
                  <Bar dataKey="itc" fill="#10b981" name="ITC" />
                  <Bar dataKey="payable" fill="#f59e0b" name="Payable" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Revenue Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0066cc" strokeWidth={2} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Available Reports
          </h3>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Filter by Date
          </Button>
        </div>

        <div className="space-y-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{report.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1 bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Export All Reports
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          <BarChart3 className="w-4 h-4 mr-2" />
          Generate Custom Report
        </Button>
      </div>
    </div>
  )
}
