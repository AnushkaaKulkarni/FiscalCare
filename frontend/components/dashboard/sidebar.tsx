"use client"

import { useRouter } from "next/navigation"
import {
  FileText,
  BarChart3,
  AlertCircle,
  Settings,
  LogOut,
  Upload,
  Calculator,
  FileCheck,
  Zap,
  FileUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isOpen: boolean
}

export function Sidebar({ activeSection, onSectionChange, isOpen }: SidebarProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const sections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "document-upload", label: "Document Upload", icon: FileUp },
    { id: "upload", label: "Upload Invoices", icon: Upload },
    { id: "parsing", label: "AI Parsing", icon: Zap },
    { id: "tax", label: "Tax Computation", icon: Calculator },
    { id: "returns", label: "Return Drafting", icon: FileCheck },
    { id: "alerts", label: "Alerts & Compliance", icon: AlertCircle },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleSectionChange = (section: string) => {
    if (section === "document-upload") {
      window.location.href = "/document-upload"
    } else {
      onSectionChange(section)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Signed Out",
      description: "You've been signed out securely.",
      variant: "default",
    })
    router.push("/")
  }

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-0"
      } bg-card border-r border-border/40 transition-all duration-300 overflow-hidden flex flex-col`}
    >
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">FiscalCare</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          return (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{section.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/40 space-y-2">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2 bg-transparent hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
