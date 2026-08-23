import { useEffect, useState } from "react";
import API from "../services/api";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatusColor = (status) => {
    if (status === "Confirmed") {
      return "text-green-600";
    }

    if (status === "Delivered") {
      return "text-green-700";
    }

    if (
      status === "Declined" ||
      status === "Cancelled"
    ) {
      return "text-red-600";
    }

    if (status === "Shipped") {
      return "text-blue-600";
    }

    return "text-yellow-600";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          setError(
            "Please login to view your orders."
          );
          return;
        }

        const { data } = await API.get(
          "/orders/my-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("MY ORDERS:", data);

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error(
          "Order history error:",
          error.response?.data ||
            error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 text-center">
        <p className="text-gray-500">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">
          My Orders
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {!error && orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <p className="text-gray-500">
              No orders found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white shadow rounded-xl p-5"
              >
                {/* ORDER TOP */}

                <div className="flex justify-between flex-wrap gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <h2 className="font-bold">
                      #{order._id}
                    </h2>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Order Date
                    </p>

                    <p className="font-medium">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="font-bold">
                      ₹{order.totalAmount}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Status
                    </p>

                    <p
                      className={`font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>

                {/* ITEMS */}

                <div className="mt-5">
                  <h3 className="font-semibold mb-4">
                    Products
                  </h3>

                  {order.orderItems?.length >
                  0 ? (
                    <div className="space-y-4">
                      {order.orderItems.map(
                        (item, index) => (
                          <div
                            key={`${order._id}-${index}`}
                            className="flex items-center justify-between gap-4 bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-4">
                              {item.image && (
                                <img
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.name
                                  }
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}

                              <div>
                                <p className="font-medium">
                                  {
                                    item.name
                                  }
                                </p>

                                <p className="text-sm text-gray-500">
                                  Qty:{" "}
                                  {item.quantity ||
                                    1}
                                </p>
                              </div>
                            </div>

                            <p className="font-semibold">
                              ₹
                              {item.price *
                                (item.quantity ||
                                  1)}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No products available
                      for this order.
                    </p>
                  )}
                </div>

                {/* SHIPPING */}

                {order.shippingAddress && (
                  <div className="mt-5 border-t pt-4">
                    <h3 className="font-semibold mb-2">
                      Delivery Details
                    </h3>

                    <p>
                      {
                        order
                          .shippingAddress
                          .fullName
                      }
                    </p>

                    <p className="text-gray-600">
                      Phone:{" "}
                      {
                        order
                          .shippingAddress
                          .phone
                      }
                    </p>

                    <p className="text-gray-600">
                      {
                        order
                          .shippingAddress
                          .address
                      }
                    </p>

                    <p className="text-gray-600">
                      {
                        order
                          .shippingAddress
                          .city
                      }
                      ,{" "}
                      {
                        order
                          .shippingAddress
                          .state
                      }{" "}
                      -{" "}
                      {
                        order
                          .shippingAddress
                          .pincode
                      }
                    </p>
                  </div>
                )}

                {/* PAYMENT */}

                <div className="mt-5 border-t pt-4">
                  <p>
                    Payment Method:{" "}
                    <span className="font-medium">
                      {order.paymentMethod}
                    </span>
                  </p>

                  <p>
                    Payment Status:{" "}
                    <span
                      className={
                        order.isPaid
                          ? "text-green-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }
                    >
                      {order.isPaid
                        ? "Paid"
                        : "Not Paid"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;