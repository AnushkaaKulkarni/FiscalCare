"use client"
import { Lock, Eye } from "lucide-react"

export function PrivacyBanner() {
  return (
    <div className="border-t border-border/40 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Privacy & Confidentiality</h4>
              <p className="text-sm text-muted-foreground">
                We respect your confidentiality — no data sharing with third parties. Your financial documents are
                processed securely and never stored without encryption.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 px-3 py-2 rounded-full whitespace-nowrap">
            <Eye className="w-4 h-4" />
            GDPR Compliant
          </div>
        </div>

        {/* Audit Trail Info */}
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-900">
          <p className="text-xs text-muted-foreground">
            <strong>Audit Trail:</strong> All uploads are logged with timestamp, file name, and processing status for
            compliance and security purposes.
          </p>
        </div>
      </div>
    </div>
  )
}
