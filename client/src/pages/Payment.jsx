import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { clearCart } from "../redux/cartSlice";

function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);

  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce(
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
      totalAmount: total,
    };

    await API.post("/orders", orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  };

  const handlePay = async () => {
    if (!cardNumber || !name || !expiry || !cvv) {
      alert("Please fill all payment details.");
      return;
    }

    try {
      setLoading(true);

      const success = await createOrder();

      if (!success) return;

      dispatch(clearCart());

      navigate("/payment-success", {
        state: {
          message: "Payment successful. Your order has been placed.",
        },
      });
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Card Payment
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Complete your payment securely
        </p>

        <div className="mb-5">
          <label className="block font-medium mb-2">Card Number</label>
          <input
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <label className="block font-medium mb-2">Card Holder Name</label>
          <input
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            placeholder="Name on card"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium mb-2">Expiry Date</label>
            <input
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-2">CVV</label>
            <input
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 flex justify-between font-semibold mb-6">
          <span>Total Amount</span>
          <span>₹{total}</span>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay ₹${total}`}
        </button>
      </div>
    </div>
  );
}

export default Payment;