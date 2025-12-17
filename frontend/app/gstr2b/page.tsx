"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function GSTR2BPage() {
  const router = useRouter();
  const [data, setData] = useState<any>({
  summary: {
    totalEligibleITC: 0,
    totalIneligibleITC: 0
  },
  invoices: []
});


  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("fiscalcare_token");

      if (!token) {
        alert("Session expired. Please login again.");
        router.push("/");
        return;
      }

      const res = await fetch(`${API_BASE}/api/gstr2b`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      setData(json);
    };

    fetchData();
  }, [router]);

    if (!data || !data.summary) {
    return <p className="p-6">Loading GSTR-2B...</p>;
  }

  // 📥 DOWNLOAD HANDLERS
  const downloadExcel = () => {
  const rows = data.invoices.map((row: any) => ({
    SupplierGSTIN: row.supplierGSTIN,
    InvoiceNo: row.invoiceNumber,
    TotalGST: row.totalGST,
    EligibleITC: row.eligibleITC,
    IneligibleITC: row.ineligibleITC,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "GSTR-2B");

  XLSX.writeFile(wb, "GSTR2B_ITC_Summary.xlsx");
};


  return (
    <div className="min-h-screen bg-slate-900/5 py-8">
  <div className="max-w-7xl mx-auto px-4">

    {/* ================= HEADER ================= */}
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          GSTR-2B ITC Summary
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-xl">
          Auto-generated Input Tax Credit statement derived from supplier invoices
          and reconciled purchase data.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={downloadExcel}
          className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition"
        >
          ⬇ Export GSTR-2B (Excel)
        </button>

        <button
          onClick={() => router.push("/gstr2a")}
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition"
        >
          ← Back to GSTR-2A
        </button>

        <button
          onClick={() => router.push("/document-upload")}
          className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-md hover:bg-slate-800 transition"
        >
          ← Upload Page
        </button>
      </div>
    </div>

    {/* ================= SUMMARY CARDS ================= */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-600 rounded-2xl shadow-lg p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
          Eligible ITC
        </p>
        <p className="mt-2 text-3xl font-extrabold">
          ₹{data.summary.totalEligibleITC}
        </p>
        <p className="mt-1 text-xs text-emerald-200">
          ITC available for claim
        </p>
      </div>

      <div className="bg-gradient-to-br from-rose-900 to-rose-600 rounded-2xl shadow-lg p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-200">
          Ineligible ITC
        </p>
        <p className="mt-2 text-3xl font-extrabold">
          ₹{data.summary.totalIneligibleITC}
        </p>
        <p className="mt-1 text-xs text-rose-200">
          Blocked or restricted ITC
        </p>
      </div>

      <div className="bg-gradient-to-br from-indigo-900 to-indigo-600 rounded-2xl shadow-lg p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
          Total Invoices
        </p>
        <p className="mt-2 text-3xl font-extrabold">
          {data.invoices.length}
        </p>
        <p className="mt-1 text-xs text-indigo-200">
          Supplier invoices considered
        </p>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl shadow-lg p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Register Type
        </p>
        <p className="mt-2 text-xl font-semibold">
          ITC Statement (2B)
        </p>
      </div>
    </div>

    {/* ================= INFO STRIP ================= */}
    <div className="mb-8">
      <div className="bg-white border border-indigo-100 rounded-2xl shadow-md px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            GSTR-2B
          </p>
          <p className="mt-1 text-lg font-bold text-indigo-700">
            Static ITC statement for the period
          </p>
        </div>
        <p className="text-xs text-slate-500 max-w-md text-right">
          Used to determine final <span className="font-semibold text-slate-700">eligible ITC</span>
          for GSTR-3B filing.
        </p>
      </div>
    </div>

    {/* ================= TABLE ================= */}
    <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-lg bg-white">
      <table className="min-w-full text-base text-slate-800">
        <thead className="bg-slate-900 text-slate-100">
          <tr className="text-xs uppercase tracking-wide">
            <th className="py-3.5 px-4 text-left font-semibold">
              Supplier GSTIN
            </th>
            <th className="py-3.5 px-4 text-left font-semibold">
              Invoice No
            </th>
            <th className="py-3.5 px-4 text-right font-semibold">
              Total GST
            </th>
            <th className="py-3.5 px-4 text-right font-semibold">
              Eligible ITC
            </th>
            <th className="py-3.5 px-4 text-right font-semibold">
              Ineligible ITC
            </th>
          </tr>
        </thead>

        <tbody>
          {data.invoices.map((row: any, i: number) => (
            <tr
              key={i}
              className={`${
                i % 2 === 0 ? "bg-white" : "bg-slate-50"
              } border-t border-slate-200 hover:bg-indigo-50/60 transition-colors`}
            >
              <td className="py-3.5 px-4">{row.supplierGSTIN}</td>
              <td className="py-3.5 px-4">{row.invoiceNumber}</td>
              <td className="py-3.5 px-4 text-right font-mono">
                ₹{row.totalGST}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                ₹{row.eligibleITC}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-semibold">
                ₹{row.ineligibleITC}
              </td>
            </tr>
          ))}

          {data.invoices.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="py-8 text-center text-slate-500 text-base"
              >
                No invoices available for ITC calculation.
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
