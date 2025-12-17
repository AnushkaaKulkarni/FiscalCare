"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { File, Trash2, CheckCircle2, AlertCircle, Clock, Lock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

interface FilePreviewTableProps {
  files: UploadedFile[]
  onRemoveFile: (id: string) => void
}

export function FilePreviewTable({ files, onRemoveFile }: FilePreviewTableProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="p-6 border-b border-border/40">
        <h3 className="text-lg font-semibold text-foreground">Uploaded Files ({files.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-foreground">File Name</TableHead>
              <TableHead className="text-foreground">Size</TableHead>
              <TableHead className="text-foreground">Uploaded</TableHead>
              <TableHead className="text-foreground">Encryption</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-right text-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id} className="border-border/40 hover:bg-background/50">
                <TableCell className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-primary" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatFileSize(file.size)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatTime(file.uploadedAt)}</TableCell>
                <TableCell>
                  {file.encryptionStatus === "encrypted" ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Lock className="w-4 h-4" />
                      Encrypted
                    </div>
                  ) : (
                    <span className="text-xs text-yellow-600">Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  {file.status === "pending" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/10 text-gray-700 text-xs">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                  {file.status === "validating" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs animate-pulse">
                      Processing...
                    </span>
                  )}
                  {file.status === "valid" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-700 text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Valid
                    </span>
                  )}
                  {file.status === "error" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-700 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {file.errorCount} errors
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(file.id)}
                    className="hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
