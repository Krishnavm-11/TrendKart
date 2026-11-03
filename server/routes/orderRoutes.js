import express from "express";

import {
  createCODOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelMyOrder,
  getMyAddresses,
  addMyAddress,
  deleteMyAddress,
} from "../controllers/orderController.js";

import { getAnalytics } from "../controllers/analyticsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer address routes
router.get("/addresses", protect, getMyAddresses);
router.post("/addresses", protect, addMyAddress);
router.delete("/addresses/:id", protect, deleteMyAddress);

// Customer order routes
router.post("/", protect, createCODOrder);
router.put("/:id/cancel", protect, cancelMyOrder);
router.post("/razorpay/create-order", protect, createRazorpayOrder);
router.post("/razorpay/verify-payment", protect, verifyRazorpayPayment);
router.get("/myorders", protect, getMyOrders);

// Admin order routes
router.get("/analytics", protect, admin, getAnalytics);
router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.delete("/:id", protect, admin, deleteOrder);

export default router;