"use client";
import React from "react";

export default function GSTReport({ data }: { data: any }) {
  if (!data || !data.parsed) return null;
  const p = data.parsed;

  const verified = !!p.gstVerified;
  const borderClass = verified
    ? "border-green-400 bg-green-50"
    : "border-red-400 bg-red-50";

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4 max-w-3xl">
      <h3 className="text-xl font-semibold">🧾 Extracted GST Details</h3>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-gray-500">Vendor</p>
          <p className="font-medium">{p.vendor ?? "Not found"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Invoice No</p>
          <p className="font-medium">{p.invoiceNo ?? "Not found"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-medium">{p.date ?? "Not found"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">GSTIN</p>
          <p className="font-medium">{p.gstin ?? "Not found"}</p>
        </div>
      </div>

      {/* Total */}
      <div className="p-3 border rounded">
        <p className="text-sm text-gray-500">Total (incl. GST)</p>
        <p className="font-semibold text-lg">{p.total ?? "N/A"}</p>
      </div>

      {/* 🧮 Section 1: GST as per Invoice */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          GST as per Invoice
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border rounded">
            <p className="text-sm text-gray-500">GST Rate (invoice)</p>
            <p className="font-semibold text-lg">{p.gstRate ?? "N/A"}</p>
          </div>
          <div className="p-3 border rounded">
            <p className="text-sm text-gray-500">GST Amount (invoice)</p>
            <p className="font-semibold text-lg">{p.gstAmount ?? "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 border rounded">
            <p className="text-sm text-gray-500">CGST (invoice)</p>
            <p className="font-medium">{p.cgst ?? "N/A"}</p>
          </div>
          <div className="p-3 border rounded">
            <p className="text-sm text-gray-500">SGST (invoice)</p>
            <p className="font-medium">{p.sgst ?? "N/A"}</p>
          </div>
          <div className="p-3 border rounded">
            <p className="text-sm text-gray-500">IGST (invoice)</p>
            <p className="font-medium">{p.igst ?? "N/A"}</p>
          </div>
        </div>
      </div>

      {/* GST Verification Message (Second) */}
      <div className={`p-4 rounded border-l-4 ${borderClass}`}>
        <p className="font-semibold">
          {verified ? "GST Verification ✅" : "GST Verification ⚠️"}
        </p>
        <p className="mt-1">{p.verificationMessage}</p>
        <p className="text-xs text-gray-500 mt-1">
          CBIC verified rate: {p.verifiedRate ?? "N/A"} (as per CBIC)
        </p>
      </div>

      {/* 🧮 Section 2: GST as per CBIC (only if mismatch) */}
      {!p.gstVerified && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-red-600">
            GST as per CBIC rate
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 border rounded bg-red-50">
              <p className="text-sm text-gray-500">GST Rate (CBIC)</p>
              <p className="font-semibold text-lg text-red-600">
                {p.adjustedGstRate ?? "N/A"}
              </p>
            </div>
            <div className="p-3 border rounded bg-red-50">
              <p className="text-sm text-gray-500">GST Amount (CBIC)</p>
              <p className="font-semibold text-lg text-red-600">
                {p.adjustedGstAmount ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 border rounded bg-red-50">
              <p className="text-sm text-gray-500">CGST (CBIC)</p>
              <p className="font-medium text-red-600">{p.adjustedCgst ?? "N/A"}</p>
            </div>
            <div className="p-3 border rounded bg-red-50">
              <p className="text-sm text-gray-500">SGST (CBIC)</p>
              <p className="font-medium text-red-600">{p.adjustedSgst ?? "N/A"}</p>
            </div>
            <div className="p-3 border rounded bg-red-50">
              <p className="text-sm text-gray-500">IGST (CBIC)</p>
              <p className="font-medium text-red-600">{p.adjustedIgst ?? "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Product / HSN */}
      <div className="border rounded p-3">
        <p className="text-sm text-gray-500">Detected product / description</p>
        <p className="font-medium">{p.product ?? "Not found"}</p>

        <p className="text-sm text-gray-500 mt-2">HSN</p>
        <p className="font-medium">{p.hsn ?? "Not found"}</p>
      </div>
    </div>
  );
}