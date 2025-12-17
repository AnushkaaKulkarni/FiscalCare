"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Clock, Zap, TrendingUp } from "lucide-react"

interface ParsingItem {
  id: number
  file: string
  status: "completed" | "processing" | "pending"
  items: number
  errors: number
  accuracy: number
  processingTime: string
}

export function AIParsing() {
  const [parsingStatus, setParsingStatus] = useState<ParsingItem[]>([
    {
      id: 1,
      file: "invoices_oct.csv",
      status: "completed",
      items: 245,
      errors: 0,
      accuracy: 99.8,
      processingTime: "2.3s",
    },
    {
      id: 2,
      file: "invoices_sep.xlsx",
      status: "completed",
      items: 189,
      errors: 2,
      accuracy: 98.9,
      processingTime: "3.1s",
    },
    {
      id: 3,
      file: "invoices_aug.json",
      status: "processing",
      items: 156,
      errors: 0,
      accuracy: 0,
      processingTime: "...",
    },
  ])

  const aiInsights = [
    {
      id: 1,
      type: "anomaly",
      title: "Duplicate Invoice Detected",
      description: "Invoice INV-045 appears to be a duplicate of INV-044 with identical amounts and dates",
      severity: "high",
      action: "Review",
    },
    {
      id: 2,
      type: "anomaly",
      title: "Tax Amount Mismatch",
      description: "Invoice INV-052 has a tax mismatch. Expected ₹9,000 but found ₹8,500",
      severity: "high",
      action: "Correct",
    },
    {
      id: 3,
      type: "insight",
      title: "Unusual Spending Pattern",
      description: "Your purchases increased by 35% this month compared to last month",
      severity: "medium",
      action: "Analyze",
    },
    {
      id: 4,
      type: "insight",
      title: "Tax Optimization Opportunity",
      description: "You may be eligible for additional ITC on recent purchases",
      severity: "low",
      action: "Learn More",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      case "low":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-700"
      case "medium":
        return "bg-yellow-500/10 text-yellow-700"
      case "low":
        return "bg-blue-500/10 text-blue-700"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">AI Parsing & Insights</h2>
        <p className="text-muted-foreground">Monitor invoice parsing and AI-detected anomalies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-foreground">590</p>
          <p className="text-xs text-muted-foreground mt-2">Processed this month</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Accuracy Rate</p>
          <p className="text-2xl font-bold text-green-600">99.2%</p>
          <p className="text-xs text-muted-foreground mt-2">Average accuracy</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Anomalies Found</p>
          <p className="text-2xl font-bold text-yellow-600">2</p>
          <p className="text-xs text-muted-foreground mt-2">Requiring review</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Avg Processing</p>
          <p className="text-2xl font-bold text-primary">2.7s</p>
          <p className="text-xs text-muted-foreground mt-2">Per file</p>
        </Card>
      </div>

      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Parsing Status
        </h3>
        <div className="space-y-3">
          {parsingStatus.map((item) => (
            <div key={item.id} className="p-4 rounded-lg bg-background/50 border border-border/40">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground">{item.file}</h4>
                    <Badge
                      variant={item.status === "completed" ? "default" : "secondary"}
                      className={
                        item.status === "completed"
                          ? "bg-green-500/10 text-green-700"
                          : item.status === "processing"
                            ? "bg-blue-500/10 text-blue-700"
                            : "bg-gray-500/10 text-gray-700"
                      }
                    >
                      {item.status === "completed"
                        ? "Completed"
                        : item.status === "processing"
                          ? "Processing"
                          : "Pending"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-medium text-foreground">{item.items}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Errors</p>
                      <p className="font-medium text-foreground">{item.errors}</p>
                    </div>
                    {item.accuracy > 0 && (
                      <div>
                        <p className="text-muted-foreground">Accuracy</p>
                        <p className="font-medium text-green-600">{item.accuracy}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium text-foreground">{item.processingTime}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {item.status === "completed" ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : item.status === "processing" ? (
                    <Clock className="w-6 h-6 text-blue-500 animate-spin" />
                  ) : (
                    <Clock className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              </div>
              {item.errors > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700">{item.errors} anomalies detected</p>
                    <p className="text-xs text-red-600">Review and resolve before filing</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          AI Insights & Anomalies
        </h3>
        <div className="space-y-3">
          {aiInsights.map((insight) => (
            <div key={insight.id} className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
                <Badge className={getSeverityBadge(insight.severity)}>
                  {insight.severity === "high" ? "High" : insight.severity === "medium" ? "Medium" : "Low"}
                </Badge>
              </div>
              <div className="flex justify-end mt-3">
                <Button size="sm" variant="outline">
                  {insight.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
