"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

interface AuditLog {
  id: string
  action: string
  fileName: string
  timestamp: Date
  status: "success" | "error" | "pending"
}

interface AuditTrailProps {
  logs: AuditLog[]
}

export function AuditTrail({ logs }: AuditTrailProps) {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Audit Trail</h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
            <div className="flex-shrink-0 mt-0.5">
              {log.status === "success" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {log.status === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
              {log.status === "pending" && <Clock className="w-5 h-5 text-yellow-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{log.action}</p>
              <p className="text-xs text-muted-foreground truncate">{log.fileName}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
