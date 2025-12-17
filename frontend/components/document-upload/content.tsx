"use client"

import { useState } from "react"
import { FileUploadBox } from "./file-upload-box"
import { FilePreviewTable } from "./file-preview-table"
import { ValidationProgress } from "./validation-progress"
import { SecurityInfo } from "./security-info"
import { PrivacyBanner } from "./privacy-banner"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

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

export function DocumentUploadContent() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [validationResults, setValidationResults] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleFilesAdded = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleValidate = async () => {
    setIsValidating(true)
    // Simulate validation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const results = files.map((f) => ({
      ...f,
      status: Math.random() > 0.2 ? "valid" : "error",
      errorCount: Math.random() > 0.2 ? 0 : Math.floor(Math.random() * 3) + 1,
    }))

    setFiles(results)
    setValidationResults({
      totalFiles: files.length,
      validFiles: results.filter((f) => f.status === "valid").length,
      errorFiles: results.filter((f) => f.status === "error").length,
      timestamp: new Date(),
    })
    setIsValidating(false)
  }

  const handleProceed = () => {
    // Navigate to tax computation
    window.location.href = "/dashboard?section=tax-computation"
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Upload Your Financial Documents</h1>
          <p className="text-lg text-muted-foreground">
            Upload invoices, statements, or transaction data for AI-based GST analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Box */}
            <FileUploadBox onFilesAdded={handleFilesAdded} />

            {/* File Preview */}
            {files.length > 0 && (
              <>
                <FilePreviewTable files={files} onRemoveFile={handleRemoveFile} />

                {/* Validation Progress */}
                <ValidationProgress
                  files={files}
                  isValidating={isValidating}
                  results={validationResults}
                  onValidate={handleValidate}
                />

                {/* Action Buttons */}
                {validationResults && (
                  <div className="flex gap-3">
                    <Button onClick={handleProceed} className="flex-1 bg-primary hover:bg-primary/90 h-11">
                      Proceed to Tax Computation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <SecurityInfo />
          </div>
        </div>
      </div>

      {/* Privacy Banner */}
      <PrivacyBanner />
    </div>
  )
}
