import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { clearCart } from "../redux/cartSlice";

function BuyNow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || item.qty || 1),
    0
  );

  const totalAmount = cartItems.reduce(
    (sum, item) =>
      sum +
      item.price * (item.quantity || item.qty || 1),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.city ||
      !formData.state ||
      !formData.pincode ||
      !formData.address
    ) {
      alert("Please fill all delivery details.");
      return false;
    }

    if (formData.phone.length < 10) {
      alert("Please enter a valid phone number.");
      return false;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return false;
    }

    return true;
  };

  const buildOrderData = () => {
    return {
      orderItems: cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity || item.qty || 1,
        price: item.price,
        image: item.image,
      })),

      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },

      email: formData.email,
      paymentMethod:
        paymentMethod === "card"
          ? "Card Payment"
          : "Cash on Delivery",

      totalAmount,
    };
  };

  const createOrder = async (orderData) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return null;
    }

    const { data } = await API.post(
      "/orders",
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    const orderData = buildOrderData();

    // Card payment: save checkout information before moving
    // to the Payment page.
    if (paymentMethod === "card") {
      sessionStorage.setItem(
        "pendingOrder",
        JSON.stringify(orderData)
      );

      navigate("/payment");
      return;
    }

    try {
      setLoading(true);

      const order = await createOrder(orderData);

      if (!order) return;

      dispatch(clearCart());

      navigate("/payment-success", {
        state: {
          message:
            "Order placed successfully. Cash on delivery selected.",
          order,
        },
      });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Order failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-8 shadow-xl lg:col-span-2">
          <h1 className="mb-6 text-3xl font-bold">
            Checkout
          </h1>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="rounded-lg border p-3"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="rounded-lg border p-3"
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="rounded-lg border p-3"
            />

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="rounded-lg border p-3"
            />

            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="rounded-lg border p-3"
            />

            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="PIN Code"
              className="rounded-lg border p-3"
            />
          </div>

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Complete Delivery Address"
            className="mt-4 h-32 w-full rounded-lg border p-3"
          />

          <div className="mt-6">
            <h2 className="mb-3 text-xl font-semibold">
              Payment Method
            </h2>

            <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg border p-3">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              Card Payment
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              Cash on Delivery
            </label>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Placing Order..."
              : paymentMethod === "card"
              ? `Continue to Pay ₹${totalAmount}`
              : `Place Order ₹${totalAmount}`}
          </button>
        </div>

        <div className="h-fit rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-2xl font-bold">
            Order Summary
          </h2>

          {cartItems.length === 0 ? (
            <p className="text-gray-500">
              Your cart is empty.
            </p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const quantity =
                  item.quantity || item.qty || 1;

                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Qty: {quantity}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₹{item.price * quantity}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <hr className="my-6" />

          <div className="mb-3 flex justify-between">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="mb-3 flex justify-between">
            <span>Shipping</span>
            <span className="text-green-600">
              Free
            </span>
          </div>

          <div className="flex justify-between text-2xl font-bold">
            <span>Total</span>
            <span className="text-green-600">
              ₹{totalAmount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyNow;