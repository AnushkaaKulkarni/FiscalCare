"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function GSTR2APage() {
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("fiscalcare_token");

      if (!token) {
        alert("Session expired. Please login again.");
        router.push("/");
        return;
      }

      const res = await fetch(`${API_BASE}/api/gstr2a`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      setData(Array.isArray(json) ? json : json.entries || []);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // 📥 DOWNLOAD HANDLERS
  const downloadExcel = () => {
  const rows = data.map((row) => ({
    SupplierGSTIN: row.supplierGSTIN,
    InvoiceNo: row.invoiceNumber,
    InvoiceDate: new Date(row.invoiceDate).toLocaleDateString(),
    TaxableValue: row.taxableValue,
    TotalGST: row.totalGST,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "GSTR-2A");

  XLSX.writeFile(wb, "GSTR2A_Purchase_Register.xlsx");
};

  return (
    <div className="min-h-screen bg-slate-900/5 py-8">
  <div className="max-w-7xl mx-auto px-4">

    {/* ================= HEADER ================= */}
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          GSTR-2A Purchase Summary
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-xl">
          Auto-generated purchase register from supplier invoices uploaded and
          verified through <span className="font-semibold text-slate-800">FiscalCare</span>.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={downloadExcel}
          className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition"
        >
          ⬇ Export GSTR-2A (Excel)
        </button>

        <button
          onClick={() => router.push("/document-upload")}
          className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-md hover:bg-slate-800 transition"
        >
          ⬅ Back to Upload Page
        </button>
      </div>
    </div>

    {/* ================= SUMMARY CARDS ================= */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div className="bg-gradient-to-br from-blue-900 to-blue-600 rounded-2xl shadow-lg p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
          Total Purchase Invoices
        </p>
        <p className="mt-2 text-4xl font-extrabold">{data.length}</p>
        <p className="mt-1 text-xs text-blue-200">
          Invoices received from suppliers
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-900 to-emerald-600 rounded-2xl shadow-lg p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
          Total Taxable Value
        </p>
        <p className="mt-2 text-3xl font-extrabold">
          ₹{data.reduce((s, r) => s + Number(r.taxableValue || 0), 0).toLocaleString("en-IN")}
        </p>
        <p className="mt-1 text-xs text-emerald-200">
          Net purchase value
        </p>
      </div>

      <div className="bg-gradient-to-br from-indigo-900 to-indigo-600 rounded-2xl shadow-lg p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
          Total GST (Input)
        </p>
        <p className="mt-2 text-3xl font-extrabold">
          ₹{data.reduce((s, r) => s + Number(r.totalGST || 0), 0).toLocaleString("en-IN")}
        </p>
        <p className="mt-1 text-xs text-indigo-200">
          Eligible input tax credit
        </p>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl shadow-lg p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Register Type
        </p>
        <p className="mt-2 text-xl font-semibold">
          Purchase (2A)
        </p>
      </div>
    </div>

    {/* ================= INFO STRIP (LIKE AVG GST RATE CARD) ================= */}
    <div className="mb-8">
      <div className="bg-white border border-indigo-100 rounded-2xl shadow-md px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            GSTR-2A Register
          </p>
          <p className="mt-1 text-lg font-bold text-indigo-700">
            Supplier-wise purchase summary
          </p>
        </div>
        <p className="text-xs text-slate-500 max-w-md text-right">
          Used for reconciliation with <span className="font-semibold text-slate-700">GSTR-2B</span> and
          claiming eligible ITC.
        </p>
      </div>
    </div>

    {/* ================= ACTION BAR ================= */}
    <div className="flex justify-end mb-4">
      <button
        onClick={() => router.push("/gstr2b")}
        className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-emerald-700 shadow-md transition"
      >
        Generate GSTR-2B →
      </button>
    </div>

    {/* ================= TABLE ================= */}
    <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-lg bg-white">
      <table className="min-w-full text-base text-slate-800">
        <thead className="bg-slate-900 text-slate-100">
          <tr className="text-xs uppercase tracking-wide">
            <th className="py-3.5 px-4 text-left font-semibold">Supplier GSTIN</th>
            <th className="py-3.5 px-4 text-left font-semibold">Invoice No</th>
            <th className="py-3.5 px-4 text-left font-semibold">Invoice Date</th>
            <th className="py-3.5 px-4 text-right font-semibold">Taxable Value</th>
            <th className="py-3.5 px-4 text-right font-semibold">GST</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row._id}
              className={`${
                idx % 2 === 0 ? "bg-white" : "bg-slate-50"
              } border-t border-slate-200 hover:bg-indigo-50/60 transition-colors`}
            >
              <td className="py-3.5 px-4">{row.supplierGSTIN}</td>
              <td className="py-3.5 px-4">{row.invoiceNumber}</td>
              <td className="py-3.5 px-4">
                {new Date(row.invoiceDate).toLocaleDateString()}
              </td>
              <td className="py-3.5 px-4 text-right font-mono">
                ₹{Number(row.taxableValue).toLocaleString("en-IN")}
              </td>
              <td className="py-3.5 px-4 text-right font-mono font-semibold">
                ₹{Number(row.totalGST).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500 text-base">
                No purchase invoices available.
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
