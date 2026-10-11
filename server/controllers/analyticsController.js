import Order from "../models/Order.js";

// Get analytics data for the admin dashboard
export const getAnalytics = async (req, res) => {
  try {
    // Get all orders, newest first
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Count paid orders
    const paidOrders = orders.filter(
      (order) => order.isPaid === true
    );

    // Calculate total revenue from paid orders
    const totalRevenue = paidOrders.reduce(
      (total, order) => total + Number(order.totalAmount || 0),
      0
    );

    // Calculate average order value
    const averageOrderValue =
      paidOrders.length > 0
        ? totalRevenue / paidOrders.length
        : 0;

    // Count orders by status
    const statusCounts = {};

    orders.forEach((order) => {
      const status = order.status || "Pending";

      statusCounts[status] =
        (statusCounts[status] || 0) + 1;
    });

    // Group revenue and orders by month
    const monthlyData = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);

      const monthKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
      ].join("-");

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          revenue: 0,
          orders: 0,
        };
      }

      monthlyData[monthKey].orders += 1;

      if (order.isPaid === true) {
        monthlyData[monthKey].revenue += Number(
          order.totalAmount || 0
        );
      }
    });

    // Return the latest 12 months in chronological order
    const monthlySales = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    // Find best-selling products
    const productSales = {};

    paidOrders.forEach((order) => {
      order.orderItems?.forEach((item) => {
        const productId = item.product
          ? String(item.product)
          : item.name;

        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            name: item.name || "Unknown product",
            quantitySold: 0,
            revenue: 0,
          };
        }

        productSales[productId].quantitySold += Number(
          item.quantity || 0
        );

        productSales[productId].revenue +=
          Number(item.price || 0) *
          Number(item.quantity || 0);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // Count orders created in the current month
    const now = new Date();

    const currentMonthOrders = orders.filter((order) => {
      const date = new Date(order.createdAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const currentMonthRevenue = currentMonthOrders
      .filter((order) => order.isPaid === true)
      .reduce(
        (total, order) =>
          total + Number(order.totalAmount || 0),
        0
      );

    // Send analytics to the frontend
    return res.status(200).json({
      summary: {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        totalRevenue,
        averageOrderValue,
        currentMonthOrders: currentMonthOrders.length,
        currentMonthRevenue,
      },
      statusCounts,
      monthlySales,
      topProducts,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return res.status(500).json({
      message: "Unable to load store analytics.",
    });
  }
};