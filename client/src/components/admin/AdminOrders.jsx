import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-700",
    Processing: "bg-blue-50 text-blue-700",
    Shipped: "bg-violet-50 text-violet-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-red-50 text-red-700",
  };

  return styles[status] || "bg-stone-100 text-stone-700";
};

// Support both the new customer object and the existing populated user.
const getCustomerName = (order) =>
  order.customer?.name ||
  order.user?.name ||
  "Customer account unavailable";

const getCustomerEmail = (order) =>
  order.customer?.email ||
  order.user?.email ||
  order.email ||
  "No email available";

const getShippingName = (order) =>
  order.shippingRecipient ||
  order.shippingAddress?.fullName ||
  "No recipient name";

const getCustomerId = (order) =>
  order.customer?.id ||
  order.user?._id ||
  (typeof order.user === "string" ? order.user : "") ||
  "";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");

      const orderData = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || [];

      setOrders(orderData);

      setSelectedOrder((previousOrder) => {
        if (!previousOrder) return null;

        return (
          orderData.find(
            (order) => order._id === previousOrder._id
          ) || null
        );
      });
    } catch (error) {
      console.error(
        "Fetch admin orders error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load orders. Please check your admin login."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Search by account name, email, shipping recipient, or order ID
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = [
        getCustomerName(order),
        getCustomerEmail(order),
        getShippingName(order),
        order._id || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(
        search.trim().toLowerCase()
      );

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setMessage("");

      const response = await api.put(
        `/orders/${orderId}/status`,
        { status: newStatus }
      );

      const updatedOrder = response.data.order || response.data;

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, ...updatedOrder }
            : order
        )
      );

      setSelectedOrder((previousOrder) =>
        previousOrder?._id === orderId
          ? { ...previousOrder, ...updatedOrder }
          : previousOrder
      );

      setMessage("Order status updated successfully.");
    } catch (error) {
      console.error(
        "Update order status error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update order status."
      );

      await fetchOrders();
    } finally {
      setUpdatingId("");
    }
  };

  // Delete order
  const handleDeleteOrder = async () => {
    if (!deleteOrder || deleting) return;

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      await api.delete(`/orders/${deleteOrder._id}`);

      setOrders((previousOrders) =>
        previousOrders.filter(
          (order) => order._id !== deleteOrder._id
        )
      );

      if (selectedOrder?._id === deleteOrder._id) {
        setSelectedOrder(null);
      }

      setDeleteOrder(null);
      setMessage("Order deleted successfully.");
    } catch (error) {
      console.error(
        "Delete order error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete order."
      );
    } finally {
      setDeleting(false);
    }
  };

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const totalRevenue = orders.reduce((total, order) => {
    return order.isPaid
      ? total + Number(order.totalAmount || 0)
      : total;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-4 text-[#24211e] sm:p-6 lg:p-8">
      {/* Page heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#9a7954]">
            Store management
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Orders
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Track purchases and manage customer orders.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="rounded-xl bg-[#25221f] px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh orders"}
        </button>
      </div>

      {/* Success message */}
      {message && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{message}</span>

          <button
            onClick={() => setMessage("")}
            className="ml-3 font-semibold"
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="ml-3 font-semibold"
            aria-label="Dismiss error message"
          >
            ×
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#e9e3d9] bg-white p-5">
          <p className="text-sm text-stone-500">Total orders</p>
          <h2 className="mt-3 text-3xl font-semibold">
            {orders.length}
          </h2>
          <p className="mt-2 text-xs text-stone-400">
            All recorded orders
          </p>
        </div>

        <div className="rounded-2xl border border-[#e9e3d9] bg-white p-5">
          <p className="text-sm text-stone-500">Pending orders</p>
          <h2 className="mt-3 text-3xl font-semibold text-amber-700">
            {pendingCount}
          </h2>
          <p className="mt-2 text-xs text-stone-400">
            Awaiting processing
          </p>
        </div>

        <div className="rounded-2xl border border-[#e9e3d9] bg-white p-5">
          <p className="text-sm text-stone-500">Delivered orders</p>
          <h2 className="mt-3 text-3xl font-semibold text-emerald-700">
            {deliveredCount}
          </h2>
          <p className="mt-2 text-xs text-stone-400">
            Marked as delivered
          </p>
        </div>

        <div className="rounded-2xl border border-[#e9e3d9] bg-white p-5">
          <p className="text-sm text-stone-500">Paid order value</p>
          <h2 className="mt-3 break-words text-2xl font-semibold">
            {formatPrice(totalRevenue)}
          </h2>
          <p className="mt-2 text-xs text-stone-400">
            Total of orders marked paid
          </p>
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-[#e9e3d9] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#eee9e1] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">All orders</h2>

            <p className="mt-1 text-sm text-stone-500">
              {filteredOrders.length} order
              {filteredOrders.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer or order ID"
              className="w-full rounded-xl border border-[#e5dfd5] bg-[#fdfcf9] px-4 py-3 text-sm outline-none transition focus:border-[#9a7954] sm:w-64"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[#e5dfd5] bg-[#fdfcf9] px-4 py-3 text-sm outline-none focus:border-[#9a7954]"
            >
              <option value="All">All statuses</option>

              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-stone-500">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f0e8] text-2xl">
              📦
            </div>

            <h3 className="font-semibold">No orders found</h3>

            <p className="mt-2 text-sm text-stone-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-[#faf8f4] text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">
                    Customer / Recipient
                  </th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#f0ece5]">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition hover:bg-[#fdfbf7]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>

                      <p className="mt-1 text-xs text-stone-400">
                        {order.orderItems?.length || 0} item types
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {getCustomerName(order)}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        {getCustomerEmail(order)}
                      </p>

                      <p className="mt-2 text-xs text-stone-400">
                        Ships to: {getShippingName(order)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-stone-600">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm">
                        {order.paymentMethod || "—"}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          order.isPaid
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Not paid"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={order.status || "Pending"}
                        disabled={updatingId === order._id}
                        onChange={(event) =>
                          handleStatusChange(
                            order._id,
                            event.target.value
                          )
                        }
                        className={`rounded-full px-3 py-2 text-xs font-semibold outline-none ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm font-semibold text-[#876744] hover:text-black"
                        >
                          View
                        </button>

                        <button
                          onClick={() => setDeleteOrder(order)}
                          className="text-sm font-semibold text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-stone-200 p-5 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#9a7954]">
                  Order details
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full px-3 py-1 text-2xl text-stone-500 hover:bg-stone-100 hover:text-black"
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* Account that placed the order */}
              <div>
                <h3 className="mb-3 font-semibold">
                  Customer who placed the order
                </h3>

                <p className="text-sm text-stone-700">
                  {getCustomerName(selectedOrder)}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                  {getCustomerEmail(selectedOrder)}
                </p>

                <p className="mt-2 break-all text-xs text-stone-400">
                  Customer ID: {getCustomerId(selectedOrder) || "Unavailable"}
                </p>
              </div>

              {/* Shipping address */}
              <div>
                <h3 className="mb-3 font-semibold">
                  Shipping recipient and address
                </h3>

                <div className="rounded-xl bg-[#faf8f4] p-4 text-sm leading-6 text-stone-600">
                  <p className="font-medium text-stone-800">
                    {getShippingName(selectedOrder)}
                  </p>

                  <p>{selectedOrder.shippingAddress?.phone}</p>
                  <p>{selectedOrder.shippingAddress?.address}</p>

                  <p>
                    {[
                      selectedOrder.shippingAddress?.city,
                      selectedOrder.shippingAddress?.state,
                      selectedOrder.shippingAddress?.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>

              {/* Ordered products */}
              <div>
                <h3 className="mb-3 font-semibold">Items</h3>

                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div
                      key={`${item.product || item.name}-${index}`}
                      className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {item.name || "Product"}
                        </p>

                        <p className="mt-1 text-sm text-stone-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold">
                        {formatPrice(
                          Number(item.price || 0) *
                            Number(item.quantity || 0)
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment summary */}
              <div className="rounded-xl bg-[#faf8f4] p-4">
                <div className="flex justify-between gap-4 text-sm text-stone-600">
                  <span>Payment method</span>
                  <span>{selectedOrder.paymentMethod || "—"}</span>
                </div>

                <div className="mt-3 flex justify-between gap-4 text-sm text-stone-600">
                  <span>Payment status</span>
                  <span>
                    {selectedOrder.isPaid ? "Paid" : "Not paid"}
                  </span>
                </div>

                <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Update status */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Update order status
                </label>

                <select
                  value={selectedOrder.status || "Pending"}
                  disabled={updatingId === selectedOrder._id}
                  onChange={(event) =>
                    handleStatusChange(
                      selectedOrder._id,
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9a7954]"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end border-t border-stone-200 p-5">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-[#25221f] px-5 py-3 text-sm font-medium text-white hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
              !
            </div>

            <h2 className="text-xl font-semibold">
              Delete this order?
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              You are about to delete order #
              {deleteOrder._id.slice(-8).toUpperCase()}. This action
              cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteOrder(null)}
                disabled={deleting}
                className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteOrder}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
