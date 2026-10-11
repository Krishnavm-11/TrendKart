import express from "express";
import {
  registerUser,
  loginUser,
  sendRegisterOtp,
  sendLoginOtp,
  verifyAuthOtp,
  getAllUsers,
} from "../controllers/authController.js";
import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only endpoint for the dashboard user count and user list.
router.get("/", protect, admin, getAllUsers);


// Existing routes: keep these for compatibility.
router.post("/register", registerUser);
router.post("/login", loginUser);

// New OTP routes.
router.post("/register/send-otp", sendRegisterOtp);
router.post("/login/send-otp", sendLoginOtp);
router.post("/verify-otp", verifyAuthOtp);


export default router;