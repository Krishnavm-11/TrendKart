import express from "express";

import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

router.get(
  "/",
  protect,
  admin,
  getAllOrders
);

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

export default router;