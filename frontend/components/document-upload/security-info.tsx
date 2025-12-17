"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Shield, CheckCircle2, BarChart3 } from "lucide-react"

export function SecurityInfo() {
  return (
    <div className="space-y-4">
      {/* Accepted Formats */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Accepted Formats
        </h3>
        <div className="space-y-2">
          <Badge variant="outline" className="block w-full justify-start">
            📄 CSV Files
          </Badge>
          <Badge variant="outline" className="block w-full justify-start">
            📊 Excel (.xlsx)
          </Badge>
          <Badge variant="outline" className="block w-full justify-start">
            📋 JSON Files
          </Badge>
          <Badge variant="outline" className="block w-full justify-start">
            📑 PDF Documents
          </Badge>
        </div>
      </Card>

      {/* Data Security */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Data Security
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              All uploads are encrypted using <strong>AES-256</strong> encryption
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Processed in compliance with <strong>GST and data protection standards</strong>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              <strong>No data sharing</strong> with third parties
            </p>
          </div>
        </div>
      </Card>

      {/* Upload Statistics */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Upload Statistics
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="text-lg font-bold text-green-600">98.5%</span>
          </div>
          <div className="w-full bg-background/50 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: "98.5%" }}></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Based on 1,247 successful uploads this month</p>
        </div>
      </Card>
    </div>
  )
}
