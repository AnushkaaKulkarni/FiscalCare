"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

type InvoiceRaw = any;

function toNumSafe(v: any): number {
  if (v === undefined || v === null) return 0;

  if (typeof v === "object") {
    const extKeys = [
      "$numberInt",
      "$numberDouble",
      "$numberLong",
      "$numberDecimal",
      "$number",
    ];
    for (const k of extKeys) {
      if (k in v) return toNumSafe((v as any)[k]);
    }
    const vals = Object.values(v);
    if (vals.length === 1) return toNumSafe(vals[0]);
    return 0;
  }

  if (typeof v === "number") return Number.isFinite(v) ? v : 0;

  if (typeof v === "string") {
    const cleaned = v.replace(/₹|Rs\.?|,|\s/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function GSTFilingPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

  useEffect(() => {
    let mounted = true;

    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("fiscalcare_token");
        const user = localStorage.getItem("fiscalcare_user");

        if (!token || !user) {
          alert("Please log in again to view your invoices.");
          router.push("/");
          return;
        }

        const res = await fetch(`${API_BASE}/api/gstr1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json().catch(() => ({} as any));

        if (!res.ok) {
          console.error("Failed to fetch invoices:", json);
          alert(json.message || json.error || "Failed to fetch invoices");
          if (
            json.message === "Invalid token" ||
            json.message === "No token provided"
          ) {
            localStorage.removeItem("fiscalcare_token");
            localStorage.removeItem("fiscalcare_user");
            router.push("/");
          }
          return;
        }

        const list: any[] = Array.isArray(json)
          ? json
          : Array.isArray((json as any).invoices)
          ? (json as any).invoices
          : Array.isArray((json as any).data)
          ? (json as any).data
          : [];

        if (mounted) setInvoices(list);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        if (mounted) setInvoices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchInvoices();
    return () => {
      mounted = false;
    };
  }, [router, API_BASE]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900/5">
        <p className="text-slate-700 text-lg font-medium">
          Loading invoices for GSTR-1 filing…
        </p>
      </div>
    );
  }

  // Use ALL invoices for filing (corrected values already stored)
  const filingInvoices = invoices || [];

  // ---------- Normalization & Totals ----------
  let totalTaxable = 0;
  let totalGSTFiled = 0;

  const normalized = filingInvoices.map((inv: any) => {
    const gstin = inv.gstin || inv.supplierGstin || "Not found";
    const type = gstin && gstin !== "Not found" ? "B2B" : "B2C";

    const totalInvoice = toNumSafe(
      inv.totalInvoice ?? inv.totalWithGst ?? inv.total ?? 0
    );
    const rateInvoice = toNumSafe(
      inv.gstRateInvoice ?? inv.gstRate ?? inv.gstRateAdjusted ?? 0
    );
    const gstAmountInvoice = toNumSafe(
      inv.gstAmountInvoice ?? inv.gstAmount ?? 0
    );

    const rateCBIC = toNumSafe(
      inv.gstRateAdjusted ?? inv.verifiedRate ?? rateInvoice
    );
    const gstAmountAdjusted = toNumSafe(inv.totalGstAdjusted ?? 0);

    let taxable = toNumSafe(inv.taxableValue ?? inv.taxable ?? 0);
    const effectiveRate = rateCBIC || rateInvoice;

    if (!taxable && totalInvoice && effectiveRate > 0) {
      taxable = +(totalInvoice / (1 + effectiveRate / 100));
    } else if (!taxable) {
      taxable = totalInvoice;
    }

    const gstFiled =
      !inv.gstVerified && gstAmountAdjusted
        ? gstAmountAdjusted
        : gstAmountInvoice || gstAmountAdjusted;

    const isCorrected =
      !!effectiveRate &&
      !!rateInvoice &&
      rateCBIC > 0 &&
      rateCBIC !== rateInvoice;

    const status = isCorrected ? "Corrected (CBIC)" : "Correct";

    totalTaxable += taxable;
    totalGSTFiled += gstFiled;

    return {
      original: inv,
      type,
      gstin,
      taxable,
      totalInvoice,
      rateInvoice,
      rateCBIC,
      gstAmountInvoice,
      gstFiled,
      status,
      isCorrected,
    };
  });

  const b2bInvoices = normalized.filter((n) => n.type === "B2B");
  const b2cInvoices = normalized.filter((n) => n.type === "B2C");
  const avgGSTRateFiled =
    totalTaxable > 0 ? (totalGSTFiled / totalTaxable) * 100 : 0;

  // ---------- Export handlers ----------
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filingInvoices, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GSTR1_Raw_Invoices.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const rows = normalized.map((n) => ({
      invoiceNo: n.original.invoiceNo ?? n.original.fileName ?? "—",
      gstin: n.gstin ?? "—",
      type: n.type,
      taxableValue: n.taxable,
      gstAmountInvoice: n.gstAmountInvoice,
      gstAmountFiled: n.gstFiled,
      rateInvoice: n.rateInvoice,
      rateCBIC: n.rateCBIC,
      status: n.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GSTR-1");
    XLSX.writeFile(wb, "GSTR1_Filing_Summary.xlsx");
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-slate-900/5 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              GSTR-1 Filing Summary
            </h1>
            <p className="text-base text-slate-600 mt-2 max-w-xl">
              Final summary of invoices with{" "}
              <span className="font-semibold text-slate-800">
                CBIC-corrected GST
              </span>{" "}
              wherever invoice rates were wrong.
            </p>
          </div>

          <button
            onClick={() => router.push("/document-upload")}
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg hover:bg-slate-800 active:bg-slate-950 transition"
          >
            ⬅ Back to Upload Page
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-blue-900 to-blue-600 rounded-2xl shadow-lg p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
              B2B Invoices
            </p>
            <p className="mt-2 text-4xl font-extrabold">{b2bInvoices.length}</p>
            <p className="mt-1 text-xs text-blue-200">
              Business-to-Business taxable supplies
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-900 to-emerald-600 rounded-2xl shadow-lg p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
              B2C Invoices
            </p>
            <p className="mt-2 text-4xl font-extrabold">
              {b2cInvoices.length}
            </p>
            <p className="mt-1 text-xs text-emerald-200">
              Business-to-Consumer taxable supplies
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl shadow-lg p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Total Taxable Value
            </p>
            <p className="mt-2 text-3xl font-extrabold">
              ₹
              {totalTaxable.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-1 text-xs text-slate-300">Net value before GST</p>
          </div>

          <div className="bg-gradient-to-br from-rose-900 to-rose-600 rounded-2xl shadow-lg p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-200">
              Total GST (Filed)
            </p>
            <p className="mt-2 text-3xl font-extrabold">
              ₹
              {totalGSTFiled.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-1 text-xs text-rose-200">
              GST as per CBIC-corrected rates
            </p>
          </div>
        </div>

        {/* Average rate card */}
        <div className="mb-8">
          <div className="bg-white border border-indigo-100 rounded-2xl shadow-md px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Average GST Rate (Filed)
              </p>
              <p className="mt-1 text-3xl font-extrabold text-indigo-700">
                {avgGSTRateFiled.toFixed(2)}%
              </p>
            </div>
            <p className="text-xs text-slate-500 max-w-md text-right">
              Calculated from{" "}
              <span className="font-semibold text-slate-700">
                total GST filed ÷ total taxable value
              </span>{" "}
              across all invoices.
            </p>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex justify-end mb-4 gap-3">
          <button
            onClick={exportJSON}
            className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-slate-800 shadow-md transition"
          >
            📤 Export Raw JSON
          </button>
          <button
            onClick={exportExcel}
            className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-emerald-700 shadow-md transition"
          >
            📊 Export Filing Excel
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-lg bg-white">
          <table className="min-w-full text-base text-slate-800">
            <thead className="bg-slate-900 text-slate-100">
              <tr className="text-xs uppercase tracking-wide">
                <th className="py-3.5 px-4 text-left font-semibold">Invoice No</th>
                <th className="py-3.5 px-4 text-left font-semibold">GSTIN</th>
                <th className="py-3.5 px-4 text-center font-semibold">Type</th>
                <th className="py-3.5 px-4 text-right font-semibold">
                  Taxable Value
                </th>
                <th className="py-3.5 px-4 text-right font-semibold">
                  GST (Invoice)
                </th>
                <th className="py-3.5 px-4 text-right font-semibold">
                  GST (Filed / CBIC)
                </th>
                <th className="py-3.5 px-4 text-center font-semibold">
                  Invoice Rate
                </th>
                <th className="py-3.5 px-4 text-center font-semibold">
                  CBIC Rate
                </th>
                <th className="py-3.5 px-4 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {normalized.map((n, idx) => (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } border-t border-slate-200 hover:bg-indigo-50/60 transition-colors`}
                >
                  <td className="py-3.5 px-4">
                    {n.original.invoiceNo ?? n.original.fileName ?? "—"}
                  </td>
                  <td className="py-3.5 px-4">{n.gstin ?? "—"}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                        n.type === "B2B"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {n.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[15px]">
                    ₹
                    {n.taxable.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[15px]">
                    ₹
                    {n.gstAmountInvoice.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[15px] font-semibold">
                    ₹
                    {n.gstFiled.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[15px]">
                    {n.rateInvoice || 0}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[15px] text-indigo-700">
                    {n.rateCBIC || 0}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                        n.isCorrected
                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {n.isCorrected ? "Corrected (CBIC)" : "Correct"}
                    </span>
                  </td>
                </tr>
              ))}

              {normalized.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-slate-500 text-base"
                  >
                    No invoices available for filing yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
