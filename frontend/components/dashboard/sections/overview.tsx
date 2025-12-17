"use client"

import { Card } from "@/components/ui/card"
import { FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react"

export function Overview() {
  const stats = [
    {
      label: "Invoices Processed",
      value: "1,247",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Pending Returns",
      value: "3",
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Detected Errors",
      value: "2",
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Filed Successfully",
      value: "12",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Overview</h2>
        <p className="text-muted-foreground">Your GST filing status at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Deadlines</h3>
        <div className="space-y-3">
          {[
            { name: "GSTR-3B Filing", date: "Oct 20, 2024", status: "pending" },
            { name: "GSTR-1 Filing", date: "Oct 15, 2024", status: "filed" },
            { name: "ITC Reconciliation", date: "Oct 25, 2024", status: "pending" },
          ].map((deadline, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div>
                <p className="font-medium text-foreground">{deadline.name}</p>
                <p className="text-sm text-muted-foreground">{deadline.date}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  deadline.status === "filed" ? "bg-green-500/10 text-green-700" : "bg-yellow-500/10 text-yellow-700"
                }`}
              >
                {deadline.status === "filed" ? "Filed" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
