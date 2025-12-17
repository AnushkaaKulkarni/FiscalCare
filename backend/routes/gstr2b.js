import express from "express";
import auth from "../middlewares/auth.js";
import Gstr2aEntry from "../models/Gstr2aEntry.js";

const router = express.Router();

/**
 * GET /api/gstr2b
 * Generates GSTR-2B from GSTR-2A entries
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all purchase invoices (GSTR-2A)
    const entries = await Gstr2aEntry.find({
      user: userId
    }).sort({ invoiceDate: -1 });

    let totalEligibleITC = 0;
    let totalIneligibleITC = 0;

    const invoices = entries.map((e) => {
      const eligibleITC = e.totalGST || 0;
      const ineligibleITC = 0;

      totalEligibleITC += eligibleITC;

      return {
        supplierGSTIN: e.supplierGSTIN,
        invoiceNumber: e.invoiceNumber,
        totalGST: e.totalGST,
        eligibleITC,
        ineligibleITC
      };
    });

    res.json({
      summary: {
        totalEligibleITC: Number(totalEligibleITC.toFixed(2)),
        totalIneligibleITC: Number(totalIneligibleITC.toFixed(2))
      },
      invoices
    });
  } catch (err) {
    console.error("❌ GSTR-2B error:", err);
    res.status(500).json({
      message: "Failed to generate GSTR-2B"
    });
  }
});

export default router;
