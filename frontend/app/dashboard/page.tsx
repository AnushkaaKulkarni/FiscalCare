"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

// 🧾 Matches backend Invoice model (only fields we need on dashboard)
interface Invoice {
  _id?: string;
  vendor?: string;
  invoiceNo?: string;
  gstin?: string;
  transactionType?: "SALE" | "PURCHASE";
  hsn?: string;
  filePath?: string;

  gstVerified: boolean;
  verificationMessage?: string;

  // rates / amounts
  gstRateInvoice?: number; // invoice GST rate
  gstAmountInvoice?: number; // invoice GST amount
  verifiedRate?: number; // CBIC rate
  gstRateAdjusted?: number; // adjusted rate
  totalGstAdjusted?: number; // adjusted GST amount

  createdAt?: string;
  parsedAt?: string;
  uploadedAt?: string; // in case you set this later
}

const COLORS = ["#22c55e", "#f97316"]; // green, orange
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

type FilterType = "all" | "verified" | "mismatched";

export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  // 🔐 Fetch invoices for logged-in user
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("fiscalcare_token");
        const user = localStorage.getItem("fiscalcare_user");

        if (!token || !user) {
          alert("Please log in again to view your dashboard.");
          router.push("/");
          return;
        }

        const res = await fetch(`${API_BASE}/api/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Error fetching invoices:", data);
          alert(data.message || data.error || "Failed to fetch invoices");
          return;
        }

        setInvoices(Array.isArray(data) ? data : data.invoices || []);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [router]);

  // 🗑 Delete invoice
  const handleDelete = async (id?: string) => {
    if (!id) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice? This cannot be undone."
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("fiscalcare_token");
    if (!token) {
      alert("Please log in again.");
      router.push("/");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Delete error:", data);
        alert(data.message || data.error || "Failed to delete invoice");
        return;
      }

      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      alert("Invoice deleted successfully.");
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert("Error deleting invoice. See console for details.");
    }
  };

  // 📄 View invoice PDF
  const handleViewPdf = (inv: Invoice) => {
    if (!inv.filePath) {
      alert("No PDF file path stored for this invoice.");
      return;
    }
    const url = `${API_BASE}${inv.filePath}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center text-gray-600">
          <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-base font-medium">Loading your invoices...</p>
        </div>
      </div>
    );
  }

  const verified = invoices.filter((i) => i.gstVerified);
  const mismatched = invoices.filter((i) => !i.gstVerified);

  const pieData = [
    { name: "GST Correct", value: verified.length },
    { name: "Auto-Corrected", value: mismatched.length },
  ];

  const totalInvoices = pieData.reduce((sum, d) => sum + d.value, 0);

  // nice labels for donut slices
  const renderPieLabel = (props: any) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
      name,
    } = props;
    if (!percent || percent === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.75;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#111827"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // 🎚 Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "verified") return inv.gstVerified;
    if (filter === "mismatched") return !inv.gstVerified;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 🧭 Header row with Back button */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          📊 FiscalCare GST Dashboard
        </h1>
        <button
          onClick={() => router.push("/document-upload")}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 shadow-md transition"
        >
          ⬅️ Back to Upload Page
        </button>
      </div>

      {/* --- Overview Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-5 rounded-2xl text-center shadow-sm border border-green-100">
          <h3 className="text-base font-semibold text-gray-700">
            Total Invoices
          </h3>
          <p className="text-3xl font-extrabold text-green-700 mt-1">
            {invoices.length}
          </p>
        </div>

        <div className="bg-blue-50 p-5 rounded-2xl text-center shadow-sm border border-blue-100">
          <h3 className="text-base font-semibold text-gray-700">
            ✅ GST Correct
          </h3>
          <p className="text-3xl font-extrabold text-blue-700 mt-1">
            {verified.length}
          </p>
        </div>

        <div className="bg-orange-50 p-5 rounded-2xl text-center shadow-sm border border-orange-100">
          <h3 className="text-base font-semibold text-gray-700">
            ⚠ Auto-Corrected
          </h3>
          <p className="text-3xl font-extrabold text-orange-600 mt-1">
            {mismatched.length}
          </p>
        </div>

        <div className="bg-purple-50 p-5 rounded-2xl shadow-sm border border-purple-100 flex flex-col justify-center">
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            🧮 Filing Logic
          </h3>
          <p className="text-xs sm:text-sm text-purple-900 leading-snug">
            For any mismatched invoice, <b>GSTR-1 / GSTR-3B filing</b> uses the{" "}
            <b>CBIC-corrected GST rate</b>, not the invoice’s wrong rate.
          </p>
        </div>
      </div>

      {/* --- Chart + Filter Row --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Donut chart card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 col-span-1 lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            GST Verification Overview
          </h2>

          {totalInvoices === 0 ? (
            <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
              Upload invoices to see verification chart.
            </div>
          ) : (
            <div className="flex items-center gap-6 h-60">
              {/* Donut chart */}
              <div className="flex-1 h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${value} invoice(s)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center total text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {totalInvoices}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    invoices analysed
                  </p>
                </div>
              </div>

              {/* Legend / quick summary */}
              <div className="w-48 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[0] }}
                    />
                    <span className="text-gray-700">GST Correct</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {verified.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[1] }}
                    />
                    <span className="text-gray-700">Auto-Corrected</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {mismatched.length}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Auto-corrected invoices will be filed using CBIC GST rate and
                  adjusted GST amount in GSTR-1 / GSTR-3B.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filter + Info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Filter by GST Status
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                  filter === "all"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
                onClick={() => setFilter("all")}
              >
                All ({invoices.length})
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                  filter === "verified"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
                onClick={() => setFilter("verified")}
              >
                ✅ Correct ({verified.length})
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                  filter === "mismatched"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-orange-50 text-orange-700 border-orange-200"
                }`}
                onClick={() => setFilter("mismatched")}
              >
                ⚠ Corrected ({mismatched.length})
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 leading-snug border-t pt-3">
            This dashboard helps you visually track which invoices are{" "}
            <span className="font-semibold text-green-700">compliant</span> and
            which ones were{" "}
            <span className="font-semibold text-orange-600">
              auto-corrected
            </span>{" "}
            as per CBIC rates, before generating GSTR-1 / GSTR-3B.
          </div>
        </div>
      </div>

      {/* --- Invoices Table --- */}
      <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm bg-white">
        <table className="min-w-full text-[13px] sm:text-sm text-gray-800">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Vendor</th>
              <th className="py-3 px-4 text-left font-semibold">Invoice No</th>
              <th className="py-3 px-4 text-left font-semibold">GSTIN</th>
              <th className="py-3 px-4 text-left font-semibold">Type</th>
              <th className="py-3 px-4 text-left font-semibold">HSN</th>
              <th className="py-3 px-4 text-left font-semibold">
                Invoice GST %
              </th>
              <th className="py-3 px-4 text-left font-semibold">
                CBIC / Adjusted GST %
              </th>
              <th className="py-3 px-4 text-left font-semibold">Status</th>
              <th className="py-3 px-4 text-left font-semibold">Uploaded At</th>
              <th className="py-3 px-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  No invoices found for this filter.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv, index) => {
                const invoiceRate =
                  inv.gstRateInvoice ?? (inv as any).gstRate ?? null;
                const cbicRate =
                  inv.gstRateAdjusted ?? inv.verifiedRate ?? invoiceRate;

                const uploadedAt =
                  inv.uploadedAt || inv.parsedAt || inv.createdAt;

                const isMismatch = !inv.gstVerified;

                return (
                  <tr
                    key={inv._id || index}
                    className={`border-t hover:bg-gray-50 transition-colors ${
                      isMismatch ? "bg-red-50/40" : ""
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      {inv.vendor || "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {inv.invoiceNo || "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {inv.gstin || "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
  <span
    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold
      ${
        inv.transactionType === "SALE"
          ? "bg-blue-100 text-blue-700"
          : "bg-green-100 text-green-700"
      }`}
  >
    {inv.transactionType === "SALE" ? "Sale" : "Purchase"}
  </span>
</td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {inv.hsn || "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {invoiceRate != null ? `${invoiceRate}%` : "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-purple-700">
                      {cbicRate != null ? `${cbicRate}%` : "—"}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold mr-1 ${
                          inv.gstVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {inv.gstVerified ? "✅ Correct" : "⚠ Corrected (CBIC)"}
                      </span>
                      {inv.verificationMessage && (
                        <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                          {inv.verificationMessage}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {uploadedAt
                        ? new Date(uploadedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewPdf(inv)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          📄 View
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
