// backend/routes/parse.js
import express from "express";
import formidable from "formidable";
import fs from "fs-extra";
import path from "path";
import pdf from "pdf-parse";
import { spawn } from "child_process";
import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import auth from "../middlewares/auth.js";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Gstr2aEntry from "../models/Gstr2aEntry.js";



const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_CMD = process.platform === "win32" ? "py" : "python3";

// ---------- Helper: clean extracted text ----------
const cleanText = (t = "") =>
  t
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/[^\w\s₹%\-:.,/]/g, "")
    .trim();

// ---------- Helper: extract total (incl. "Total incl. GST") ----------
function extractTotal(text) {
  if (!text) return 0;

   const patterns = [
    /Grand\s*Total\s*[:\-]?\s*(?:₹|Rs\.?)\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /Total\s*Amount\s*(?:Due|Payable)?\s*[:\-]?\s*(?:₹|Rs\.?)\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /Net\s*Total\s*[:\-]?\s*(?:₹|Rs\.?)\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
    // 🔥 specific to "Total (incl. GST): Rs.1,25,000"
    /Total\s*\(incl\.?\s*GST\)\s*[:\-]?\s*(?:₹|Rs\.?)\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /Total\s*(?:\$?\s*incl\.?\s*GST\$?)*\s*[:\-]?\s*(?:₹|Rs\.?)\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /Amount\s*Payable\s*[:\-]?\s*(?:₹|Rs\.?)\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];


  for (const r of patterns) {
    const m = text.match(r);
    if (m && m[1]) {
      const n = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(n) && n > 0) return n;
    }
  }

  const rupees = [...text.matchAll(/(?:₹|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/g)];
  if (rupees.length) {
    const last = rupees.pop()[1].replace(/,/g, "");
    const v = parseFloat(last);
    if (!isNaN(v)) return v;
  }
  return 0;
}

// ---------- Helper: detect GST rate and type ----------
function detectGSTRate(text) {
  // 0️⃣ Explicit label: GST Rate: 5%
  const labelled = text.match(
    /GST\s*Rate\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*%?/i
  );
  if (labelled) {
    return { rate: parseFloat(labelled[1]), type: "LABELLED_GST_RATE" };
  }

  const igst = text.match(/IGST\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*%/i);
  const cgst = text.match(/CGST\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*%/i);
  const sgst = text.match(/SGST\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*%/i);

  if (igst) return { rate: parseFloat(igst[1]), type: "IGST" };
  if (cgst && sgst)
    return {
      rate: parseFloat(cgst[1]) + parseFloat(sgst[1]),
      type: "CGST_SGST",
    };

  const generic = text.match(/(\d{1,2}(?:\.\d{1,2})?)\s*%/);
  return { rate: generic ? parseFloat(generic[1]) : 18, type: "generic" };
}

// ---------- Helper: extract tax components ----------
function extractCGST(text) {
  const m = text.match(/CGST\s*[:\-]?\s*(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  return m ? parseFloat(m[1].replace(/,/g, "")) : 0;
}
function extractSGST(text) {
  const m = text.match(/SGST\s*[:\-]?\s*(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  return m ? parseFloat(m[1].replace(/,/g, "")) : 0;
}
function extractIGST(text) {
  const m = text.match(/IGST\s*[:\-]?\s*(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  return m ? parseFloat(m[1].replace(/,/g, "")) : 0;
}
function extractTotalGST(text) {
  const m = text.match(/Total\s*GST\s*[:\-]?\s*(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  return m ? parseFloat(m[1].replace(/,/g, "")) : 0;
}

// ---------- Helper: HSN & product ----------
function extractHSN(text) {
  const direct = text.match(/HSN(?:\/SAC)?\s*(?:Code|No|Number)?\s*[:\-]?\s*(\d{4,8})/i);
  if (direct && direct[1]) return direct[1];

  const candidates = [...text.matchAll(/\b(\d{4,8})\b/g)].map((m) => m[1]);
  if (!candidates.length) return "Not found";

  const filtered = candidates.filter((num) => {
    const n = parseInt(num, 10);
    if (n >= 100000 && n <= 999999) {
      const window = text.slice(0, 300);
      if (/pune|maharashtra|address|street|road/i.test(window)) return false;
    }
    return true;
  });

  for (const num of candidates) {
    const rx = new RegExp(`HSN[^0-9]{0,40}${num}`, "i");
    if (rx.test(text)) return num;
  }

  const table = text.match(/(?:Description|Item|Product|Particulars)[^0-9]{0,30}(\d{4,8})/i);
  if (table && table[1]) return table[1];

  return filtered.length ? filtered[0] : candidates[0] || "Not found";
}

function extractAllGSTINs(text) {
  const matches = [
    ...text.matchAll(/\b\d{2}[A-Z]{5}\d{4}[A-Z0-9][A-Z0-9]Z[A-Z0-9]\b/g)
  ].map(m => m[0]);

  return [...new Set(matches)];
}


function extractProduct(text) {
  const desc = text.match(
    /(?:Description|Item|Product|Particulars)\s*[:\-]?\s*(?!Qty|Quantity|Rate|Price)([A-Za-z0-9\s,.\-]{3,160})/i
  );

  let product;

  if (desc && desc[1]) {
    product = desc[1].replace(/\s{2,}/g, " ").trim();

    // ❌ Remove trailing labels like "GST Rate", "GST Amount", "GST Details" etc.
    product = product.replace(
      /\b(GST\s*Rate|GST\s*Details|GST\s*Amount|Tax\s*Rate|HSN\s*Code.*)$ /i,
      ""
    ).trim();

    // Also remove any "Total ..." that might have been glued
    product = product.replace(
      /\bTotal\s*(?:incl\.?\s*GST|\(incl\.?\s*GST\))?.*$/i,
      ""
    ).trim();

    // Optional: keep only first few words so we don't pick up extra junk
    const words = product.split(/\s+/);
    if (words.length > 6) {
      product = words.slice(0, 6).join(" ");
    }

    if (product.length) return product;
  }

  // Fallback: after "Tax Invoice:"
  const afterInvoice = text.match(
    /Tax\s*Invoice\s*[:\-]?\s*([A-Za-z0-9\s,.\-]{3,60})/i
  );
  if (afterInvoice && afterInvoice[1]) {
    let p = afterInvoice[1].replace(/\s{2,}/g, " ").trim();
    p = p.replace(
      /\b(GST\s*Rate|GST\s*Details|GST\s*Amount|HSN\s*Code.*)$ /i,
      ""
    ).trim();
    if (p.length) return p;
  }

  // Tiny keyword fallback
  const small = text.match(
    /\b(laptop|mobile|phone|website|design|software|monitor|printer|table|chair|furniture|freight|transport|courier)\b/i
  );
  return small ? small[0] : "Not found";
}




// 🔎 OCR fallback using Python script (scripts/ocr_invoice.py)
async function ocrFallback(pdfPath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../scripts/ocr_invoice.py");

    const py = spawn(PYTHON_CMD, [scriptPath, pdfPath]);

    let out = "";
    let err = "";

    py.stdout.on("data", (d) => {
      out += d.toString();
    });

    py.stderr.on("data", (d) => {
      err += d.toString();
      console.error("[ocr stderr]", d.toString());
    });

    // ✅ prevent Node from crashing on spawn error
    py.on("error", (spawnErr) => {
      console.error("❌ Failed to start OCR python process:", spawnErr);
      reject(
        new Error(
          `Failed to start Python OCR process: ${
            spawnErr.message || spawnErr
          }`
        )
      );
    });

    py.on("close", (code) => {
      if (code === 0 && out.trim()) {
        console.log("✅ OCR fallback succeeded");
        resolve(out);
      } else {
        console.error("❌ OCR fallback failed, code:", code, "err:", err);
        reject(
          new Error(
            err || `OCR script exited with code ${code}, no text returned`
          )
        );
      }
    });
  });
}

function parseInvoiceDate(dateStr) {
  if (!dateStr || dateStr === "Not found") return null;

  const s = dateStr.trim();

  // Pattern: DD/MM/YYYY or DD-MM-YYYY
  let m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (m) {
    let [_, d, mo, y] = m;
    let year = y.length === 2 ? 2000 + Number(y) : Number(y);
    let monthIdx = Number(mo) - 1; // 0-based
    let day = Number(d);
    const dt = new Date(year, monthIdx, day);
    if (!isNaN(dt.getTime())) return dt;
  }

  // Pattern: 13 Nov 2025 or 13 November 2025
  m = s.match(
    /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i
  );
  if (m) {
    const day = Number(m[1]);
    const monthShort = m[2].substring(0, 3).toLowerCase();
    const year = Number(m[3]);
    const monthMap = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const monthIdx = monthMap[monthShort];
    if (monthIdx !== undefined) {
      const dt = new Date(year, monthIdx, day);
      if (!isNaN(dt.getTime())) return dt;
    }
  }

  // Final fallback – let JS try
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}


// ---------- Route: POST /api/parse ----------
router.post("/", auth, async (req, res) => {
  console.log(">>> Incoming Authorization:", req.headers?.authorization);

  const form = formidable({
    multiples: false,
    uploadDir: "./uploads",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload failed", details: err.message });
    }

    const file = files && (files.file?.[0] || files.file);
    if (!file) {
      return res
        .status(400)
        .json({ error: "No file uploaded (field name must be 'file')" });
    }

    try {
      let raw = "";
      let text = "";

      try {
        const buffer = await fs.readFile(file.filepath);

        try {
          // 1️⃣ First attempt: normal text-based PDF parsing
          const pdfData = await pdf(buffer);
          raw = pdfData.text || "";
          console.log("ℹ pdf-parse extracted length:", raw.length);
        } catch (pdfErr) {
          console.error("❌ PDF parse error:", pdfErr);

          // 2️⃣ Fallback: OCR via Python if pdf-parse fails
          try {
            raw = await ocrFallback(file.filepath);
            console.log("ℹ OCR extracted length:", raw.length);
          } catch (ocrErr) {
            console.error("❌ OCR fallback also failed:", ocrErr);
            // 🚑 DO NOT FAIL REQUEST – continue with empty text for demo stability
            raw = "";
          }
        }

        if (!raw || !raw.trim()) {
          console.warn(
            "⚠️ No readable text found; proceeding with minimal defaults"
          );
          raw = "";
          text = "";
        } else {
          text = cleanText(raw);
        }
      } catch (e) {
        console.error("❌ File read failed:", e);
        return res.status(500).json({
          error: "FILE_READ_ERROR",
          message: "Unable to read uploaded file",
          details: String(e.message || e),
        });
      }

      console.log("🔍 Text preview:", text.slice(0, 300));

            // ---------- Basic labelled extractions first (matched to your PDF format) ----------

      // ---------- Vendor ----------
let vendorMatch =
  text.match(/Vendor\s*[:\-]\s*([A-Za-z0-9 &.,\-]{2,160})/i) ||
  text.match(/Supplier\s*[:\-]\s*([A-Za-z0-9 &.,\-]{2,160})/i) ||
  text.match(/Company\s*[:\-]\s*([A-Za-z0-9 &.,\-]{2,160})/i);

let vendor = "Not found";

if (vendorMatch && vendorMatch[1]) {
  vendor = vendorMatch[1]
    // cut off if OCR glued the next label
    .replace(/\s+(Invoice|Bill)\s*No\.?.*$/i, "")
    .replace(/\s+GSTIN.*$/i, "")
    .trim();
}


      // ---------- Invoice number ----------
let invoiceNo = "Not found";

const invLabel =
  text.match(/Invoice\s*(?:No\.?|Number|#)?\s*[:\-]?\s*([A-Z0-9\-\/]{3,40})/i) ||
  text.match(/Bill\s*(?:No\.?|Number)?\s*[:\-]?\s*([A-Z0-9\-\/]{3,40})/i);

// fallback like INV-2025-014 anywhere in text
const invLoose = !invLabel
  ? text.match(/\b(INV[-A-Z0-9\/]{3,})\b/i)
  : null;

if (invLabel && invLabel[1]) {
  invoiceNo = invLabel[1].trim();
} else if (invLoose && invLoose[1]) {
  invoiceNo = invLoose[1].trim();
}

      // Date: 13/11/2025
      const date =
        text.match(
          /Date\s*[:\-]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i
        )?.[1] ||
        text.match(
          /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})\b/i
        )?.[0] ||
        "Not found";
              const invoiceDateObj = parseInvoiceDate(date);


      // GSTIN: 27AABGH3344K1Z6
      const gstin =
        text.match(
          /GSTIN\s*[:\-]?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z0-9][A-Z0-9]Z[A-Z0-9])/i
        )?.[1] ||
        text.match(
          /\b\d{2}[A-Z]{5}\d{4}[A-Z0-9][A-Z0-9]Z[A-Z0-9]\b/
        )?.[0] ||
        "Not found";


      // Totals & GST (as per invoice)
      const total = extractTotal(text); // number
      const gstInfo = detectGSTRate(text); // {rate, type}
      const gstRate = gstInfo.rate;
      let invCgst = extractCGST(text);
      let invSgst = extractSGST(text);
      let invIgst = extractIGST(text);
      let invGstAmount =
        extractTotalGST(text) || invCgst + invSgst + invIgst;

      if (invGstAmount === 0 && total && gstRate > 0) {
        invGstAmount = +(
          (total * gstRate) /
          (100 + gstRate)
        ).toFixed(2);
        if (gstInfo.type === "IGST") {
          invIgst = invGstAmount;
        } else {
          invCgst = +(invGstAmount / 2).toFixed(2);
          invSgst = +(invGstAmount / 2).toFixed(2);
        }
      }

      const product = extractProduct(text);
      const hsn = extractHSN(text);

      // 🔑 Get logged-in user's GSTIN
const userDoc = await User.findById(req.user.id).lean();
const myGSTIN = userDoc?.gstin;

// if (!myGSTIN) {
//   return res.status(400).json({
//     error: "GSTIN_NOT_SET",
//     message: "User GSTIN not found. Please set GSTIN in profile."
//   });
// }


// ---------- Decide SALE vs PURCHASE (FIXED & SAFE) ----------
// ---------- Transaction Type (FROM UI) ----------
const transactionTypeRaw = Array.isArray(fields.transactionType)
  ? fields.transactionType[0]
  : fields.transactionType;

const transactionType = String(transactionTypeRaw || "")
  .trim()
  .toUpperCase();

if (!["SALE", "PURCHASE"].includes(transactionType)) {
  return res.status(400).json({
    error: "INVALID_TRANSACTION_TYPE",
    received: transactionTypeRaw
  });
}

// ---------- FINAL GSTIN MAPPING ----------
let supplierGSTIN = "UNKNOWN";
let buyerGSTIN = "UNKNOWN";

if (transactionType === "SALE") {
  supplierGSTIN = myGSTIN;
  buyerGSTIN = gstin !== myGSTIN ? gstin : "UNKNOWN";
}

if (transactionType === "PURCHASE") {
  supplierGSTIN = gstin !== myGSTIN ? gstin : "UNKNOWN";
  buyerGSTIN = myGSTIN;
}

console.log("🧾 TX TYPE:", transactionType);
console.log("🏭 Supplier GSTIN:", supplierGSTIN);
console.log("🧍 Buyer GSTIN:", buyerGSTIN);



console.log("✔ FINAL TYPE:", transactionType);


      // Python CBIC verification
      const keyword =
        hsn && hsn !== "Not found"
          ? hsn
          : product && product !== "Not found"
          ? product.split(/\s+/)[0].toLowerCase()
          : "general";

      let pyOut = "";
      const gstScriptPath = path.join(
  __dirname,
  "..",
  "scripts",
  "fetch_gst_rate.py"
);

// ✅ use same PYTHON_CMD as OCR
const py = spawn(PYTHON_CMD, [gstScriptPath, String(keyword)]);


      py.stdout.on("data", (d) => (pyOut += d.toString()));
      py.stderr.on("data", (d) =>
        console.error("[python stderr]", d.toString())
      );
      py.on("error", (err) => {
        console.error("❌ Python spawn error:", err);
      });

      py.on("close", async () => {
        console.log("🔔 python child closed; pyOut length:", pyOut.length);

        // move uploaded file to persistent uploads dir
        let publicPath = null;
        try {
          const uploadsDir = path.join(process.cwd(), "uploads");
          await fs.ensureDir(uploadsDir);
          console.log("✔ uploadsDir exists:", uploadsDir);

          const destName = `${Date.now()}_${path.basename(
            file.filepath
          )}`;
          const destPath = path.join(uploadsDir, destName);

          await fs.move(file.filepath, destPath, { overwrite: true });
          publicPath = `/uploads/${destName}`;
          console.log(
            "✔ moved uploaded file to:",
            destPath,
            "publicPath:",
            publicPath
          );
        } catch (moveErr) {
          console.error("⚠️ Failed to move uploaded file:", moveErr);
          try {
            if (await fs.pathExists(file.filepath)) {
              publicPath = file.filepath;
              console.log("✔ temp file still exists at:", publicPath);
            } else {
              publicPath = null;
              console.log("✖ temp file not found after failure");
            }
          } catch (e) {
            console.error("⚠️ Error checking original filepath:", e);
            publicPath = null;
          }
        }

        // parse python output safely
        let verifiedRate = 18;
        try {
          const parsed = JSON.parse(pyOut || "{}");
          if (parsed && parsed.rate) {
            verifiedRate = Number(
              String(parsed.rate).replace("%", "").trim()
            );
          }
        } catch (e) {
          console.warn("⚠️ Could not parse python output:", e);
          verifiedRate = 18;
        }
        console.log(
          "ℹ verifiedRate:",
          verifiedRate,
          "detected gstRate from invoice:",
          gstRate
        );

        const gstVerified =
          Number(verifiedRate) === Number(gstRate);

        // compute adjusted gst (unchanged logic)
        let adjustedGstRate = gstRate;
        let adjustedGstAmount = invGstAmount;
        let adjustedCgst = invCgst;
        let adjustedSgst = invSgst;
        let adjustedIgst = invIgst;

        if (!gstVerified && total && verifiedRate > 0) {
          adjustedGstRate = verifiedRate;
          adjustedGstAmount = +(
            (total * verifiedRate) /
            (100 + verifiedRate)
          ).toFixed(2);
          if (gstInfo.type === "IGST") {
            adjustedIgst = adjustedGstAmount;
            adjustedCgst = 0;
            adjustedSgst = 0;
          } else {
            adjustedCgst = +(adjustedGstAmount / 2).toFixed(2);
            adjustedSgst = +(adjustedGstAmount / 2).toFixed(2);
            adjustedIgst = 0;
          }
        }

        // Build invoice document to save (include filePath)
        const invoiceDoc = new Invoice({
          user: req.user ? req.user.id : null,
          fileName:
            file.originalFilename ||
            file.newFilename ||
            path.basename(file.filepath),
          filePath: publicPath,
          rawText: raw,
          vendor,
          invoiceNo,
          date,
           invoiceDate: invoiceDateObj,
          gstin,
          totalInvoice: total || 0,
          totalInvoiceDisplay: total
            ? `₹${total.toLocaleString("en-IN")}`
            : "N/A",
          taxableValue: total || 0,
          totalWithGst: total
            ? +(total + (invGstAmount || adjustedGstAmount))
            : 0,
          gstRateInvoice: gstRate || 0,
          gstAmountInvoice: invGstAmount || 0,
          cgstInvoice: invCgst || 0,
          sgstInvoice: invSgst || 0,
          igstInvoice: invIgst || 0,
          product,
          hsn,
          lineItems: [],
          verifiedRate,
          gstRateAdjusted:
            adjustedGstRate || gstRate || verifiedRate || 0,
          totalGstAdjusted: adjustedGstAmount || invGstAmount || 0,
          cgstAdjusted: adjustedCgst || 0,
          sgstAdjusted: adjustedSgst || 0,
          igstAdjusted: adjustedIgst || 0,
          gstVerified: !!gstVerified,
          verificationMessage: gstVerified
            ? `✅ Verified: Invoice rate ${gstRate}% matches CBIC ${verifiedRate}%`
            : `⚠️ Mismatch: Invoice rate ${gstRate}% vs CBIC ${verifiedRate}% (GST adjusted as per CBIC rate)`,
          parseWarnings: [],
          reviewed: false,
          invoiceType: "UNKNOWN",
          confidenceScore: 0,
          supplierGSTIN,
          buyerGSTIN,
          transactionType,

        });

        try {
          const saved = await invoiceDoc.save();
          console.log(
            "✅ Invoice saved:",
            saved._id.toString(),
            "filePath:",
            saved.filePath
          );

          // ✅ Create GSTR-2A entry ONLY for PURCHASE invoices
if (transactionType === "PURCHASE") {
  try {
    await Gstr2aEntry.create({
      user: req.user.id,

      supplierGSTIN,
      supplierName: vendor !== "Not found" ? vendor : "UNKNOWN",

      invoiceNumber:
        invoiceNo !== "Not found" ? invoiceNo : saved._id.toString(),

      invoiceDate: invoiceDateObj || new Date(),

      taxableValue: total || 0,

      cgst: adjustedCgst || 0,
      sgst: adjustedSgst || 0,
      igst: adjustedIgst || 0,

      totalGST: adjustedGstAmount || invGstAmount || 0,
    });

    console.log("✅ PURCHASE invoice saved to GSTR-2A");
  } catch (gstr2aErr) {
    console.error("⚠️ Failed to create GSTR-2A entry:", gstr2aErr);
  }
}



          return res.json({
            parsed: {
              vendor,
              invoiceNo,
              date,
              gstin,
              total: total
                ? `₹${total.toLocaleString("en-IN")}`
                : "N/A",
              gstRate: `${gstRate}%`,
              gstAmount: total
                ? `₹${invGstAmount.toLocaleString("en-IN")}`
                : "N/A",
              cgst: total
                ? `₹${invCgst.toLocaleString("en-IN")}`
                : "N/A",
              sgst: total
                ? `₹${invSgst.toLocaleString("en-IN")}`
                : "N/A",
              igst: total
                ? `₹${invIgst.toLocaleString("en-IN")}`
                : "N/A",
              adjustedGstRate: `${adjustedGstRate}%`,
              adjustedGstAmount: total
                ? `₹${adjustedGstAmount.toLocaleString("en-IN")}`
                : "N/A",
              adjustedCgst: total
                ? `₹${adjustedCgst.toLocaleString("en-IN")}`
                : "N/A",
              adjustedSgst: total
                ? `₹${adjustedSgst.toLocaleString("en-IN")}`
                : "N/A",
              adjustedIgst: total
                ? `₹${adjustedIgst.toLocaleString("en-IN")}`
                : "N/A",
              product,
              hsn,
              verifiedRate: `${verifiedRate}%`,
              gstVerified,
              verificationMessage: saved.verificationMessage,
            },
            invoiceId: saved._id,
          });
        } catch (saveErr) {
          console.error(
            "❌ Failed to save invoice to DB:",
            saveErr
          );
          return res.status(500).json({
            error: "Parsed but failed to save invoice",
            details: String(saveErr.message),
          });
        }
      }); // end py.on('close')
    } catch (error) {
      console.error("❌ Parse error:", error);
      try {
        if (files && files.file) {
          const f =
            files.file.filepath || files.file[0]?.filepath;
          if (f) await fs.unlink(f);
        }
      } catch (e) {
        // ignore cleanup errors
      }
      return res.status(500).json({
        error: "Failed to parse invoice",
        details: String(error.message || error),
      });
    }
  }); // end form.parse
}); // end router.post

export default router;
