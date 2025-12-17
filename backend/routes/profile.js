import express from "express";
import auth from "../middlewares/auth.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ GET logged-in user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email gstin");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ SET / UPDATE GSTIN
router.post("/gstin", auth, async (req, res) => {
  const { gstin } = req.body;

  if (!gstin) {
    return res.status(400).json({ message: "GSTIN required" });
  }

  await User.findByIdAndUpdate(req.user.id, { gstin });
  res.json({ message: "GSTIN updated successfully" });
});

export default router;
