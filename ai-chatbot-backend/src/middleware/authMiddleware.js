import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  let authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Extract token (handles both "Bearer token" and just "token")
  if (authHeader.startsWith("Bearer ")) {
    authHeader = authHeader.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);

    // 🔹 Check if token exists in the database
    const user = await User.findById(decoded.id);
    if (!user || user.token !== authHeader) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    req.user = user; // Store user data in request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
