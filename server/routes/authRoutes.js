
import express from "express";

import {
  loginUser,
  sendRegisterOtp,
  verifyAuthOtp,
  getAllUsers,
} from "../controllers/authController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin dashboard.
router.get("/", protect, admin, getAllUsers);

// Normal login without OTP.
router.post("/login", loginUser);

// Registration OTP.
router.post("/register/send-otp", sendRegisterOtp);
router.post("/verify-otp", verifyAuthOtp);

export default router;
