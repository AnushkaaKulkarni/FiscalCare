    import express from "express";
    import mongoose from "mongoose";
    import cors from "cors";
    import dotenv from "dotenv";
    import path from "path";
    import { fileURLToPath } from "url";
    import connectDB from "./config/db.js";
    import fs from "fs-extra";
    
    

    // ✅ Routes
    import authRoutes from "./routes/authRoutes.js";
    import parseRoutes from "./routes/parse.js";
    import invoiceRoutes from "./routes/invoices.js";
    import gstRates from "./routes/gstRates.js";
    import gstr3bRoutes from "./routes/gstr3b.js";
    import voiceInvoiceRouter from "./routes/voiceInvoice.js";
    import gstr2aRoutes from "./routes/gstr2a.js";
    import gstr2bRoutes from "./routes/gstr2b.js";
    import profileRoutes from "./routes/profile.js";
    import gstr1Routes from "./routes/gstr1.js";


    dotenv.config();

    // ✅ Fix __dirname for ES Modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // ✅ Initialize App FIRST
    const app = express();

    // ✅ Middlewares
    app.use(cors());
    // app.use(express.json({ limit: "10mb" }));
    app.use(express.json());        // ✅ IMPORTANT: parse JSON body
app.use(express.urlencoded({ extended: true }))
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
    


    // ✅ Connect MongoDB
    connectDB();

    // after connectDB();
    fs.ensureDirSync(path.join(process.cwd(), "uploads"));


    // ✅ API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/parse", parseRoutes);
    app.use("/api/invoices", invoiceRoutes);
    app.use("/api/gst-rates", gstRates);
    app.use("/api/gstr3b", gstr3bRoutes);
    app.use("/api/voice-to-invoice", voiceInvoiceRouter);
    app.use("/api/gstr1", gstr1Routes);
    app.use("/api/gstr2a", gstr2aRoutes);
    app.use("/api/gstr2b", gstr2bRoutes);
    app.use("/api/profile", profileRoutes);


    // ✅ Health Check
    app.get("/", (_req, res) => res.send("✅ FiscalCare GST Backend Running"));

    // ✅ Start Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
