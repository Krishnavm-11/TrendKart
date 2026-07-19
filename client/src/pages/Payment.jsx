import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { clearCart } from "../redux/cartSlice";

function Payment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] =
    useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  let pendingOrder = null;

  try {
    const savedOrder =
      sessionStorage.getItem("pendingOrder");

    pendingOrder = savedOrder
      ? JSON.parse(savedOrder)
      : null;
  } catch (error) {
    console.error("Invalid pending order:", error);
  }

  const totalAmount =
    pendingOrder?.totalAmount || 0;

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!pendingOrder) {
      alert(
        "Checkout details are missing. Please return to checkout."
      );

      navigate("/cart");
      return;
    }

    if (
      !pendingOrder.orderItems ||
      pendingOrder.orderItems.length === 0
    ) {
      alert(
        "No products found. Please return to your cart."
      );

      navigate("/cart");
      return;
    }

    if (
      !cardNumber ||
      !cardHolderName ||
      !expiry ||
      !cvv
    ) {
      alert("Please fill all card details.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    const orderData = {
      orderItems: pendingOrder.orderItems,
      shippingAddress:
        pendingOrder.shippingAddress,
      email: pendingOrder.email,
      totalAmount: pendingOrder.totalAmount,
      paymentMethod: "Card Payment",
      isPaid: true,
    };

    console.log("Order being sent:", orderData);

    try {
      setLoading(true);

      const { data } = await API.post(
        "/orders",
        orderData
      );

      sessionStorage.removeItem("pendingOrder");

      dispatch(clearCart());

      navigate("/payment-success", {
        state: {
          order: data,
          message:
            "Payment completed and order placed successfully.",
        },
      });
    } catch (error) {
      console.error(
        "Payment order error:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <form
        onSubmit={handlePayment}
        className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-xl md:p-8"
      >
        <h1 className="text-center text-3xl font-bold">
          Card Payment
        </h1>

        <p className="mb-8 mt-2 text-center text-gray-500">
          Complete your payment securely
        </p>

        <label className="mb-2 block font-semibold">
          Card Number
        </label>

        <input
          type="text"
          value={cardNumber}
          onChange={(e) =>
            setCardNumber(e.target.value)
          }
          placeholder="Enter card number"
          maxLength="16"
          className="mb-5 w-full rounded-lg border p-4 outline-none focus:border-black"
        />

        <label className="mb-2 block font-semibold">
          Card Holder Name
        </label>

        <input
          type="text"
          value={cardHolderName}
          onChange={(e) =>
            setCardHolderName(e.target.value)
          }
          placeholder="Enter card holder name"
          className="mb-5 w-full rounded-lg border p-4 outline-none focus:border-black"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">
              Expiry Date
            </label>

            <input
              type="text"
              value={expiry}
              onChange={(e) =>
                setExpiry(e.target.value)
              }
              placeholder="MM/YY"
              maxLength="5"
              className="w-full rounded-lg border p-4 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              CVV
            </label>

            <input
              type="password"
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value)
              }
              placeholder="CVV"
              maxLength="3"
              className="w-full rounded-lg border p-4 outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between rounded-lg bg-gray-100 p-5 font-bold">
          <span>Total Amount</span>
          <span>₹{totalAmount}</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : `Pay ₹${totalAmount}`}
        </button>
      </form>
    </div>
  );
}

export default Payment;