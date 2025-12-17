//backend/routes/gst.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const something = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/something.json"), "utf-8")
);

const router = express.Router();

router.get("/:hsn", (req, res) => {
  const hsn = req.params.hsn;
  const rate = gstRates[hsn];

  if (!rate) {
    return res.json({
      hsn,
      rate: "Unknown",
      message: "HSN not found in database"
    });
  }

  res.json({
    hsn,
    rate: `${rate}%`,
    message: "Rate found"
  });
});

export default router;
