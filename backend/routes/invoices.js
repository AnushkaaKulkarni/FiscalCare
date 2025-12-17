// backend/routes/invoices.js
import express from "express";
import auth from "../middlewares/auth.js"; // JWT middleware
import Invoice from "../models/Invoice.js";

const router = express.Router();

// ✅ Get invoices only for logged-in user (for dashboard & GST filing)
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const invoices = await Invoice.find({
      user: userId
    }).sort({ createdAt: -1 });


    return res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    return res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

// 🗑 DELETE /api/invoices/:id  → delete invoice for this user
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const invoiceId = req.params.id;

    // Ensure this invoice actually belongs to the logged-in user
    const invoice = await Invoice.findOne({ _id: invoiceId, user: userId });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await invoice.deleteOne();

    return res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    return res.status(500).json({ message: "Failed to delete invoice" });
  }
});

export default router;
