import express from "express";
import auth from "../middlewares/auth.js";
import Gstr2aEntry from "../models/Gstr2aEntry.js";
import ExcelJS from "exceljs";

const router = express.Router();

/**
 * GET /api/gstr2a
 */
router.get("/", auth, async (req, res) => {
  try {
    const entries = await Gstr2aEntry.find({
      user: req.user.id
    }).sort({ invoiceDate: -1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch GSTR-2A data" });
  }
});

/**
 * GET /api/gstr2a/download/json
 */
router.get("/download/json", auth, async (req, res) => {
  try {
    const data = await Gstr2aEntry.find({ user: req.user.id });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=gstr2a.json"
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to download GSTR-2A JSON" });
  }
});

/**
 * GET /api/gstr2a/download/excel
 */
router.get("/download/excel", auth, async (req, res) => {
  try {
    const data = await Gstr2aEntry.find({ user: req.user.id });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("GSTR-2A");

    sheet.columns = [
      { header: "Supplier GSTIN", key: "supplierGSTIN", width: 20 },
      { header: "Invoice No", key: "invoiceNumber", width: 18 },
      { header: "Invoice Date", key: "invoiceDate", width: 15 },
      { header: "Taxable Value", key: "taxableValue", width: 15 },
      { header: "CGST", key: "cgst", width: 12 },
      { header: "SGST", key: "sgst", width: 12 },
      { header: "IGST", key: "igst", width: 12 },
      { header: "Total GST", key: "totalGST", width: 15 }
    ];

    data.forEach((row) => {
      sheet.addRow({
        supplierGSTIN: row.supplierGSTIN,
        invoiceNumber: row.invoiceNumber,
        invoiceDate: row.invoiceDate
          ? row.invoiceDate.toISOString().split("T")[0]
          : "",
        taxableValue: row.taxableValue,
        cgst: row.cgst,
        sgst: row.sgst,
        igst: row.igst,
        totalGST: row.totalGST
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=gstr2a.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to download GSTR-2A Excel" });
  }
});

export default router;
