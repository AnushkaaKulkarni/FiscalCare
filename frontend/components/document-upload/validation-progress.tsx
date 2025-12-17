"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "pending" | "validating" | "valid" | "error"
  errorCount?: number
  uploadedAt: Date
  encryptionStatus: "encrypted" | "pending"
}

interface ValidationProgressProps {
  files: UploadedFile[]
  isValidating: boolean
  results: any
  onValidate: () => void
}

export function ValidationProgress({ files, isValidating, results, onValidate }: ValidationProgressProps) {
  const validCount = files.filter((f) => f.status === "valid").length
  const errorCount = files.filter((f) => f.status === "error").length
  const progressPercent = files.length > 0 ? (validCount / files.length) * 100 : 0

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6">
      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground">Validation Progress</h3>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Results Summary */}
        {results && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border border-border/40">
              <p className="text-sm text-muted-foreground mb-1">Total Files</p>
              <p className="text-2xl font-bold text-foreground">{results.totalFiles}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700">Valid Files</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{results.validFiles}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">Files with Errors</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{results.errorFiles}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onValidate}
            disabled={isValidating || files.length === 0}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              "Validate Data"
            )}
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90">Parse with AI</Button>
        </div>
      </div>
    </Card>
  )
}
