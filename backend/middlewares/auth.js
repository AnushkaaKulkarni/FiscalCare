// backend/middlewares/auth.js (ES module)
import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const authHeader = req.headers?.authorization || req.get("authorization");
  console.log("auth middleware header:", authHeader?.slice(0, 80)); // short preview
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("auth verify error:", err && err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}
