
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import API from "../services/api";

function OrderHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // Get the correct style and icon for each order status.
  const getStatus = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (value === "delivered") {
      return {
        label: "Delivered",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle2,
      };
    }

    if (value === "shipped") {
      return {
        label: "Shipped",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Truck,
      };
    }

    if (value === "confirmed" || value === "processing") {
      return {
        label: value === "confirmed" ? "Confirmed" : "Processing",
        className: "bg-amber-50 text-amber-800 border-amber-200",
        icon: Package,
      };
    }

    if (
      value === "declined" ||
      value === "cancelled" ||
      value === "canceled"
    ) {
      return {
        label: status,
        className: "bg-red-50 text-red-700 border-red-200",
        icon: Clock3,
      };
    }

    return {
      label: status || "Pending",
      className: "bg-stone-100 text-stone-700 border-stone-200",
      icon: Clock3,
    };
  };

  // Fetch orders belonging to the logged-in user.
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your orders.");
          return;
        }

        // Correct backend endpoint: /orders/myorders
        // The API interceptor automatically adds the token.
        const { data } = await API.get("/orders/myorders");

        // Handle an array response from the backend.
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
          console.error("Unexpected orders response:", data);
        }
      } catch (error) {
        console.error(
          "Order history error:",
          error.response?.data || error.message
        );

        if (error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError(
            error.response?.data?.message ||
              "Failed to load your orders. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#24221e]">
      {/* Header */}
      <header className="border-b border-[#e8e2d8] bg-[#fcfbf8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xl font-bold tracking-[0.18em]"
          >
            <ShoppingBag size={21} strokeWidth={1.6} />
            TRENDKART
          </button>

          <button
            onClick={() => navigate("/")}
            className="hidden items-center gap-2 text-sm text-[#81796c] transition hover:text-black sm:flex"
          >
            Continue shopping
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="mb-7 flex items-center gap-2 text-sm text-[#81796c] transition hover:text-black"
        >
          <ArrowLeft size={16} />
          Continue shopping
        </button>

        {/* Page heading */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#93836a]">
              Your shopping journey
            </p>

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              My Orders
            </h1>

            <p className="mt-3 text-sm text-[#81796c]">
              All your purchases, together in one place.
            </p>
          </div>

          {!loading && !error && orders.length > 0 && (
            <div className="border border-[#e8e2d8] bg-[#fcfbf8] px-5 py-3">
              <p className="text-xs text-[#81796c]">Total orders</p>
              <p className="mt-1 text-xl font-semibold">
                {orders.length}
              </p>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="border border-[#e8e2d8] bg-[#fcfbf8] px-6 py-20 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#d9d0c2] border-t-[#25231f]" />

            <p className="text-sm text-[#81796c]">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="border border-red-200 bg-[#fffafa] px-6 py-12 text-center">
            <p className="font-medium text-red-700">{error}</p>

            {!localStorage.getItem("token") ||
            error.includes("session has expired") ? (
              <button
                onClick={() => navigate("/login")}
                className="mt-5 bg-[#25231f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#49443b]"
              >
                Login to continue
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="mt-5 bg-[#25231f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#49443b]"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {/* Empty orders state */}
        {!loading && !error && orders.length === 0 && (
          <div className="border border-[#e8e2d8] bg-[#fcfbf8] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eee8dd]">
              <ShoppingBag
                size={28}
                strokeWidth={1.4}
                className="text-[#81796c]"
              />
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#81796c]">
              Your next favourite find is waiting. Explore the collection
              and your orders will appear here.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-7 inline-flex items-center gap-2 bg-[#25231f] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#49443b]"
            >
              Explore collection
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Order list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = getStatus(order.status);
              const StatusIcon = status.icon;

              return (
                <article
                  key={order._id}
                  className="overflow-hidden border border-[#e8e2d8] bg-[#fcfbf8]"
                >
                  {/* Order header */}
                  <div className="flex flex-col gap-5 border-b border-[#e8e2d8] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid flex-1 grid-cols-2 gap-5 sm:grid-cols-3">
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#93836a]">
                          Order number
                        </p>

                        <p className="break-all text-sm font-semibold">
                          #{String(order._id).slice(-10).toUpperCase()}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#93836a]">
                          <CalendarDays size={12} />
                          Order date
                        </p>

                        <p className="text-sm font-medium">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#93836a]">
                          Total amount
                        </p>

                        <p className="text-sm font-semibold">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-2 border px-3 py-2 text-xs font-medium ${status.className}`}
                    >
                      <StatusIcon size={15} />
                      {status.label}
                    </div>
                  </div>

                  {/* Products */}
                  <div className="p-5 sm:p-6">
                    <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#93836a]">
                      Items in this order
                    </h2>

                    {order.orderItems?.length > 0 ? (
                      <div className="space-y-4">
                        {order.orderItems.map((item, index) => {
                          const quantity = item.quantity || 1;

                          const image =
                            item.image || item.images?.[0];

                          return (
                            <div
                              key={`${order._id}-${index}`}
                              className="flex items-center gap-4"
                            >
                              <div className="h-24 w-20 shrink-0 overflow-hidden bg-[#f0ece4]">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={item.name || "Ordered product"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Package
                                      size={25}
                                      className="text-[#aaa08f]"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="line-clamp-2 text-sm font-semibold">
                                  {item.name || "Product"}
                                </h3>

                                <p className="mt-2 text-xs text-[#81796c]">
                                  Quantity: {quantity}
                                </p>

                                <p className="mt-2 text-sm font-medium">
                                  {formatPrice(
                                    Number(item.price || 0) * quantity
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-[#81796c]">
                        Product details are unavailable for this order.
                      </p>
                    )}
                  </div>

                  {/* Delivery details */}
                  {order.shippingAddress && (
                    <div className="border-t border-[#e8e2d8] bg-[#f8f6f1] p-5 sm:p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <MapPin
                          size={17}
                          className="text-[#93836a]"
                        />

                        <h3 className="text-sm font-semibold">
                          Delivery address
                        </h3>
                      </div>

                      <div className="text-sm leading-6 text-[#716a5f]">
                        <p className="font-medium text-[#25231f]">
                          {order.shippingAddress.fullName}
                        </p>

                        <p>{order.shippingAddress.address}</p>

                        <p>
                          {[
                            order.shippingAddress.city,
                            order.shippingAddress.state,
                          ]
                            .filter(Boolean)
                            .join(", ")}

                          {order.shippingAddress.pincode
                            ? ` - ${order.shippingAddress.pincode}`
                            : ""}
                        </p>

                        {order.shippingAddress.phone && (
                          <p className="mt-1">
                            Phone: {order.shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment information */}
                  <div className="flex flex-col gap-3 border-t border-[#e8e2d8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <p className="text-xs text-[#81796c]">
                        Payment method
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {order.paymentMethod || "Not specified"}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-[#81796c]">
                        Payment status
                      </p>

                      <p
                        className={`mt-1 text-sm font-semibold ${
                          order.isPaid
                            ? "text-green-700"
                            : "text-[#9a7130]"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Payment pending"}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderHistory;
