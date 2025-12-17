// backend/routes/gstRoutes.js
import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/rate", (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.status(400).json({ error: "Missing 'keyword' parameter" });
  }

  const scriptPath = path.join(__dirname, "../scripts/gst_rate_fetcher.py");

  const pythonProcess = spawn("python", [scriptPath, keyword]);

  let result = "";
  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error("Python Error:", data.toString());
  });

  pythonProcess.on("close", () => {
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch {
      res.json({ keyword, rate: result.trim() });
    }
  });
});

export default router;
