// routes/gstRates.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ratesPath = path.join(__dirname, "../data/gstRates.json");
const gstRates = JSON.parse(fs.readFileSync(ratesPath, "utf8"));

function resolveRate({ hsn, text }) {
  const cleanHSN = (hsn || "").toString().trim();
  const hay = (text || "").toLowerCase();

  if (cleanHSN && gstRates.hsn[cleanHSN]) {
    return {
      rate: gstRates.hsn[cleanHSN],
      source: "hsn",
      matched: cleanHSN,
      notes: "Matched by HSN"
    };
  }

  for (const entry of gstRates.keywords) {
    const ok = entry.aliases.some((a) => hay.includes(a));
    if (ok) {
      return {
        rate: entry.rate,
        source: "keyword",
        matched: entry.aliases.find((a) => hay.includes(a)),
        notes: `Matched keyword for "${entry.name}"`
      };
    }
  }

  return { rate: null, source: "none", matched: null, notes: "No match" };
}

router.get("/", (req, res) => {
  const { hsn = "", text = "" } = req.query;
  const result = resolveRate({ hsn, text });
  res.json(result);
});

export default router;
