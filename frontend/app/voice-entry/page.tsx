"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

type MissingField =
  | "vendor"
  | "invoiceNo"
  | "date"
  | "gstin"
  | "hsn"
  | "total"
  | "gstRate";

interface ExtractedFields {
  vendor?: string;
  invoiceNo?: string;
  date?: string;
  gstin?: string;
  hsn?: string;
  total?: number;
  gstRate?: number;
}

type Status = "idle" | "recording" | "preview-ready" | "saving";
type RecordMode = "fresh" | "continue";

// 🔍 Parse text into structured invoice fields
function extractFromText(text: string): {
  fields: ExtractedFields;
  missing: MissingField[];
} {
  const original = text || "";
  const t = original.toLowerCase();

  const fields: ExtractedFields = {};

  // ---------- Vendor ----------
  const vendorMatch =
    original.match(/vendor\s+([A-Za-z0-9&.,\-\s]{2,80})/i) ||
    original.match(/from\s+([A-Za-z0-9&.,\-\s]{2,80})/i);

  if (vendorMatch?.[1]) {
    fields.vendor = vendorMatch[1].trim();
  }

  // ---------- Invoice number ----------
  // "invoice number INV-2025-014"
  const invoiceLabel =
    original.match(
      /invoice\s*(?:number|no\.?|#)?\s*[:\-]?\s*([A-Za-z0-9\-\/ ]{3,40})/i
    ) ||
    original.match(
      /bill\s*(?:number|no\.?)\s*[:\-]?\s*([A-Za-z0-9\-\/ ]{3,40})/i
    );

  // Loose pattern like "INV-2025-014"
  const invoiceLoose = !invoiceLabel
    ? original.match(/\b(INV[ A-Z0-9\-\/]{3,})\b/i)
    : null;

  if (invoiceLabel?.[1]) {
    fields.invoiceNo = invoiceLabel[1].replace(/\s+/g, "").trim();
  } else if (invoiceLoose?.[1]) {
    fields.invoiceNo = invoiceLoose[1].replace(/\s+/g, "").trim();
  }

  // ---------- Date ----------
  const dateMatch =
    original.match(
      /date\s*[:\-]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i
    ) ||
    original.match(
      /date\s*[:\-]?\s*(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})/i
    ) ||
    original.match(
      /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/
    );

  if (dateMatch?.[1]) {
    fields.date = dateMatch[1].trim();
  }

  // ---------- GSTIN ----------
  // Allow spaces inside (voice sometimes does "27 ABCDE 1234 F 1 Z 5")
  const gstinBlock =
    original.match(
      /(gstin|g s t i n)\s*[:\-]?\s*([0-9A-Z\s]{10,30})/i
    ) ||
    original.match(/\b(\d{2}\s*[A-Z]{3,6}\s*\d{4}\s*[A-Z0-9\s]{3,})\b/i);

  if (gstinBlock?.[2]) {
    const candidate = gstinBlock[2].replace(/\s+/g, "").toUpperCase();
    // Classic 15-char GSTIN: 2 digits + 5 letters + 4 digits + 3 alphanum
    if (/^\d{2}[A-Z]{5}\d{4}[A-Z0-9]{3}$/.test(candidate)) {
      fields.gstin = candidate;
    }
  } else {
    // fallback strict pattern with no spaces
    const strict = original.match(
      /\b(\d{2}[A-Z]{5}\d{4}[A-Z0-9]{3})\b/i
    );
    if (strict?.[1]) {
      fields.gstin = strict[1].toUpperCase();
    }
  }

  // ---------- HSN ----------
  const hsnMatch =
    original.match(/hsn\s*(?:code)?\s*[:\-]?\s*(\d{4,8})/i) ||
    original.match(/\bhsn\s+(\d{4,8})\b/i);

  if (hsnMatch?.[1]) {
    fields.hsn = hsnMatch[1].trim();
  }

  // ---------- Total amount (incl. GST) ----------
  // We rely on digits (speech engine usually gives numbers as digits)
  const totalMatch =
    original.match(
      /(total|invoice\s*value|amount\s*payable)[^0-9]{0,25}(?:rupees|rs|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i
    ) ||
    original.match(
      /(?:rupees|rs|₹)\s*([\d,]+(?:\.\d{1,2})?).{0,20}(total|invoice|amount)/i
    );

  if (totalMatch) {
    const numStr = (totalMatch[2] || totalMatch[1]).replace(/,/g, "");
    const n = Number(numStr);
    if (Number.isFinite(n) && n > 0) {
      fields.total = n;
    }
  }

  // ---------- GST rate ----------
  const rateMatch =
    original.match(
      /gst\s*rate\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*%/i
    ) ||
    original.match(
      /(\d{1,2}(?:\.\d{1,2})?)\s*percent\s*(?:gst|tax)?/i
    );

  if (rateMatch?.[1]) {
    const n = Number(rateMatch[1]);
    if (Number.isFinite(n)) {
      fields.gstRate = n;
    }
  }

  // ---------- Missing fields ----------
  const missing: MissingField[] = [];
  if (!fields.vendor) missing.push("vendor");
  if (!fields.invoiceNo) missing.push("invoiceNo");
  if (!fields.date) missing.push("date");
  if (!fields.gstin) missing.push("gstin");
  if (!fields.hsn) missing.push("hsn");
  if (fields.total === undefined) missing.push("total");
  if (fields.gstRate === undefined) missing.push("gstRate");

  return { fields, missing };
}


export default function VoiceEntryPage() {
  const router = useRouter();

  const [rawText, setRawText] = useState("");
  const [vendor, setVendor] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [date, setDate] = useState("");
  const [gstin, setGstin] = useState("");
  const [hsn, setHsn] = useState("");
  const [total, setTotal] = useState<number | "">("");
  const [gstRate, setGstRate] = useState<number | "">("");

  const [missing, setMissing] = useState<MissingField[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [recordMode, setRecordMode] = useState<RecordMode>("fresh");

  const recognitionRef = useRef<any | null>(null);

  const hasAnyField =
    vendor ||
    invoiceNo ||
    date ||
    gstin ||
    hsn ||
    total !== "" ||
    gstRate !== "";

  // 🎙 Start browser speech recognition
  const startRecording = (mode: RecordMode) => {
    setRecordMode(mode);

    // Starting fresh → clear everything
    if (mode === "fresh") {
      setRawText("");
      setVendor("");
      setInvoiceNo("");
      setDate("");
      setGstin("");
      setHsn("");
      setTotal("");
      setGstRate("");
      setMissing([]);
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setStatus("recording");
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      alert("Voice recognition error. Please try again.");
      setStatus("idle");
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      console.log("🎙 Transcript:", result);

      const combinedText =
        mode === "continue" && rawText
          ? `${rawText} ${result}`
          : result;

      setRawText(combinedText);

      const { fields, missing } = extractFromText(combinedText);

      // Only overwrite when new values are available
      if (fields.vendor) setVendor((prev) => prev || fields.vendor!);
      if (fields.invoiceNo)
        setInvoiceNo((prev) => prev || fields.invoiceNo!);
      if (fields.date) setDate((prev) => prev || fields.date!);
      if (fields.gstin) setGstin((prev) => prev || fields.gstin!);
      if (fields.hsn) setHsn((prev) => prev || fields.hsn!);

      if (fields.total !== undefined)
        setTotal((prev) => (prev === "" ? fields.total! : prev));
      if (fields.gstRate !== undefined)
        setGstRate((prev) => (prev === "" ? fields.gstRate! : prev));

      setMissing(missing);
      setStatus("preview-ready");
    };

    recognition.onend = () => {
      if (status === "recording") {
        setStatus("idle");
      }
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStatus("idle");
  };

  // 🔁 Re-extract from manually edited text
  const handleReExtract = () => {
    if (!rawText.trim()) return;
    const { fields, missing } = extractFromText(rawText);

    if (fields.vendor) setVendor(fields.vendor);
    if (fields.invoiceNo) setInvoiceNo(fields.invoiceNo);
    if (fields.date) setDate(fields.date);
    if (fields.gstin) setGstin(fields.gstin);
    if (fields.hsn) setHsn(fields.hsn);
    if (fields.total !== undefined) setTotal(fields.total);
    if (fields.gstRate !== undefined) setGstRate(fields.gstRate);

    setMissing(missing);
    setStatus("preview-ready");
  };

  const handleSave = async () => {
    const token = localStorage.getItem("fiscalcare_token");
    const user = localStorage.getItem("fiscalcare_user");

    if (!token || !user) {
      alert("Please log in again to save invoice.");
      router.push("/");
      return;
    }

    if (!rawText.trim() && !hasAnyField) {
      alert("No voice text or fields to save. Please record first.");
      return;
    }

    setStatus("saving");

    const payload = {
      rawText,
      vendor: vendor || undefined,
      invoiceNo: invoiceNo || undefined,
      date: date || undefined,
      gstin: gstin || undefined,
      hsn: hsn || undefined,
      total: total === "" ? undefined : total,
      gstRate: gstRate === "" ? undefined : gstRate,
    };

    try {
      const res = await fetch(`${API_BASE}/api/voice-to-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => "");
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        console.error("Save error:", data);
        alert(
          data.error ||
            data.message ||
            "Failed to save invoice (check backend logs)."
        );
        setStatus("preview-ready");
        return;
      }

      alert("✅ Voice invoice saved successfully.");
      setStatus("idle");
      // Optional: router.push("/dashboard");
    } catch (err) {
      console.error("Error saving invoice:", err);
      alert("Network or server error while saving invoice.");
      setStatus("preview-ready");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full bg-slate-900/90 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              🎤 Voice Invoice Entry
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Speak your invoice details naturally. We convert speech into a
              structured GST invoice and send it to the backend for saving.
            </p>
          </div>
          <button
            onClick={() => router.push("/document-upload")}
            className="px-4 py-2 rounded-full bg-slate-100 text-slate-900 text-xs sm:text-sm font-semibold hover:bg-white shadow"
          >
            ⬅ Back to Upload Page
          </button>
        </div>

        {/* Recording controls */}
        <div className="bg-slate-800/70 rounded-2xl p-4 mb-5 flex flex-col gap-3">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="text-sm text-slate-200 max-w-md">
              <span className="font-semibold">Tip:</span> Say something like:{" "}
              <span className="italic text-slate-100">
                “Vendor GadgetHub India Private Limited, invoice number
                INV-2025-014, invoice date 15 November 2025, GSTIN
                27ABCDE1234F1Z5, HSN code 8471, total amount including GST
                rupees 25,000, GST rate 18 percent.”
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => startRecording("fresh")}
                disabled={status === "recording"}
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                🎙 Start Fresh
              </button>
              <button
                onClick={() => startRecording("continue")}
                disabled={status === "recording" && recordMode === "continue"}
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
              >
                🔁 Continue Speaking
              </button>
              {status === "recording" && (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-red-500 text-white hover:bg-red-600"
                >
                  ⏹ Stop
                </button>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>
              Mode:{" "}
              <span className="font-mono">
                {status === "recording"
                  ? recordMode === "fresh"
                    ? "Recording (fresh)"
                    : "Recording (continue)"
                  : "Idle"}
              </span>
            </span>
          </div>
        </div>

        {/* Raw text preview + re-extract */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-300">
              Recognized Text
            </label>
            <button
              type="button"
              onClick={handleReExtract}
              disabled={!rawText.trim()}
              className="text-[11px] px-2 py-1 rounded-full bg-slate-700 text-slate-100 disabled:opacity-40"
            >
              🔄 Re-extract fields
            </button>
          </div>
          <textarea
            className="w-full h-24 sm:h-28 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-slate-100 resize-none"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Your spoken text will appear here. You can edit this and click “Re-extract fields”."
          />
        </div>

        {/* Parsed fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-300 mb-1">Vendor</label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">Invoice No</label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">Invoice Date</label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">GSTIN</label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">HSN</label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              value={hsn}
              onChange={(e) => setHsn(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">
              Total Amount (incl. GST)
            </label>
            <input
              type="number"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              value={total === "" ? "" : total}
              onChange={(e) =>
                setTotal(e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">GST Rate (%)</label>
            <input
              type="number"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              value={gstRate === "" ? "" : gstRate}
              onChange={(e) =>
                setGstRate(e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>
        </div>

        {/* Missing fields info */}
        {hasAnyField && (
          <div className="mb-4 text-xs text-slate-300">
            {missing.length === 0 ? (
              <span className="text-emerald-400">
                ✅ All key fields detected. You can save this invoice.
              </span>
            ) : (
              <>
                <span className="text-yellow-300 font-semibold">
                  ⚠ Missing / unclear:
                </span>{" "}
                {missing.join(", ")} (you can fill them manually or continue
                speaking).
              </>
            )}
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={!hasAnyField || status === "saving"}
            className="px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "💾 Save Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
