"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Clock, X } from "lucide-react"

interface Alert {
  id: number
  title: string
  description: string
  type: "deadline" | "error" | "success" | "warning"
  status: "filed" | "warning" | "pending" | "resolved"
  action?: string
}

export function AlertsCompliance() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      title: "GSTR-3B Filing Due",
      description: "Your GSTR-3B return is due on Oct 20, 2024. Only 2 days remaining.",
      type: "deadline",
      status: "pending",
      action: "File Now",
    },
    {
      id: 2,
      title: "Duplicate Invoice Detected",
      description: "Invoice INV-045 appears to be a duplicate of INV-044. Please review and resolve.",
      type: "error",
      status: "warning",
      action: "Review",
    },
    {
      id: 3,
      title: "Tax Mismatch Found",
      description: "Tax amount mismatch in invoice INV-052. Expected ₹9,000, found ₹8,500",
      type: "error",
      status: "warning",
      action: "Correct",
    },
    {
      id: 4,
      title: "GSTR-1 Filed Successfully",
      description: "Your GSTR-1 return for September has been filed successfully.",
      type: "success",
      status: "filed",
    },
    {
      id: 5,
      title: "ITC Reconciliation Pending",
      description: "Complete your ITC reconciliation by Oct 25, 2024 to avoid penalties.",
      type: "deadline",
      status: "pending",
      action: "Start",
    },
  ])

  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filed":
        return "bg-green-500/10 text-green-700"
      case "warning":
        return "bg-yellow-500/10 text-yellow-700"
      case "pending":
        return "bg-blue-500/10 text-blue-700"
      case "resolved":
        return "bg-gray-500/10 text-gray-700"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "deadline":
        return <Clock className="w-5 h-5 text-blue-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const alertStats = {
    total: alerts.length,
    pending: alerts.filter((a) => a.status === "pending").length,
    warnings: alerts.filter((a) => a.status === "warning").length,
    resolved: alerts.filter((a) => a.status === "filed").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Alerts & Compliance</h2>
        <p className="text-muted-foreground">Stay on top of filing deadlines and issues</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Total Alerts</p>
          <p className="text-2xl font-bold text-foreground">{alertStats.total}</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-blue-600">{alertStats.pending}</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Warnings</p>
          <p className="text-2xl font-bold text-yellow-600">{alertStats.warnings}</p>
        </Card>
        <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{alertStats.resolved}</p>
        </Card>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className="p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">{getIcon(alert.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge className={getStatusColor(alert.status)}>
                    {alert.status === "filed"
                      ? "Filed"
                      : alert.status === "warning"
                        ? "Warning"
                        : alert.status === "pending"
                          ? "Pending"
                          : "Resolved"}
                  </Badge>
                  {alert.action && (
                    <Button size="sm" variant="outline">
                      {alert.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && (
        <Card className="p-12 border-border/40 bg-card/50 backdrop-blur-sm text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
          <p className="text-muted-foreground">No pending alerts or compliance issues</p>
        </Card>
      )}
    </div>
  )
}
