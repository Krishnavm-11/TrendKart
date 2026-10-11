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
} from "../controllers/orderController.js";
import { getAnalytics } from "../controllers/analyticsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer: create Cash on Delivery order
router.post("/", protect, createCODOrder);

// Customer: cancel their own order
router.put("/:id/cancel", protect, cancelMyOrder);

// Customer: Razorpay routes
router.post(
  "/razorpay/create-order",
  protect,
  createRazorpayOrder
);

router.post(
  "/razorpay/verify-payment",
  protect,
  verifyRazorpayPayment
);

// Customer: order history
router.get("/myorders", protect, getMyOrders);

// Admin: order management
router.get("/", protect, admin, getAllOrders);

router.put(
  "/:id/status",
  protect,
  admin,
  updateOrderStatus
);

router.delete(
  "/:id",
  protect,
  admin,
  deleteOrder
);

// Admin: analytics
router.get("/analytics", protect, admin, getAnalytics);

export default router;
