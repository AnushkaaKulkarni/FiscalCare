"use client";

import React, { useEffect, useState } from "react";

interface Invoice {
  _id: string;
  vendor: string;
  invoiceNo: string;
  gstin: string;
  gstRate: string;
  gstVerified: boolean;
  verificationMessage: string;
  uploadedAt: string;
}

interface DashboardContentProps {
  activeSection: string;
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch invoices when switching to Overview or Invoices section
  useEffect(() => {
    if (activeSection === "overview" || activeSection === "invoices") {
      fetchInvoices();
    }
  }, [activeSection]);

  // ✅ Fetch from backend
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* 🧾 OVERVIEW SECTION                                                    */
  /* ---------------------------------------------------------------------- */
  if (activeSection === "overview") {
    const total = invoices.length;
    const verified = invoices.filter((i) => i.gstVerified).length;
    const mismatched = invoices.filter((i) => !i.gstVerified).length;

    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">📊 Overview Dashboard</h1>

        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-green-100 border border-green-300 p-4 rounded-xl shadow">
              <p className="text-lg font-semibold text-green-800">✅ Verified Invoices</p>
              <p className="text-3xl font-bold text-green-700 mt-2">{verified}</p>
            </div>

            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-xl shadow">
              <p className="text-lg font-semibold text-yellow-800">⚠️ Mismatched Invoices</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">{mismatched}</p>
            </div>

            <div className="bg-blue-100 border border-blue-300 p-4 rounded-xl shadow">
              <p className="text-lg font-semibold text-blue-800">📦 Total Invoices</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{total}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* 📜 INVOICES SECTION                                                    */
  /* ---------------------------------------------------------------------- */
  if (activeSection === "invoices") {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">📑 All Invoices</h1>

        {loading ? (
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-gray-600">No invoices uploaded yet.</p>
        ) : (
          <table className="w-full border-collapse border text-sm shadow-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Vendor</th>
                <th className="p-2 text-left">Invoice No</th>
                <th className="p-2 text-left">GSTIN</th>
                <th className="p-2 text-left">GST Rate</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Uploaded At</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-2">{inv.vendor || "—"}</td>
                  <td className="p-2">{inv.invoiceNo || "—"}</td>
                  <td className="p-2">{inv.gstin || "—"}</td>
                  <td className="p-2">{inv.gstRate}</td>
                  <td
                    className={`p-2 font-semibold ${
                      inv.gstVerified ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {inv.gstVerified ? "✅ Verified" : "⚠️ Mismatch"}
                  </td>
                  <td className="p-2">
                    {new Date(inv.uploadedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* 🧾 DEFAULT SECTION (Placeholder for future tabs like Filing)           */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 capitalize">
        {activeSection.replace("-", " ")}
      </h1>
      <p className="text-gray-700">Coming soon...</p>
    </div>
  );
}
