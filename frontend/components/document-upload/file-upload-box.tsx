"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Lock, Shield } from "lucide-react"
import { SecurityBadge } from "./security-badge"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "pending" | "validating" | "valid" | "error"
  uploadedAt: Date
  encryptionStatus: "encrypted" | "pending"
}

interface FileUploadBoxProps {
  onFilesAdded: (files: UploadedFile[]) => void
}

export function FileUploadBox({ onFilesAdded }: FileUploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList) return

    const newFiles: UploadedFile[] = Array.from(fileList)
      .filter((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase()
        return ["csv", "xlsx", "json", "pdf"].includes(ext || "")
      })
      .map((f) => ({
        id: Math.random().toString(),
        name: f.name,
        size: f.size,
        type: f.type,
        status: "pending" as const,
        uploadedAt: new Date(),
        encryptionStatus: "encrypted" as const,
      }))

    if (newFiles.length > 0) {
      onFilesAdded(newFiles)
    }
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

  return (
    <div className="space-y-4">
      <SecurityBadge />

      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-12 border-2 border-dashed transition-all ${
          isDragging ? "border-primary bg-primary/5 scale-105" : "border-border/40 bg-card/50"
        } backdrop-blur-sm text-center cursor-pointer`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Drop files here or click to upload</h3>
            <p className="text-sm text-muted-foreground mb-1">Supported formats: CSV, Excel, JSON, PDF</p>
            <p className="text-xs text-green-600 flex items-center justify-center gap-1 mt-2">
              <Lock className="w-3 h-3" />
              All uploads are encrypted with AES-256
            </p>
          </div>
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            accept=".csv,.xlsx,.json,.pdf"
          />
          <Button asChild className="bg-primary hover:bg-primary/90 h-10">
            <label htmlFor="file-upload" className="cursor-pointer">
              Browse Files
            </label>
          </Button>
        </div>
      </Card>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <strong>Secure Upload Enabled:</strong> Your data is encrypted using AES-256 and processed in compliance with
          GST and data protection standards.
        </p>
      </div>
    </div>
  )
}
