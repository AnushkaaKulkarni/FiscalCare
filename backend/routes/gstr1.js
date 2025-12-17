import express from "express";
import auth from "../middlewares/auth.js";
import Invoice from "../models/Invoice.js";

const router = express.Router();

// ✅ GSTR-1 → SALE invoices ONLY
router.get("/", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({
      user: req.user.id,
      transactionType: "SALE"
    }).sort({ createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch GSTR-1 data" });
  }
});

export default router;
