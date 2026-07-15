import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { clearCart } from "../redux/cartSlice";

function BuyNow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const createOrder = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return false;
    }

    const orderData = {
      customerName: user?.name || "Customer",
      email: user?.email || "customer@gmail.com",
      phone: "0000000000",
      address: "Demo Address",
      items: cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      totalAmount,
    };

    await API.post("/orders", orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (paymentMethod === "card") {
      navigate("/payment");
      return;
    }

    try {
      setLoading(true);

      const success = await createOrder();

      if (!success) return;

      dispatch(clearCart());

      navigate("/payment-success", {
        state: {
          message: "Order placed successfully. Cash on delivery selected.",
        },
      });
    } catch (error) {
      alert(error.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="border rounded-lg p-3"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="border rounded-lg p-3"
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="border rounded-lg p-3"
            />

            <input
              type="text"
              placeholder="City"
              className="border rounded-lg p-3"
            />

            <input
              type="text"
              placeholder="State"
              className="border rounded-lg p-3"
            />

            <input
              type="text"
              placeholder="PIN Code"
              className="border rounded-lg p-3"
            />
          </div>

          <textarea
            placeholder="Complete Delivery Address"
            className="w-full mt-4 border rounded-lg p-3 h-32"
          />

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">
              Payment Method
            </h2>

            <label className="flex items-center gap-2 mb-2 border rounded-lg p-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Card Payment
            </label>

            <label className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-8 bg-black text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading
              ? "Placing Order..."
              : paymentMethod === "card"
              ? `Continue to Pay ₹${totalAmount}`
              : `Place Order ₹${totalAmount}`}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          )}

          <hr className="my-6" />

          <div className="flex justify-between mb-3">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="flex justify-between mb-3">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </div>

          <div className="flex justify-between text-2xl font-bold">
            <span>Total</span>
            <span className="text-green-600">₹{totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyNow;