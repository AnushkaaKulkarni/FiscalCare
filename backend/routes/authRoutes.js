// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs"; // fine to use bcryptjs here
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Helper: normalize email
const normEmail = (e) => (e ? String(e).toLowerCase().trim() : e);

// SIGN-UP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Password strength (optional) - at least one special char and min length 6
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long and include one special symbol.",
      });
    }

    const emailNorm = normEmail(email);

    // Check existing user (use normalized email)
    const existingUser = await User.findOne({ email: emailNorm }).lean();
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // Create user - rely on model pre-save to hash password
    const user = new User({ name: String(name).trim(), email: emailNorm, password });
    await user.save();

    return res.status(201).json({ message: "Registration successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Signup error:", err);
    // Duplicate key (race) guard
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    return res.status(500).json({ message: "Server error during signup" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const emailNorm = normEmail(email);
    const user = await User.findOne({ email: emailNorm });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Use bcryptjs compare (works with bcrypt hashes too)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "dev-secret", {
      expiresIn: process.env.JWT_EXPIRY || "1h",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

export default router;
