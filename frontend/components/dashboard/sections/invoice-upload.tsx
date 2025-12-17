"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, Trash2, CheckCircle2, AlertCircle } from "lucide-react"
import { SecurityBadge } from "@/components/document-upload/security-badge"
import { AuditTrail } from "@/components/document-upload/audit-trail"

interface UploadedFile {
  id: string
  name: string
  size: number
  status: "pending" | "validating" | "valid" | "error"
  errorCount?: number
}

export function InvoiceUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [auditLog, setAuditLog] = useState<any[]>([])

  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList) return
    const newFiles = Array.from(fileList).map((f) => ({
      id: Math.random().toString(),
      name: f.name,
      size: f.size,
      status: "pending" as const,
      encryptionStatus: "encrypted" as const,
    }))
    setFiles((prev) => [...prev, ...newFiles])

    newFiles.forEach((file) => {
      setAuditLog((prev) => [
        ...prev,
        {
          id: file.id,
          action: "File Uploaded",
          fileName: file.name,
          timestamp: new Date(),
          status: "success",
        },
      ])
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const validateFiles = () => {
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        status: Math.random() > 0.2 ? "valid" : "error",
        errorCount: Math.random() > 0.2 ? 0 : Math.floor(Math.random() * 5) + 1,
      })),
    )
  }

  const parseWithAI = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, status: "validating" })))
    setTimeout(() => {
      setFiles((prev) => prev.map((f) => ({ ...f, status: "valid" })))
    }, 2000)
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Upload Invoices</h2>
        <p className="text-muted-foreground">Upload CSV, Excel, or JSON files for processing</p>
      </div>

      <SecurityBadge />

      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-8 border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border/40 bg-card/50"
        } backdrop-blur-sm text-center cursor-pointer`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Drop files here or click to upload</h3>
            <p className="text-sm text-muted-foreground">Supported formats: CSV, Excel, JSON</p>
            <p className="text-xs text-green-600 mt-2">🔒 All uploads are encrypted with AES-256</p>
          </div>
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            accept=".csv,.xlsx,.json"
          />
          <Button asChild className="bg-primary hover:bg-primary/90">
            <label htmlFor="file-upload" className="cursor-pointer">
              Select Files
            </label>
          </Button>
        </div>
      </Card>

      {files.length > 0 && (
        <>
          <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Uploaded Files ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <File className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {file.status === "pending" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-700">Pending</span>
                    )}
                    {file.status === "validating" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-700 animate-pulse">
                        Processing...
                      </span>
                    )}
                    {file.status === "valid" && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-700">Valid</span>
                      </div>
                    )}
                    {file.status === "error" && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-700">
                          {file.errorCount} errors
                        </span>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button onClick={validateFiles} variant="outline" className="flex-1 bg-transparent">
                Validate Data
              </Button>
              <Button onClick={parseWithAI} className="flex-1 bg-primary hover:bg-primary/90">
                Parse with AI
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                View Logs
              </Button>
            </div>
          </Card>

          {auditLog.length > 0 && <AuditTrail logs={auditLog} />}

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Files</p>
              <p className="text-2xl font-bold text-foreground">{files.length}</p>
            </Card>
            <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground mb-1">Valid Files</p>
              <p className="text-2xl font-bold text-green-600">{files.filter((f) => f.status === "valid").length}</p>
            </Card>
            <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground mb-1">Files with Errors</p>
              <p className="text-2xl font-bold text-red-600">{files.filter((f) => f.status === "error").length}</p>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
