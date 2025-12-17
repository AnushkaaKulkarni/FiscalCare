// backend/routes/gstr3b.js
import express from "express";
import auth from "../middlewares/auth.js";
import Invoice from "../models/Invoice.js";

const router = express.Router();

router.get("/summary", auth, async (req, res) => {
  try {
    let { month } = req.query; // "YYYY-MM"
    let year, monthIndex;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const parts = month.split("-");
      year = Number(parts[0]);
      monthIndex = Number(parts[1]) - 1; // 0-based
    } else {
      // fallback to current calendar month
      const now = new Date();
      year = now.getFullYear();
      monthIndex = now.getMonth();
      month = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    }

    const start = new Date(year, monthIndex, 1);      // e.g. 2025-11-01
    const end = new Date(year, monthIndex + 1, 1);    // e.g. 2025-12-01 (exclusive)

    // ✅ Filter by invoiceDate, NOT createdAt
    const invoices = await Invoice.find({
      user: req.user.id,
      invoiceDate: { $gte: start, $lt: end },   // <-- key line
    });

    // If some older invoices don't have invoiceDate, you can optionally
    // also include those by createdAt as a fallback:
    // const invoices = await Invoice.find({
    //   user: req.user.id,
    //   $or: [
    //     { invoiceDate: { $gte: start, $lt: end } },
    //     { invoiceDate: null, createdAt: { $gte: start, $lt: end } },
    //   ],
    // });

    // Compute summary
    let invoiceCount = invoices.length;
    let b2bCount = 0;
    let b2cCount = 0;
    let taxableTotal = 0;
    let igstTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;

    for (const inv of invoices) {
      const gstin = inv.gstin || inv.supplierGstin || "Not found";
      const isB2B = gstin && gstin !== "Not found";

      if (isB2B) b2bCount++;
      else b2cCount++;

      const taxable = Number(inv.taxableValue || inv.totalInvoice || 0) || 0;

      const igst = Number(inv.igstAdjusted ?? inv.igstInvoice ?? 0) || 0;
      const cgst = Number(inv.cgstAdjusted ?? inv.cgstInvoice ?? 0) || 0;
      const sgst = Number(inv.sgstAdjusted ?? inv.sgstInvoice ?? 0) || 0;

      taxableTotal += taxable;
      igstTotal += igst;
      cgstTotal += cgst;
      sgstTotal += sgst;
    }

    const totalTax = igstTotal + cgstTotal + sgstTotal;

    return res.json({
      month, // "2025-11"
      invoiceCount,
      b2bCount,
      b2cCount,
      taxableTotal,
      igstTotal,
      cgstTotal,
      sgstTotal,
      totalTax,
    });
  } catch (err) {
    console.error("❌ GSTR-3B summary error:", err);
    return res.status(500).json({
      error: "GSTR3B_SUMMARY_ERROR",
      message: err.message || String(err),
    });
  }
});

export default router;
