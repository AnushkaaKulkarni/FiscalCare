import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import parseRoutes from "./routes/parse.js";
import invoiceRoutes from "./routes/invoices.js";
import gstRates from "./routes/gstRates.js";  // ✅ Added this

dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Connect DB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/parse", parseRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/gst-rates", gstRates); // ✅ New Route

// Default route
app.get("/", (req, res) => {
  res.send("✅ EDAI Backend is running successfully with GST Scraper!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
