
import crypto from "crypto";
import Razorpay from "razorpay";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Create Razorpay instance
const getRazorpayInstance = () => {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    throw new Error("Razorpay API keys are missing from .env");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Validate shipping address
const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object") {
    throw new Error("Please provide a shipping address.");
  }

  const requiredFields = [
    "fullName",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
  ];

  for (const field of requiredFields) {
    if (!String(address[field] || "").trim()) {
      throw new Error(`Please provide ${field}.`);
    }
  }
};

// Calculate order using actual database prices
const calculateOrder = async (orderItems) => {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new Error("Your cart is empty.");
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of orderItems) {
    const productId = item.product || item.productId || item._id;
    const quantity = Number(item.quantity);

    if (
      !productId ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error("Invalid product or quantity.");
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("A product in your cart no longer exists.");
    }

    if (Number(product.stock) < quantity) {
      throw new Error(
        `${product.name} does not have enough stock.`
      );
    }

    const price = Number(product.getDiscountedPrice());

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Invalid price for ${product.name}.`);
    }

    subtotal += price * quantity;

    verifiedItems.push({
      product: product._id,
      name: product.name,
      quantity,
      price,
      image: product.image || "",
    });
  }

  subtotal = Number(subtotal.toFixed(2));

  const shipping =
    subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 49;

  return {
    items: verifiedItems,
    subtotal,
    shipping,
    totalAmount: Number((subtotal + shipping).toFixed(2)),
  };
};

// ==========================================
// CREATE CASH ON DELIVERY ORDER
// POST /api/orders
// ==========================================
export const createCODOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress } = req.body;

    validateShippingAddress(shippingAddress);

    const calculated = await calculateOrder(orderItems);

    if (calculated.totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount.",
      });
    }

    const order = await Order.create({
      user: req.user._id,
      email: req.user.email || "",
      orderItems: calculated.items,
      shippingAddress,
      subtotal: calculated.subtotal,
      shipping: calculated.shipping,
      totalAmount: calculated.totalAmount,
      paymentMethod: "Cash on Delivery",
      isPaid: false,
      status: "Pending",
    });

    return res.status(201).json({
      message: "Cash on Delivery order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("Create COD order error:", error);

    return res.status(400).json({
      message: error.message || "Unable to place order.",
    });
  }
};

// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/orders/razorpay/create-order
// ==========================================
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress } = req.body;

    validateShippingAddress(shippingAddress);

    const calculated = await calculateOrder(orderItems);

    if (calculated.totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount.",
      });
    }

    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(calculated.totalAmount * 100),
      currency: "INR",
      receipt: `tk_${Date.now()}`,
      notes: {
        userId: String(req.user._id),
      },
    });

    return res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrder,
      subtotal: calculated.subtotal,
      shipping: calculated.shipping,
      totalAmount: calculated.totalAmount,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(400).json({
      message: error.message || "Unable to start payment.",
    });
  }
};

// ==========================================
// VERIFY RAZORPAY PAYMENT
// POST /api/orders/razorpay/verify-payment
// ==========================================
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderData
    ) {
      return res.status(400).json({
        message: "Payment verification details are incomplete.",
      });
    }

    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.fetch(
      razorpay_order_id
    );

    if (
      razorpayOrder.notes?.userId !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "This payment does not belong to your account.",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        message: "Payment signature verification failed.",
      });
    }

    validateShippingAddress(orderData.shippingAddress);

    const calculated = await calculateOrder(
      orderData.orderItems
    );

    if (
      Math.round(calculated.totalAmount * 100) !==
      Number(razorpayOrder.amount)
    ) {
      return res.status(400).json({
        message: "The order amount does not match the payment.",
      });
    }

    // Prevent saving the same payment twice
    const existingOrder = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (existingOrder) {
      if (
        existingOrder.user.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message: "This order belongs to another account.",
        });
      }

      return res.status(200).json({
        message: "Order already saved successfully.",
        order: existingOrder,
      });
    }

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      Number(payment.amount) !== Number(razorpayOrder.amount) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        message:
          "Payment is not captured or the payment details do not match.",
      });
    }

    const order = await Order.create({
      user: req.user._id,
      email: req.user.email || "",
      orderItems: calculated.items,
      shippingAddress: orderData.shippingAddress,
      subtotal: calculated.subtotal,
      shipping: calculated.shipping,
      totalAmount: calculated.totalAmount,
      paymentMethod: "Card Payment",
      isPaid: true,
      paidAt: new Date(),
      status: "Pending",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    return res.status(201).json({
      message: "Payment successful and order placed.",
      order,
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);

    return res.status(400).json({
      message: error.message || "Unable to verify your payment.",
    });
  }
};

// ==========================================
// GET LOGGED-IN CUSTOMER ORDERS
// GET /api/orders/myorders
// ==========================================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      message: "Unable to fetch your orders.",
    });
  }
};

// ==========================================
// GET ALL ORDERS FOR ADMIN
// GET /api/orders
// ==========================================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: "user",
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((order) => ({
      ...order,

      // The customer account linked to the order
      customer: order.user
        ? {
            id: order.user._id,
            name: order.user.name || "Unknown customer",
            email: order.user.email || order.email || "",
          }
        : {
            id: null,
            name: "Customer account unavailable",
            email: order.email || "",
          },

      // The delivery recipient may be a different person
      shippingRecipient:
        order.shippingAddress?.fullName || "",
    }));

    return res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      message: "Unable to fetch orders.",
    });
  }
};

// ==========================================
// CANCEL CUSTOMER ORDER
// PUT /api/orders/:id/cancel
// ==========================================
export const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to cancel this order.",
      });
    }

    if (!["Pending", "Processing"].includes(order.status)) {
      return res.status(400).json({
        message:
          "This order cannot be cancelled because it has already been shipped or processed further.",
      });
    }

    order.status = "Cancelled";

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      message: "Unable to cancel order.",
    });
  }
};

// ==========================================
// UPDATE ORDER STATUS
// PUT /api/orders/:id/status
// ==========================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        message: "A cancelled order cannot be updated.",
      });
    }

    order.status = status;

    if (
      status === "Delivered" &&
      order.paymentMethod === "Cash on Delivery"
    ) {
      order.isPaid = true;
      order.paidAt = order.paidAt || new Date();
    }

    if (status === "Delivered") {
      order.deliveredAt = order.deliveredAt || new Date();
    }

    const updatedOrder = await order.save();

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Unable to update order status.",
    });
  }
};

// ==========================================
// DELETE ORDER
// DELETE /api/orders/:id
// ==========================================
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    await order.deleteOne();

    return res.status(200).json({
      message: "Order deleted successfully.",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    return res.status(500).json({
      message: "Unable to delete order.",
    });
  }
};
