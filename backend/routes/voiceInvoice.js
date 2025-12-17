// backend/routes/voiceInvoice.js
import express from "express";
import Invoice from "../models/Invoice.js";
import auth from "../middlewares/auth.js";
import path from "path";

const router = express.Router();

// Use 'py' on Windows, 'python3' on Linux/Mac
const PYTHON_CMD = process.platform === "win32" ? "py" : "python3";

function toNum(v, def = 0) {
  if (v === null || v === undefined || v === "") return def;
  const n =
    typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : def;
}

router.post("/", auth, async (req, res) => {
  try {
    console.log("🔊 Voice invoice request body:", req.body);

    const {
      rawText = "",
      vendor,
      invoiceNo,
      date,
      gstin,
      hsn,
      total,
      gstRate,
    } = req.body || {};

    // ✅ Require at least some invoice data
    const hasAny =
      (rawText && rawText.trim().length > 0) ||
      vendor ||
      invoiceNo ||
      date ||
      gstin ||
      hsn ||
      total !== undefined ||
      gstRate !== undefined;

    if (!hasAny) {
      return res.status(400).json({
        error:
          "No invoice data received. Please speak or fill at least one field.",
      });
    }

    const cleanRaw = rawText ? String(rawText) : "";

    const totalNum = toNum(total, 0); // assume total includes GST
    const gstRateInvoiceNum = toNum(gstRate, 0); // user / voice GST rate

    // 1️⃣ Compute GST from invoice rate (user rate)
    let invGstAmount = 0;
    let taxableValue = totalNum;
    let invCgst = 0;
    let invSgst = 0;
    let invIgst = 0; // we treat VOICE invoices as CGST+SGST by default

    if (totalNum && gstRateInvoiceNum > 0) {
      invGstAmount = +(
        (totalNum * gstRateInvoiceNum) /
        (100 + gstRateInvoiceNum)
      ).toFixed(2);
      taxableValue = +(totalNum - invGstAmount).toFixed(2);
      invCgst = +(invGstAmount / 2).toFixed(2);
      invSgst = +(invGstAmount / 2).toFixed(2);
      invIgst = 0;
    }

    // 2️⃣ Call CBIC helper (fetch_gst_rate.py) using HSN if possible
    const keyword =
      hsn && String(hsn).trim()
        ? String(hsn).trim()
        : "general";

    const gstScriptPath = path.join(process.cwd(), "scripts", "fetch_gst_rate.py");

    console.log("🐍 Calling CBIC rate script with keyword:", keyword);

    const { spawn } = await import("child_process");
    let pyOut = "";
    let pyErr = "";

    await new Promise((resolve, reject) => {
      const py = spawn(PYTHON_CMD, [gstScriptPath, String(keyword)]);

      py.stdout.on("data", (d) => {
        pyOut += d.toString();
      });

      py.stderr.on("data", (d) => {
        const msg = d.toString();
        pyErr += msg;
        console.error("🐍 CBIC Python STDERR:", msg);
      });

      py.on("error", (err) => {
        console.error("❌ Python spawn error (CBIC):", err);
        // don't reject immediately; we’ll fall back to 18%
        resolve();
      });

      py.on("close", (code) => {
        console.log("🔔 CBIC python closed, code:", code, "output:", pyOut);
        resolve();
      });
    });

    let verifiedRate = 18;

    try {
      if (pyOut.trim()) {
        const parsed = JSON.parse(pyOut);
        if (parsed && parsed.rate) {
          verifiedRate = Number(
            String(parsed.rate).replace("%", "").trim()
          );
        }
      }
    } catch (e) {
      console.warn("⚠️ Could not parse python output for CBIC rate:", e);
      verifiedRate = gstRateInvoiceNum || 18;
    }

    if (!Number.isFinite(verifiedRate) || verifiedRate <= 0) {
      verifiedRate = gstRateInvoiceNum || 18;
    }

    console.log(
      "ℹ Voice invoice — invoiceRate:",
      gstRateInvoiceNum,
      "CBIC verifiedRate:",
      verifiedRate
    );

    // 3️⃣ Compare invoice rate vs CBIC rate
    const gstVerified =
      gstRateInvoiceNum > 0 &&
      verifiedRate > 0 &&
      Number(verifiedRate) === Number(gstRateInvoiceNum);

    // 4️⃣ Compute adjusted GST as per CBIC rate (for mismatch)
    let adjustedGstRate = gstRateInvoiceNum || verifiedRate;
    let adjustedGstAmount = invGstAmount;
    let adjustedCgst = invCgst;
    let adjustedSgst = invSgst;
    let adjustedIgst = invIgst;

    if (!gstVerified && totalNum && verifiedRate > 0) {
      adjustedGstRate = verifiedRate;
      adjustedGstAmount = +(
        (totalNum * verifiedRate) /
        (100 + verifiedRate)
      ).toFixed(2);
      adjustedCgst = +(adjustedGstAmount / 2).toFixed(2);
      adjustedSgst = +(adjustedGstAmount / 2).toFixed(2);
      adjustedIgst = 0;
    }

    const verificationMessage = gstVerified
      ? `✅ Voice invoice verified: rate ${gstRateInvoiceNum}% matches CBIC ${verifiedRate}%`
      : `⚠️ Voice invoice mismatch: user rate ${
          gstRateInvoiceNum || "N/A"
        }% vs CBIC ${verifiedRate}%. Tax auto-recomputed as per CBIC rate.`;

    // 5️⃣ Build and save Invoice document
    const invoiceDoc = new Invoice({
      user: req.user ? req.user.id : null,
      source: "VOICE",

      rawText: cleanRaw || null,

      vendor: vendor || "Not provided",
      invoiceNo: invoiceNo || "Not provided",
      date: date || "Not provided",
      gstin: gstin || "Not provided",
      hsn: hsn || "Not provided",

      totalInvoice: totalNum,
      totalInvoiceDisplay: totalNum
        ? `₹${totalNum.toLocaleString("en-IN")}`
        : "N/A",
      taxableValue,
      totalWithGst: totalNum,

      gstRateInvoice: gstRateInvoiceNum,
      gstAmountInvoice: invGstAmount,
      cgstInvoice: invCgst,
      sgstInvoice: invSgst,
      igstInvoice: invIgst,

      fileName: null,
      filePath: null,
      product: "Voice-entry invoice",
      lineItems: [],

      verifiedRate,
      gstRateAdjusted: adjustedGstRate,
      totalGstAdjusted: adjustedGstAmount,
      cgstAdjusted: adjustedCgst,
      sgstAdjusted: adjustedSgst,
      igstAdjusted: adjustedIgst,

      gstVerified,
      verificationMessage,

      parseWarnings: [],
      reviewed: false,
      invoiceType: "VOICE",
      confidenceScore: 0.5,
    });

    const saved = await invoiceDoc.save();
    console.log("✅ Voice invoice saved:", saved._id.toString());

    return res.json({
      message: "Voice invoice saved successfully",
      invoiceId: saved._id,
      invoice: {
        vendor: saved.vendor,
        invoiceNo: saved.invoiceNo,
        date: saved.date,
        gstin: saved.gstin,
        hsn: saved.hsn,
        totalInvoice: saved.totalInvoice,
        gstRateInvoice: saved.gstRateInvoice,
        gstAmountInvoice: saved.gstAmountInvoice,
        verifiedRate: saved.verifiedRate,
        gstRateAdjusted: saved.gstRateAdjusted,
        totalGstAdjusted: saved.totalGstAdjusted,
        gstVerified: saved.gstVerified,
        verificationMessage: saved.verificationMessage,
      },
    });
  } catch (err) {
    console.error("❌ Voice invoice save error:", err);
    return res.status(500).json({
      error: "Failed to save voice invoice",
      details: String(err.message || err),
    });
  }
});

export default router;
