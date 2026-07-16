import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function BuyNow() {
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState(
    "Cash on Delivery"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = cartItems.reduce(
    (total, item) =>
      total + item.price * (item.quantity || item.qty || 1),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    try {
      setLoading(true);

      const orderItems = cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity || item.qty || 1,
      }));

      const { data } = await API.post("/orders", {
        orderItems,

        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },

        paymentMethod,
        totalAmount,
      });

      navigate("/payment-success", {
        state: {
          order: data,
        },
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-md md:p-10">
        <h1 className="mb-2 text-3xl font-bold">
          Checkout
        </h1>

        <p className="mb-8 text-gray-500">
          Enter your delivery information
        </p>

        {error && (
          <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={placeOrder}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">
                Full name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Phone number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-medium">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                State
              </label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Pincode
              </label>

              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Payment method
              </label>

              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              >
                <option value="Cash on Delivery">
                  Cash on Delivery
                </option>

                <option value="Online Payment">
                  Online Payment
                </option>
              </select>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-gray-100 p-5">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-black py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Placing Order..."
              : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BuyNow;