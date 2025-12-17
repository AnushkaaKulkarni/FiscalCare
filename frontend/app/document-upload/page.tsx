// frontend/app/document-upload/page.tsx
"use client";

import React, { useState } from "react";
import GSTReport from "../components/GSTReport";
import { useRouter } from "next/navigation";
import { JSX } from "react/jsx-runtime";


export default function DocumentUpload(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [transactionType, setTransactionType] = useState<"SALE" | "PURCHASE">("PURCHASE");
  const [gstData, setGstData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const token = localStorage.getItem("fiscalcare_token");
    const user = localStorage.getItem("fiscalcare_user");
    if (!token || !user) {
      alert("You must be logged in to upload. Please sign in.");
      router.push("/");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("transactionType", transactionType);


    try {
      console.log("🔐 Upload token length:", token ? token.length : "no-token");

      const res = await fetch("http://localhost:5000/api/parse", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text().catch(() => null);
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        const isPdfParse =
          data &&
          (data.error === "PDF_PARSE_ERROR" ||
            data.message?.includes("not a readable text PDF"));

        if (isPdfParse) {
          alert(
            "This PDF could not be read properly. " +
              "It may be a scanned/flattened or corrupted file.\n\n" +
              "Please export/download the invoice again as a standard PDF and re-upload."
          );
        } else {
          const serverMsg =
            (data && (data.message || data.error)) || text || res.statusText;
          alert(`Upload failed: ${serverMsg}`);
        }

        console.error("Upload failed:", data || text);
        setLoading(false);
        return;
      }

      console.log("Parsed GST Data:", data);
      setGstData(data);
      alert("Upload & parse successful.");
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Error parsing invoice. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
    <div
      className={`h-full mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden
      ${gstData ? "max-w-7xl" : "max-w-4xl"}`}
    >
      <div
        className={`h-full grid transition-all duration-300
        ${gstData ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
      >
        {/* ================= LEFT PANEL ================= */}
        <div className="h-full p-8 sm:p-10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700 mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Secure & Automated Invoice Processing
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Upload Invoice PDF
            </h1>

            <p className="mt-2 text-slate-600 text-sm max-w-md">
              Upload GST invoice PDF. AI extracts and verifies GST automatically.
            </p>
          </div>

          {/* Upload Area */}
          <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-blue-400 rounded-2xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition shadow-sm">
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                📄
              </div>
              <span className="font-semibold text-blue-700">
                Select PDF File
              </span>
              <span className="text-xs text-slate-600 mt-1">
                GST Invoice PDFs only
              </span>
            </div>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Invoice Type */}
          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-700 mb-1 block">
              Invoice Type
            </label>
            <select
              value={transactionType}
              onChange={(e) =>
                setTransactionType(e.target.value as "SALE" | "PURCHASE")
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="SALE">Sale</option>
              <option value="PURCHASE">Purchase</option>
            </select>
          </div>

          {/* File Info */}
          <div className="mt-3 text-sm text-slate-600 h-5">
            {file ? `Selected: ${file.name}` : "No file selected"}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>🚀 Upload & Parse</>
            )}
          </button>

          {/* Navigation */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { label: "Home", route: "/" },
              { label: "Dashboard", route: "/dashboard" },
              { label: "GSTR-1", route: "/gst-filing" },
              { label: "GSTR-2A", route: "/gstr2a" },
              { label: "GSTR-2B", route: "/gstr2b" },
              { label: "GSTR-3B", route: "/gstr3b-summary" },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => router.push(btn.route)}
                className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm hover:shadow-md"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Voice Entry */}
          <div className="mt-auto pt-6">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between shadow-lg">
              <div>
                <p className="font-bold">🎤 Voice Entry</p>
                <p className="text-xs text-indigo-100">
                  Dictate invoice hands-free
                </p>
              </div>
              <button
                onClick={() => router.push("/voice-entry")}
                className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Try →
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        {gstData && (
          <div className="h-full border-l border-slate-200 bg-slate-50 p-8 overflow-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Parsed Invoice Data
            </h2>

            <GSTReport data={gstData} />
          </div>
        )}
      </div>
    </div>
  </div>
);

}
