// routes/auth.js (or controllers/authController.js)
import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation: email + password
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    // ✅ Password strength check
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 6 characters long and include at least one special symbol.",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists." });

    // Create new user (password auto-hashed by schema)
    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error during signup." });
  }
});

// ✅ LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials." });

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials." });

    // JWT token
    const token = jwt.sign({ userId: user._id }, "yourSecretKey", {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

export default router;
