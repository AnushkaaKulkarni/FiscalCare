"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:5000";

interface Gstr3bSummary {
  month: string;          // e.g. "2025-01" (based on INVOICE DATE period)
  invoiceCount: number;
  b2bCount: number;
  b2cCount: number;
  taxableTotal: number;
  igstTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  totalTax: number;
}

function formatCurrency(n: number | undefined | null): string {
  const value = typeof n === "number" ? n : 0;
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Gstr3bSummaryPage() {
  const router = useRouter();

  // 🗓 Default month = current month (YYYY-MM)
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [summary, setSummary] = useState<Gstr3bSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  // 🔐 Fetch summary whenever month changes
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("fiscalcare_token");
        const user = localStorage.getItem("fiscalcare_user");

        if (!token || !user) {
          alert("Please log in again to view your GSTR-3B summary.");
          router.push("/");
          return;
        }

        // IMPORTANT:
        // Backend should filter invoices by INVOICE DATE month (YYYY-MM),
        // NOT by upload date.
        const res = await fetch(
          `${API_BASE}/api/gstr3b/summary?month=${encodeURIComponent(month)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json().catch(() => ({} as any));

        if (!res.ok) {
          console.error("Failed to fetch GSTR-3B summary:", data);
          alert(
            data.error || data.message || "Failed to fetch GSTR-3B summary"
          );
          setSummary(null);
          return;
        }

        setSummary(data as Gstr3bSummary);
      } catch (err) {
        console.error("Error fetching GSTR-3B summary:", err);
        setSummary(null);
      } finally {
        setLoading(false);
        setFirstLoad(false);
      }
    };

    fetchSummary();
  }, [month, router]);

  // 📤 Export summary as Excel
  const exportExcel = () => {
    if (!summary) {
      alert("No summary available to export.");
      return;
    }

    const rows = [
      {
        Month: summary.month,
        "Total Invoices": summary.invoiceCount,
        "B2B Invoices": summary.b2bCount,
        "B2C Invoices": summary.b2cCount,
        "Taxable Value": summary.taxableTotal,
        IGST: summary.igstTotal,
        CGST: summary.cgstTotal,
        SGST: summary.sgstTotal,
        "Total Tax": summary.totalTax,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GSTR-3B");
    XLSX.writeFile(wb, `GSTR3B_${summary.month}.xlsx`);
  };

  // 📤 Export summary as JSON
  const exportJSON = () => {
    if (!summary) {
      alert("No summary available to export.");
      return;
    }
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSTR3B_${summary.month}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header + Back button */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          🧮 GSTR-3B Auto Filing Summary
        </h1>
        <button
          onClick={() => router.push("/document-upload")}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 shadow-md transition"
        >
          ⬅️ Back to Upload Page
        </button>
      </div>

      {/* Month selector + info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Select Return Period (by Invoice Date)
          </h2>
          <p className="text-sm text-gray-500 max-w-md">
            This summary is computed based on the{" "}
            <b>invoice dates extracted from your PDFs</b>, not the upload date.
            Choose the <b>month &amp; year</b> that matches your{" "}
            <span className="font-semibold text-purple-700">
              GSTR-3B return period
            </span>
            .
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <input
            type="month"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-500 text-sm">
          Calculating GSTR-3B summary for <b>{month}</b>…
        </div>
      )}

      {/* No data state */}
      {!loading && !summary && !firstLoad && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center text-yellow-800 text-sm">
          No invoices found (by invoice date) for <b>{month}</b>. Upload invoices
          with invoice dates in this month, or choose a different period.
        </div>
      )}

      {/* Summary cards + details */}
      {summary && (
        <>
          {/* Top metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-5 rounded-2xl text-center shadow-sm border border-blue-100">
              <h3 className="text-base font-semibold text-gray-700">
                Total Invoices
              </h3>
              <p className="text-3xl font-extrabold text-blue-700 mt-1">
                {summary.invoiceCount}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Period: {summary.month}
              </p>
            </div>

            <div className="bg-green-50 p-5 rounded-2xl text-center shadow-sm border border-green-100">
              <h3 className="text-base font-semibold text-gray-700">
                📦 B2B Invoices
              </h3>
              <p className="text-3xl font-extrabold text-green-700 mt-1">
                {summary.b2bCount}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                GSTIN present on invoice
              </p>
            </div>

            <div className="bg-orange-50 p-5 rounded-2xl text-center shadow-sm border border-orange-100">
              <h3 className="text-base font-semibold text-gray-700">
                🛒 B2C Invoices
              </h3>
              <p className="text-3xl font-extrabold text-orange-600 mt-1">
                {summary.b2cCount}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                No GSTIN provided
              </p>
            </div>

            <div className="bg-purple-50 p-5 rounded-2xl text-center shadow-sm border border-purple-100">
              <h3 className="text-base font-semibold text-gray-700">
                💸 Total Tax Liability
              </h3>
              <p className="text-3xl font-extrabold text-purple-700 mt-1">
                ₹{formatCurrency(summary.totalTax)}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                IGST + CGST + SGST (outward supplies)
              </p>
            </div>
          </div>

          {/* Tax breakup cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 p-5 rounded-2xl text-center shadow-sm border border-gray-100 sm:col-span-2">
              <h3 className="text-base font-semibold text-gray-700">
                💰 Total Taxable Value (3.1a)
              </h3>
              <p className="text-3xl font-extrabold text-gray-800 mt-1">
                ₹{formatCurrency(summary.taxableTotal)}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Outward taxable supplies (other than zero-rated)
              </p>
            </div>

            <div className="bg-sky-50 p-5 rounded-2xl text-center shadow-sm border border-sky-100">
              <h3 className="text-base font-semibold text-gray-700">IGST</h3>
              <p className="text-3xl font-extrabold text-sky-700 mt-1">
                ₹{formatCurrency(summary.igstTotal)}
              </p>
            </div>

            <div className="bg-rose-50 p-5 rounded-2xl text-center shadow-sm border border-rose-100">
              <h3 className="text-base font-semibold text-gray-700">
                CGST + SGST
              </h3>
              <p className="text-xl font-extrabold text-rose-700 mt-1">
                CGST: ₹{formatCurrency(summary.cgstTotal)}
              </p>
              <p className="text-xl font-extrabold text-rose-700">
                SGST: ₹{formatCurrency(summary.sgstTotal)}
              </p>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={exportJSON}
              className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-900 shadow"
            >
              📤 Export JSON
            </button>
            <button
              onClick={exportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 shadow"
            >
              📊 Export Excel (GSTR-3B)
            </button>
          </div>

          {/* Explanation */}
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-sm text-gray-600 leading-relaxed">
            <p className="mb-1">
              ✅ This summary uses{" "}
              <span className="font-semibold text-purple-700">
                CBIC-verified GST rates
              </span>{" "}
              from your invoices, and groups them by their{" "}
              <b>invoice date</b>. Any invoice with a wrong GST rate is
              auto-corrected in the backend, and these corrected values are what
              you see here.
            </p>
            <p>
              You can now directly use these values to fill{" "}
              <span className="font-semibold">Section 3.1(a)</span> of your
              GSTR-3B return in the GST portal for the selected period.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
