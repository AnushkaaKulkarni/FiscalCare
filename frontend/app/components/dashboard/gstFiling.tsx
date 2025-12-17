// frontend/app/components/dashboard/gstFiling.tsx
"use client";

import React, { JSX, useEffect, useState } from "react";

/** UI shape */
interface InvoiceUI {
  _id?: string;
  vendor: string;
  invoiceNo: string;
  gstin: string;
  hsn: string;
  total: string;      // display "₹1,25,000.00"
  gstRate: string;    // display "18%"
  gstAmount: string;  // display "₹1,800.00"
  gstVerified: boolean;
  _raw?: {
    totalInvoice?: number;
    gstRateInvoice?: number;
    gstAmountInvoice?: number;
    gstRateAdjusted?: number;
    totalGstAdjusted?: number;
    taxableValue?: number;
    filePath?: string | null;
  };
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;
const API = `${API_BASE}/api/invoices`;

/**
 * Robust conversion to Number:
 * - unwraps Mongo Extended JSON like { $numberInt: "2800" } / { $numberDouble: "2800.0" }
 * - strips currency symbols, % and commas
 * - returns 0 on anything invalid
 */
function toNumSafe(v: any): number {
  if (v === undefined || v === null) return 0;

  // If object looks like Mongo Extended JSON, unwrap common keys
  if (typeof v === "object") {
    const extKeys = ["$numberInt", "$numberDouble", "$numberLong", "$numberDecimal", "$number"];
    for (const k of extKeys) {
      if (k in v) return toNumSafe((v as any)[k]);
    }
    // plain object with single numeric-like value
    const vals = Object.values(v);
    if (vals.length === 1) return toNumSafe(vals[0]);
    return 0;
  }

  if (typeof v === "number") {
    return Number.isFinite(v) ? v : 0;
  }

  if (typeof v === "string") {
    const cleaned = v.replace(/₹|Rs\.?|%|,|\s/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  // fallback
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function GSTFiling(): JSX.Element {
  const [invoices, setInvoices] = useState<InvoiceUI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const token = localStorage.getItem("fc_token");
fetch(API, {
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
})


    fetch(API)
      .then((r) => r.json())
      .then((json) => {
        const rawList: any[] =
          Array.isArray(json)
            ? json
            : Array.isArray(json.invoices)
            ? json.invoices
            : Array.isArray(json.data)
            ? json.data
            : [];

        // dedupe by _id
        const unique: { [id: string]: any } = {};
        rawList.forEach((it) => {
          const key = it._id || it.id || it.fileName || JSON.stringify(it).slice(0, 40);
          if (!unique[key]) unique[key] = it;
        });
        const list = Object.values(unique);

        const mapped = list.map((inv: any) => {
          const totalNum =
            toNumSafe(inv.totalInvoice) ||
            toNumSafe(inv.totalInvoiceDisplay) ||
            toNumSafe(inv.total) ||
            0;

          const rateNum =
            toNumSafe(inv.gstRateInvoice) ||
            toNumSafe(inv.gstRateAdjusted) ||
            toNumSafe(inv.gstRate) ||
            0;

          // taxable: prefer explicit taxableValue; else derive if rate present
          let taxableNum = toNumSafe(inv.taxableValue);
          if (!taxableNum) {
            if (totalNum && rateNum > 0) {
              taxableNum = +(totalNum / (1 + rateNum / 100));
            } else {
              // If rate is zero or missing, assume total is taxable (this may be wrong for "total incl GST")
              taxableNum = totalNum;
            }
          }

          const gstAmt =
            toNumSafe(inv.gstAmountInvoice) ||
            toNumSafe(inv.totalGstAdjusted) ||
            Math.max(0, +(totalNum - taxableNum));

          const displayTotal = `₹${Number(totalNum).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          const displayGst = `₹${Number(gstAmt).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          const displayRate = `${Number(rateNum)}%`;

          return {
            _id: inv._id,
            vendor: inv.vendor || "Unknown",
            invoiceNo: inv.invoiceNo || inv.fileName || "—",
            gstin: inv.gstin || "—",
            hsn: inv.hsn || "—",
            total: displayTotal,
            gstRate: displayRate,
            gstAmount: displayGst,
            gstVerified: !!inv.gstVerified,
            _raw: {
              totalInvoice: totalNum,
              gstRateInvoice: toNumSafe(inv.gstRateInvoice),
              gstAmountInvoice: toNumSafe(inv.gstAmountInvoice),
              gstRateAdjusted: toNumSafe(inv.gstRateAdjusted),
              totalGstAdjusted: toNumSafe(inv.totalGstAdjusted),
              taxableValue: taxableNum,
              filePath: inv.filePath || null,
            },
          } as InvoiceUI;
        });

        if (mounted) setInvoices(mapped);
      })
      .catch((err) => {
        console.error("Failed to load invoices:", err);
        if (mounted) setInvoices([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Export GSTR-1 JSON (simple summary)
  const generateGSTR1 = () => {
    let totalTaxable = 0;
    let totalGST = 0;
    const rows = invoices.map((inv) => {
      const raw = inv._raw || {};
      const tax = Number((raw.taxableValue || 0).toFixed(2));
      const gst = Number((raw.gstAmountInvoice || raw.totalGstAdjusted || Math.max(0, (raw.totalInvoice || 0) - tax)).toFixed(2));
      const rate = raw.gstRateInvoice || raw.gstRateAdjusted || 0;

      totalTaxable += tax;
      totalGST += gst;

      return {
        vendor: inv.vendor,
        invoiceNo: inv.invoiceNo,
        gstin: inv.gstin,
        hsn: inv.hsn,
        taxableValue: tax,
        gstRate: rate,
        gstAmount: gst,
        filePath: raw.filePath || null,
        verified: inv.gstVerified,
      };
    });

    const payload = {
      generatedAt: new Date().toISOString(),
      totalInvoices: invoices.length,
      totalTaxableValue: Number(totalTaxable.toFixed(2)),
      totalGST: Number(totalGST.toFixed(2)),
      invoices: rows,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `GSTR1_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  if (loading) return <p className="p-6">Loading invoices...</p>;
  if (!invoices.length) return <div className="p-6 text-gray-600">No invoices found. Please upload invoices first.</div>;

  // UI totals and average rate (safe guard)
  const totalTaxable = invoices.reduce((s, it) => s + (it._raw?.taxableValue || 0), 0);
  const totalGst = invoices.reduce((s, it) => {
    const r = it._raw || {};
    const gst = r.gstAmountInvoice || r.totalGstAdjusted || Math.max(0, (r.totalInvoice || 0) - (r.taxableValue || 0));
    return s + gst;
  }, 0);
  const avgGstRate = totalTaxable > 0 ? (totalGst / totalTaxable) * 100 : 0;

  // B2B/B2C counts (simple heuristic)
  const b2bCount = invoices.filter((i) => !!(i.gstin && i.gstin !== "—" && i.gstin !== "Not found")).length;
  const b2cCount = invoices.length - b2bCount;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📤 GSTR-1 Filing Summary</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded text-center">
          <div className="text-sm font-medium">📦 B2B Invoices</div>
          <div className="text-2xl font-bold text-blue-700">{b2bCount}</div>
        </div>
        <div className="bg-green-50 p-4 rounded text-center">
          <div className="text-sm font-medium">🛒 B2C Invoices</div>
          <div className="text-2xl font-bold text-green-700">{b2cCount}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded text-center">
          <div className="text-sm font-medium">💰 Total Taxable Value</div>
          <div className="text-2xl font-bold">₹{Number(totalTaxable).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-pink-50 p-4 rounded text-center">
          <div className="text-sm font-medium">💸 Total GST</div>
          <div className="text-2xl font-bold">₹{Number(totalGst).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="bg-purple-50 p-6 rounded mb-6 text-center">
        <div className="text-sm">📊 Average GST Rate</div>
        <div className="text-2xl font-bold text-purple-700">{Number.isFinite(avgGstRate) ? Number(avgGstRate).toFixed(2) + "%" : "0.00%"}</div>
      </div>

      <div className="mb-4">
        <button onClick={generateGSTR1} className="px-4 py-2 bg-blue-600 text-white rounded mr-2">Export as JSON</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-2">Invoice No</th>
              <th className="text-left px-4 py-2">GSTIN</th>
              <th className="text-right px-4 py-2">Taxable Value</th>
              <th className="text-right px-4 py-2">GST Amount</th>
              <th className="text-left px-4 py-2">Rate</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const raw = inv._raw || {};
              const tax = raw.taxableValue || 0;
              const gst = raw.gstAmountInvoice || raw.totalGstAdjusted || Math.max(0, (raw.totalInvoice || 0) - tax);
              const rate = raw.gstRateInvoice || raw.gstRateAdjusted || 0;
              return (
                <tr key={inv._id || inv.invoiceNo} className="border-t">
                  <td className="px-4 py-2">{inv.invoiceNo}</td>
                  <td className="px-4 py-2">{inv.gstin}</td>
                  <td className="px-4 py-2 text-right">₹{Number(tax).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">₹{Number(gst).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2">{rate}%</td>
                  <td className="px-4 py-2">{inv.gstin && inv.gstin !== "—" ? "B2B" : "B2C"}</td>
                  <td className="px-4 py-2">{raw.filePath ? <a className="text-blue-600 underline" href={`${API_BASE}${raw.filePath}`} target="_blank" rel="noreferrer">View PDF</a> : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
