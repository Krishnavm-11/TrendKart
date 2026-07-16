import { useEffect, useState } from "react";
import API from "../services/api";

function OrderHistory() {
  const [orders, setOrders] = useState([]);

  const getStatusColor = (status) => {
    if (status === "Confirmed") return "text-green-600";
    if (status === "Declined") return "text-red-600";
    return "text-yellow-600";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await API.get("/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order._id} className="bg-white shadow rounded-xl p-5">
              <div className="flex justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-bold">Order #{order._id}</h2>
                  <p>Total: ₹{order.totalAmount}</p>

                  <p className="font-semibold">
                    Status:{" "}
                    <span className={getStatusColor(order.status)}>
                      {order.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4">
                {order.items.map((item, index) => (
                  <p key={index} className="text-gray-600">
                    {item.name} × {item.quantity} - ₹{item.price}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;