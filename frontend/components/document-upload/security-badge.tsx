"use client"

import { Badge } from "@/components/ui/badge"
import { Lock, Shield } from "lucide-react"

export function SecurityBadge() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
        <Lock className="w-3 h-3" />
        Secure Upload Enabled
      </Badge>
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
        <Shield className="w-3 h-3" />
        HTTPS Protected
      </Badge>
      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">AES-256 Encrypted</Badge>
    </div>
  )
}
