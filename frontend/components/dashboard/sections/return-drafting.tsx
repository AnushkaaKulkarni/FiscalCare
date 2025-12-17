"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Download, Send, AlertCircle, CheckCircle2 } from "lucide-react"

interface Invoice {
  id: string
  invoice: string
  amount: number
  tax: number
  date: string
  status: "valid" | "warning" | "error"
}

export function ReturnDrafting() {
  const [activeTab, setActiveTab] = useState("sales")
  const [showPreview, setShowPreview] = useState(false)

  const salesData: Invoice[] = [
    { id: "1", invoice: "INV-001", amount: 50000, tax: 9000, date: "Oct 1, 2024", status: "valid" },
    { id: "2", invoice: "INV-002", amount: 75000, tax: 13500, date: "Oct 5, 2024", status: "valid" },
    { id: "3", invoice: "INV-003", amount: 60000, tax: 10800, date: "Oct 10, 2024", status: "warning" },
  ]

  const purchaseData: Invoice[] = [
    { id: "4", invoice: "PUR-001", amount: 30000, tax: 5400, date: "Oct 2, 2024", status: "valid" },
    { id: "5", invoice: "PUR-002", amount: 45000, tax: 8100, date: "Oct 8, 2024", status: "valid" },
  ]

  const totalSalesAmount = salesData.reduce((sum, item) => sum + item.amount, 0)
  const totalSalesTax = salesData.reduce((sum, item) => sum + item.tax, 0)
  const totalPurchaseAmount = purchaseData.reduce((sum, item) => sum + item.amount, 0)
  const totalPurchaseTax = purchaseData.reduce((sum, item) => sum + item.tax, 0)

  const returnSummary = {
    totalTaxableValue: totalSalesAmount + totalPurchaseAmount,
    totalTaxPayable: totalSalesTax - totalPurchaseTax,
    itcAvailable: totalPurchaseTax,
    netPayable: totalSalesTax - totalPurchaseTax,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-500/10"
      case "warning":
        return "bg-yellow-500/10"
      case "error":
        return "bg-red-500/10"
      default:
        return "bg-gray-500/10"
    }
  }

  const InvoiceTable = ({ data }: { data: Invoice[] }) => (
    <div className="space-y-2">
      {data.map((item) => (
        <div
          key={item.id}
          className={`flex items-center justify-between p-4 rounded-lg ${getStatusColor(item.status)}`}
        >
          <div className="flex items-center gap-3 flex-1">
            {getStatusIcon(item.status)}
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.invoice}</p>
              <p className="text-sm text-muted-foreground">{item.date}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-foreground">₹{item.amount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Tax: ₹{item.tax.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Return Drafting</h2>
        <p className="text-muted-foreground">Generate GSTR-1 and GSTR-3B return drafts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Total Taxable Value</p>
          <p className="text-2xl font-bold text-foreground">₹{returnSummary.totalTaxableValue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Sales + Purchases</p>
        </Card>
        <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Tax Payable</p>
          <p className="text-2xl font-bold text-primary">₹{returnSummary.totalTaxPayable.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">After ITC adjustment</p>
        </Card>
        <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">ITC Available</p>
          <p className="text-2xl font-bold text-accent">₹{returnSummary.itcAvailable.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Input Tax Credit</p>
        </Card>
        <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Net Payable</p>
          <p className="text-2xl font-bold text-foreground">₹{returnSummary.netPayable.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Final amount due</p>
        </Card>
      </div>

      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sales">Sales Invoices ({salesData.length})</TabsTrigger>
            <TabsTrigger value="purchase">Purchase Invoices ({purchaseData.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/40">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold text-foreground">₹{totalSalesAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Tax</p>
                    <p className="text-lg font-bold text-foreground">₹{totalSalesTax.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoice Count</p>
                    <p className="text-lg font-bold text-foreground">{salesData.length}</p>
                  </div>
                </div>
              </div>
              <InvoiceTable data={salesData} />
            </div>
          </TabsContent>

          <TabsContent value="purchase" className="mt-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/40">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold text-foreground">₹{totalPurchaseAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Tax</p>
                    <p className="text-lg font-bold text-foreground">₹{totalPurchaseTax.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoice Count</p>
                    <p className="text-lg font-bold text-foreground">{purchaseData.length}</p>
                  </div>
                </div>
              </div>
              <InvoiceTable data={purchaseData} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button onClick={() => setShowPreview(!showPreview)} variant="outline" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Hide Preview" : "Generate Preview"}
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Download Draft
          </Button>
          <Button className="flex-1 bg-accent hover:bg-accent/90">
            <Send className="w-4 h-4 mr-2" />
            File Return
          </Button>
        </div>
      </Card>

      {showPreview && (
        <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Return Preview (GSTR-3B)</h3>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-muted-foreground">Outward Supplies</p>
                <p className="text-lg font-bold text-foreground">₹{totalSalesAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-muted-foreground">Output Tax</p>
                <p className="text-lg font-bold text-foreground">₹{totalSalesTax.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-muted-foreground">Inward Supplies</p>
                <p className="text-lg font-bold text-foreground">₹{totalPurchaseAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-muted-foreground">Input Tax Credit</p>
                <p className="text-lg font-bold text-foreground">₹{totalPurchaseTax.toLocaleString()}</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-muted-foreground mb-1">Net Tax Payable</p>
              <p className="text-2xl font-bold text-primary">₹{returnSummary.netPayable.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
