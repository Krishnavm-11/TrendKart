
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Banknote,
} from "lucide-react";

import API from "../services/api";
import { clearCart } from "../redux/cartSlice";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  let pendingOrder = null;

  try {
    pendingOrder = JSON.parse(
      sessionStorage.getItem("pendingOrder") || "null"
    );
  } catch {
    pendingOrder = null;
  }

  const orderItems = pendingOrder?.orderItems || [];
  const shippingAddress = pendingOrder?.shippingAddress;

  const displayTotal = Number(pendingOrder?.totalAmount || 0);

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const validateOrder = () => {
    if (!pendingOrder || orderItems.length === 0) {
      showMessage(
        "Your pending order was not found. Please return to checkout."
      );
      return false;
    }

    if (!shippingAddress) {
      showMessage(
        "Your shipping address is missing. Please return to checkout."
      );
      return false;
    }

    if (!localStorage.getItem("token")) {
      showMessage("Please sign in before placing your order.");
      return false;
    }

    return true;
  };

  // Place Cash on Delivery order
  const handleCOD = async () => {
    if (loading || !validateOrder()) return;

    try {
      setLoading(true);
      setMessage("");

      const { data } = await API.post("/orders", {
        orderItems,
        shippingAddress,
      });

      sessionStorage.removeItem("pendingOrder");
      dispatch(clearCart());

      navigate("/payment-success", {
        replace: true,
        state: {
          order: data.order,
          message:
            data.message ||
            "Cash on Delivery order placed successfully!",
        },
      });
    } catch (error) {
      console.error("COD order creation failed:", error);

      showMessage(
        error.response?.data?.message ||
          "Unable to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Start Razorpay payment
  const handleRazorpay = async () => {
    if (loading || !validateOrder()) return;

    try {
      setLoading(true);
      setMessage("");

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay Checkout. Check your internet connection."
        );
      }

      const { data: paymentData } = await API.post(
        "/orders/razorpay/create-order",
        {
          orderItems,
          shippingAddress,
        }
      );

      const options = {
        key: paymentData.keyId,
        amount: paymentData.razorpayOrder.amount,
        currency: paymentData.razorpayOrder.currency,
        name: "TrendKart",
        description: "Secure shopping payment",
        order_id: paymentData.razorpayOrder.id,
        theme: {
          color: "#211f1b",
        },
        modal: {
          escape: true,
          ondismiss: () => {
            setLoading(false);
          },
        },

        handler: async (response) => {
          try {
            const { data: result } = await API.post(
              "/orders/razorpay/verify-payment",
              {
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
                orderData: {
                  orderItems,
                  shippingAddress,
                },
              }
            );

            sessionStorage.removeItem("pendingOrder");
            dispatch(clearCart());

            navigate("/payment-success", {
              replace: true,
              state: {
                order: result.order,
                message:
                  result.message || "Payment successful!",
              },
            });
          } catch (error) {
            console.error("Payment verification failed:", error);

            showMessage(
              error.response?.data?.message ||
                "Payment verification failed. If money was deducted, contact support."
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        showMessage(
          response.error?.description ||
            "Payment failed. Please try again."
        );
        setLoading(false);
      });

      checkout.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);

      showMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment. Please try again."
      );

      setLoading(false);
    }
  };

  if (!pendingOrder || orderItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1eb] px-4 text-[#211f1b]">
        <div className="w-full max-w-md rounded-3xl border border-[#e6dfd4] bg-white p-8 text-center shadow-sm">
          <ShoppingBag
            size={38}
            className="mx-auto mb-4 text-[#9b815e]"
          />

          <h1 className="text-2xl font-semibold">
            No pending order
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Please return to your cart and continue checkout.
          </p>

          <Link
            to="/cart"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#211f1b] px-6 py-3 text-sm font-semibold text-white"
          >
            Return to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-10 text-[#211f1b]">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-2xl font-semibold"
        >
          TrendKart<span className="text-[#b99a6b]">.</span>
        </Link>

        <div className="mt-8 flex items-center gap-3 text-sm text-gray-500">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1 hover:text-black"
          >
            <ArrowLeft size={15} />
            Back to cart
          </Link>

          <span>/</span>
          <span className="text-[#211f1b]">Payment</span>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-[#e6dfd4] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4eee5] text-[#806344]">
              <CreditCard size={23} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#9b815e]">
              Secure checkout
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Choose your payment
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Select a payment method to complete your TrendKart order.
            </p>

            {message && (
              <div
                role="alert"
                className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                  messageType === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => setSelectedMethod("cod")}
                disabled={loading}
                className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                  selectedMethod === "cod"
                    ? "border-[#806344] bg-[#f8f5f0]"
                    : "border-[#e6dfd4] bg-white"
                }`}
              >
                <Banknote size={24} className="text-[#806344]" />

                <div className="flex-1">
                  <p className="font-semibold">
                    Cash on Delivery
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Pay when your order arrives
                  </p>
                </div>

                <span className="text-sm">
                  {selectedMethod === "cod" ? "✓" : ""}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("razorpay")}
                disabled={loading}
                className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                  selectedMethod === "razorpay"
                    ? "border-[#806344] bg-[#f8f5f0]"
                    : "border-[#e6dfd4] bg-white"
                }`}
              >
                <CreditCard size={24} className="text-[#806344]" />

                <div className="flex-1">
                  <p className="font-semibold">
                    Online Payment
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Pay securely using Razorpay
                  </p>
                </div>

                <span className="text-sm">
                  {selectedMethod === "razorpay" ? "✓" : ""}
                </span>
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-[#eee9e1] bg-[#fbfaf8] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-[#806344]"
                />

                <div>
                  <h2 className="text-sm font-semibold">
                    Secure order processing
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    {selectedMethod === "cod"
                      ? "Your order will be saved after the server validates your items, stock, and shipping address."
                      : "Your payment will be verified by the server before your order is confirmed."}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={
                selectedMethod === "cod"
                  ? handleCOD
                  : handleRazorpay
              }
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#211f1b] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#38342d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : selectedMethod === "cod"
                  ? `Place Order · ${formatPrice(displayTotal)}`
                  : `Pay ${formatPrice(displayTotal)}`}
            </button>
          </section>

          <aside className="h-fit rounded-3xl border border-[#e6dfd4] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold">
              Order summary
            </h2>

            <div className="mt-6 space-y-4">
              {orderItems.map((item, index) => (
                <div
                  key={
                    item.product ||
                    item.productId ||
                    item._id ||
                    index
                  }
                  className="flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {item.name || item.title || "Product"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-medium">
                    {formatPrice(
                      Number(item.price || 0) *
                        Number(item.quantity || 1)
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-[#eee9e1]" />

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Estimated total</span>
              <span className="font-semibold text-[#211f1b]">
                {formatPrice(displayTotal)}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-400">
              The backend recalculates the final total using current
              product prices and shipping rules.
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-[#f8f5f0] p-3 text-xs text-[#806344]">
              <CheckCircle2 size={17} />
              <span>
                {selectedMethod === "cod"
                  ? "Pay when your order is delivered"
                  : "Secure Razorpay checkout"}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Payment;
