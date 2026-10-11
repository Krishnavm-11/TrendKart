
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify the user's token
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether the token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Authentication failed: Token missing");

      return res.status(401).json({
        message: "Not authorized: Token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find the user associated with the token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("Authentication failed: User not found");

      return res.status(401).json({
        message: "Not authorized: User not found",
      });
    }

    req.user = user;

    console.log("Authenticated user:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Token failed or expired",
    });
  }
};

// Allow only admin users
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Admin access required",
  });
};
