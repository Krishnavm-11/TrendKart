import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders");
        setOrders(data);
      } catch (error) {
        console.error(
          error.response?.data?.message || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-8 text-3xl font-bold">
        Admin Dashboard
      </h1>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">
          Customer Orders
        </h2>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-6 shadow">
            No orders found
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-xl bg-white p-5 shadow"
              >
                <div className="mb-5 flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="font-semibold">
                      {order._id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="text-lg font-bold">
                      ₹{order.totalAmount}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Status
                    </p>

                    <p className="font-medium">
                      {order.status}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div>
                    <h3 className="mb-2 font-semibold">
                      Customer
                    </h3>

                    <p>
                      {order.shippingAddress?.fullName ||
                        order.user?.name ||
                        "Name not provided"}
                    </p>

                    <p className="text-gray-600">
                      {order.user?.email ||
                        "Email not provided"}
                    </p>

                    <p className="mt-2 font-medium">
                      Phone:{" "}
                      {order.shippingAddress?.phone ||
                        "Phone not provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold">
                      Shipping Address
                    </h3>

                    <p>
                      {order.shippingAddress?.address ||
                        "Address not provided"}
                    </p>

                    <p>
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}
                    </p>

                    <p>
                      Pincode:{" "}
                      {order.shippingAddress?.pincode ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold">
                      Payment
                    </h3>

                    <p>
                      {order.paymentMethod ||
                        "Cash on Delivery"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t pt-4">
                  <h3 className="mb-3 font-semibold">
                    Products
                  </h3>

                  <div className="space-y-3">
                    {order.orderItems?.map(
                      (item, index) => (
                        <div
                          key={
                            item.product ||
                            `${order._id}-${index}`
                          }
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {item.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              Quantity:{" "}
                              {item.quantity || item.qty || 1}
                            </p>
                          </div>

                          <p className="font-semibold">
                            ₹
                            {item.price *
                              (item.quantity ||
                                item.qty ||
                                1)}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;