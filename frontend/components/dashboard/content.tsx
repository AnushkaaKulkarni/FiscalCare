"use client"

import { Overview } from "@/components/dashboard/sections/overview"
import { InvoiceUpload } from "@/components/dashboard/sections/invoice-upload"
import { AIParsing } from "@/components/dashboard/sections/ai-parsing"
import { TaxComputation } from "@/components/dashboard/sections/tax-computation"
import { ReturnDrafting } from "@/components/dashboard/sections/return-drafting"
import { AlertsCompliance } from "@/components/dashboard/sections/alerts-compliance"
import { Reports } from "@/components/dashboard/sections/reports"
import { Settings } from "@/components/dashboard/sections/settings"

interface DashboardContentProps {
  activeSection: string
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="p-6">
        {activeSection === "overview" && <Overview />}
        {activeSection === "upload" && <InvoiceUpload />}
        {activeSection === "parsing" && <AIParsing />}
        {activeSection === "tax" && <TaxComputation />}
        {activeSection === "returns" && <ReturnDrafting />}
        {activeSection === "alerts" && <AlertsCompliance />}
        {activeSection === "reports" && <Reports />}
        {activeSection === "settings" && <Settings />}
      </div>
    </main>
  )
}
