import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      email,
      totalAmount,
      paymentMethod,
      isPaid,
    } = req.body;

    if (
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      return res.status(400).json({
        message: "No order items provided",
      });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return res.status(400).json({
        message:
          "Please provide complete shipping details",
      });
    }

    if (
      totalAmount === undefined ||
      totalAmount === null
    ) {
      return res.status(400).json({
        message: "Total amount is required",
      });
    }

    const formattedItems = orderItems.map(
      (item) => ({
        product: item.product || item._id,
        name: item.name,
        image: item.image || "",
        price: Number(item.price),
        quantity: Number(
          item.quantity || item.qty || 1
        ),
      })
    );

    const paid = Boolean(isPaid);

    const order = await Order.create({
      user: req.user._id,

      email: email || req.user.email || "",

      orderItems: formattedItems,

      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },

      totalAmount: Number(totalAmount),

      paymentMethod:
        paymentMethod || "Cash on Delivery",

      isPaid: paid,

      paidAt: paid ? new Date() : null,

      status: "Pending",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Declined",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;

    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteOrder = async (
  req,
  res
) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    await order.deleteOne();

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};