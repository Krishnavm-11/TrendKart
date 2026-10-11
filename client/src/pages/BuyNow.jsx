import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Plus,
  X,
  CircleAlert,
  Tag,
} from "lucide-react";

import API from "../services/api";
import { clearCart } from "../redux/cartSlice";

// Check whether a product offer is currently valid.
const isOfferValid = (item) => {
  const now = new Date();

  const started =
    !item.offerStartDate ||
    now >= new Date(item.offerStartDate);

  const notExpired =
    !item.offerEndDate ||
    now <= new Date(item.offerEndDate);

  return (
    item.offerActive === true &&
    Number(item.offerPercent) > 0 &&
    Number(item.offerPercent) <= 100 &&
    started &&
    notExpired
  );
};

// Calculate the discounted product price.
const getDiscountedPrice = (item) => {
  const originalPrice = Number(item.price || 0);

  if (!isOfferValid(item)) {
    return originalPrice;
  }

  return Math.round(
    originalPrice *
      (1 - Number(item.offerPercent) / 100)
  );
};

function BuyNow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector(
    (state) => state.cart
  );

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
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });

  const [addressToRemove, setAddressToRemove] = useState(null);

  // Display a styled notification.
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  // Load saved addresses when the page opens.
  useEffect(() => {
    try {
      const storedAddresses = localStorage.getItem(
        "trendkartAddresses"
      );

      const addresses = storedAddresses
        ? JSON.parse(storedAddresses)
        : [];

      if (Array.isArray(addresses) && addresses.length > 0) {
        setSavedAddresses(addresses);
        setSelectedAddressId(addresses[0].id);
        setFormData(addresses[0].details);
        setShowAddressForm(false);
      } else {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error("Unable to load saved addresses:", error);
      setShowAddressForm(true);
      showNotification(
        "Unable to load saved addresses.",
        "error"
      );
    }
  }, []);

  // Update form fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Save a new address.
  const saveAddress = () => {
    const {
      fullName,
      email,
      phone,
      city,
      state,
      pincode,
      address,
    } = formData;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim() ||
      !address.trim()
    ) {
      showNotification(
        "Please fill in all address fields.",
        "error"
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showNotification(
        "Please enter a valid email address.",
        "error"
      );
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      showNotification(
        "Please enter a valid 10-digit phone number.",
        "error"
      );
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      showNotification(
        "Please enter a valid 6-digit PIN code.",
        "error"
      );
      return;
    }

    const newAddress = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      details: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        address: address.trim(),
      },
    };

    const updatedAddresses = [
      ...savedAddresses,
      newAddress,
    ];

    try {
      localStorage.setItem(
        "trendkartAddresses",
        JSON.stringify(updatedAddresses)
      );

      setSavedAddresses(updatedAddresses);
      setSelectedAddressId(newAddress.id);
      setFormData(newAddress.details);
      setShowAddressForm(false);

      showNotification(
        "Address saved successfully.",
        "success"
      );
    } catch (error) {
      console.error("Unable to save address:", error);
      showNotification(
        "Unable to save address in this browser.",
        "error"
      );
    }
  };

  // Select a saved address.
  const selectAddress = (savedAddress) => {
    setSelectedAddressId(savedAddress.id);
    setFormData(savedAddress.details);
    setShowAddressForm(false);
  };

  // Open the new address form.
  const addNewAddress = () => {
    setSelectedAddressId("");

    setFormData({
      fullName: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      pincode: "",
      address: "",
    });

    setShowAddressForm(true);
  };

  // Cancel adding a new address.
  const cancelAddressForm = () => {
    if (savedAddresses.length > 0) {
      const previousAddress =
        savedAddresses.find(
          (item) => item.id === selectedAddressId
        ) || savedAddresses[0];

      selectAddress(previousAddress);
    } else {
      showNotification(
        "Please add a delivery address before checkout.",
        "error"
      );
    }
  };

  // Open the remove-address confirmation.
  const removeAddress = (id) => {
    setAddressToRemove(id);
  };

  // Remove the confirmed address.
  const confirmRemoveAddress = () => {
    if (!addressToRemove) return;

    const updatedAddresses = savedAddresses.filter(
      (item) => item.id !== addressToRemove
    );

    try {
      localStorage.setItem(
        "trendkartAddresses",
        JSON.stringify(updatedAddresses)
      );

      setSavedAddresses(updatedAddresses);

      if (selectedAddressId === addressToRemove) {
        if (updatedAddresses.length > 0) {
          setSelectedAddressId(updatedAddresses[0].id);
          setFormData(updatedAddresses[0].details);
          setShowAddressForm(false);
        } else {
          setSelectedAddressId("");

          setFormData({
            fullName: "",
            email: "",
            phone: "",
            city: "",
            state: "",
            pincode: "",
            address: "",
          });

          setShowAddressForm(true);
        }
      }

      setAddressToRemove(null);

      showNotification(
        "Address removed successfully.",
        "success"
      );
    } catch (error) {
      console.error("Unable to remove address:", error);
      setAddressToRemove(null);

      showNotification(
        "Unable to remove address.",
        "error"
      );
    }
  };

  // Calculate total quantity.
  const totalQuantity = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );

  // Calculate subtotal before discounts.
  const originalSubtotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  // Calculate subtotal after valid offers.
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      getDiscountedPrice(item) *
        Number(item.quantity || 1),
    0
  );

  // Calculate savings.
  const totalSavings = originalSubtotal - subtotal;

  // Apply shipping rules to the discounted subtotal.
  const shipping =
    subtotal === 0 || subtotal >= 999 ? 0 : 49;

  const totalAmount = subtotal + shipping;

  // Validate checkout.
  const validateCheckout = () => {
    if (cartItems.length === 0) {
      showNotification("Your cart is empty.", "error");
      navigate("/cart");
      return false;
    }

    if (showAddressForm) {
      showNotification(
        "Please save your address before continuing.",
        "error"
      );
      return false;
    }

    if (!selectedAddressId) {
      showNotification(
        "Please select a delivery address.",
        "error"
      );
      return false;
    }

    const {
      fullName,
      email,
      phone,
      city,
      state,
      pincode,
      address,
    } = formData;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim() ||
      !address.trim()
    ) {
      showNotification(
        "Please select a complete delivery address.",
        "error"
      );
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showNotification(
        "Please enter a valid email address.",
        "error"
      );
      return false;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      showNotification(
        "Please enter a valid 10-digit phone number.",
        "error"
      );
      return false;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      showNotification(
        "Please enter a valid 6-digit PIN code.",
        "error"
      );
      return false;
    }

    return true;
  };

  // Prepare checkout data.
  const createOrderData = () => {
    return {
      orderItems: cartItems.map((item) => ({
        product:
          item._id ||
          item.product?._id ||
          item.product,

        name: item.name,
        image: item.image,

        // Informational only.
        // The backend must calculate the actual price.
        price: getDiscountedPrice(item),

        quantity: Number(item.quantity || 1),
      })),

      shippingAddress: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        address: formData.address,
      },

      email: formData.email,
      subtotal,
      shipping,
      totalAmount,

      paymentMethod:
        paymentMethod === "card"
          ? "Card Payment"
          : "Cash on Delivery",
    };
  };

  // Place the order or continue to payment.
  const handleCheckout = async () => {
    if (!validateCheckout()) return;

    const orderData = createOrderData();

    // Card payment continues to the existing payment page.
    if (paymentMethod === "card") {
      try {
        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify(orderData)
        );

        navigate("/payment");
      } catch (error) {
        console.error(
          "Unable to save checkout details:",
          error
        );

        showNotification(
          "Unable to continue to payment. Please try again.",
          "error"
        );
      }

      return;
    }

    // Cash on delivery.
    try {
      setLoading(true);

      const response = await API.post(
        "/orders",
        orderData
      );

      dispatch(clearCart());

      navigate("/payment-success", {
        state: {
          order: response.data,
          message: "Your order has been placed successfully!",
        },
      });
    } catch (error) {
      console.error("Order creation failed:", error);

      showNotification(
        error.response?.data?.message ||
          "Unable to place your order. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const inputClass =
    "w-full rounded-lg border border-[#ded6ca] bg-white px-4 py-3 text-sm text-[#25221e] outline-none transition placeholder:text-[#a59b8e] focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/10";

  const labelClass =
    "mb-2 block text-sm font-medium text-[#51483e]";

  return (
    <div className="min-h-screen bg-[#f8f6f2] px-4 py-8 text-[#25221e] sm:px-6 lg:px-10">
      {/* Styled notification */}
      {notification.message && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-4 z-[60] flex max-w-sm items-center gap-3 rounded-xl border bg-white p-4 shadow-xl ${
            notification.type === "error"
              ? "border-red-200"
              : "border-[#d9cbbb]"
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              notification.type === "error"
                ? "bg-red-50 text-red-600"
                : "bg-[#f4efe7] text-[#8b7355]"
            }`}
          >
            {notification.type === "error" ? (
              <CircleAlert size={19} />
            ) : (
              <Check size={19} />
            )}
          </div>

          <p className="flex-1 text-sm text-[#25221e]">
            {notification.message}
          </p>

          <button
            type="button"
            onClick={() =>
              setNotification({
                message: "",
                type: "success",
              })
            }
            className="rounded-md p-1 text-[#8a8074] hover:bg-[#f4efe7] hover:text-black"
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#74695c] transition hover:text-black"
        >
          <ArrowLeft size={17} />
          Back to cart
        </button>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#8b7355]">
              TrendKart / Checkout
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Complete your order
            </h1>

            <p className="mt-2 text-sm text-[#81776b]">
              Your essentials, delivered with care.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#74695c]">
            <ShieldCheck
              size={19}
              className="text-[#8b7355]"
            />
            Secure checkout
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            {/* Delivery address */}
            <section className="rounded-2xl border border-[#e9e2d8] bg-white p-5 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4efe7]">
                    <MapPin
                      size={20}
                      className="text-[#8b7355]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      Delivery address
                    </h2>

                    <p className="mt-1 text-sm text-[#8a8074]">
                      Choose a saved address or add a new one.
                    </p>
                  </div>
                </div>

                {!showAddressForm && (
                  <button
                    type="button"
                    onClick={addNewAddress}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#d9cbbb] px-3 py-2 text-sm font-medium text-[#6e5941] transition hover:bg-[#f8f4ee]"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">
                      Add new
                    </span>
                  </button>
                )}
              </div>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  {savedAddresses.map((savedAddress) => {
                    const details = savedAddress.details;
                    const isSelected =
                      selectedAddressId === savedAddress.id;

                    return (
                      <div
                        key={savedAddress.id}
                        className={`rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-[#8b7355] bg-[#faf7f2]"
                            : "border-[#e9e2d8] bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={isSelected}
                            onChange={() =>
                              selectAddress(savedAddress)
                            }
                            className="mt-1 h-4 w-4 accent-[#8b7355]"
                            aria-label={`Select address for ${details.fullName}`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              selectAddress(savedAddress)
                            }
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold">
                                {details.fullName}
                              </span>

                              {isSelected && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#e9dfd0] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#6e5941]">
                                  <Check size={11} />
                                  Selected
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm leading-6 text-[#766c60]">
                              {details.address}, {details.city},{" "}
                              {details.state} - {details.pincode}
                            </p>

                            <p className="mt-1 text-sm text-[#8a8074]">
                              {details.phone}
                            </p>

                            <p className="mt-1 break-all text-sm text-[#8a8074]">
                              {details.email}
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeAddress(savedAddress.id)
                            }
                            title="Remove address"
                            aria-label={`Remove address for ${details.fullName}`}
                            className="rounded-lg p-2 text-[#9a776d] transition hover:bg-[#f5e9e5] hover:text-red-700"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add address form */}
              {showAddressForm && (
                <div className="rounded-xl border border-[#e9e2d8] bg-[#fcfbf9] p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">
                      {savedAddresses.length > 0
                        ? "Add another address"
                        : "Add your delivery address"}
                    </h3>

                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={cancelAddressForm}
                        className="rounded-full p-1 text-[#8a8074] transition hover:bg-[#eee7dc]"
                        aria-label="Cancel adding address"
                      >
                        <X size={19} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Full name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Email address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Phone number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        placeholder="10-digit phone number"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        PIN code
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        maxLength={6}
                        placeholder="6-digit PIN code"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        Full address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="House number, street, landmark..."
                        className={`${inputClass} resize-y`}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={saveAddress}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25221e] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#40382f]"
                    >
                      <Check size={17} />
                      Save address
                    </button>

                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={cancelAddressForm}
                        className="rounded-lg border border-[#ded6ca] px-5 py-3 text-sm font-medium text-[#6c6256] transition hover:bg-[#f3eee7]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Payment method */}
            <section className="rounded-2xl border border-[#e9e2d8] bg-white p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4efe7]">
                  <CreditCard
                    size={20}
                    className="text-[#8b7355]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Payment method
                  </h2>

                  <p className="mt-1 text-sm text-[#8a8074]">
                    Choose how you would like to pay.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`rounded-xl border p-4 text-left transition ${
                    paymentMethod === "card"
                      ? "border-[#8b7355] bg-[#faf7f2]"
                      : "border-[#e9e2d8] hover:bg-[#fcfbf9]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <CreditCard
                      size={22}
                      className="text-[#8b7355]"
                    />

                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        paymentMethod === "card"
                          ? "border-[#8b7355] bg-[#8b7355] text-white"
                          : "border-[#d9d0c5]"
                      }`}
                    >
                      {paymentMethod === "card" && (
                        <Check size={12} />
                      )}
                    </span>
                  </div>

                  <p className="font-semibold">Card payment</p>
                  <p className="mt-1 text-sm text-[#8a8074]">
                    Continue to the payment page.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`rounded-xl border p-4 text-left transition ${
                    paymentMethod === "cod"
                      ? "border-[#8b7355] bg-[#faf7f2]"
                      : "border-[#e9e2d8] hover:bg-[#fcfbf9]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Truck
                      size={22}
                      className="text-[#8b7355]"
                    />

                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        paymentMethod === "cod"
                          ? "border-[#8b7355] bg-[#8b7355] text-white"
                          : "border-[#d9d0c5]"
                      }`}
                    >
                      {paymentMethod === "cod" && (
                        <Check size={12} />
                      )}
                    </span>
                  </div>

                  <p className="font-semibold">
                    Cash on delivery
                  </p>
                  <p className="mt-1 text-sm text-[#8a8074]">
                    Pay when your order arrives.
                  </p>
                </button>
              </div>
            </section>
          </div>

          {/* Order summary */}
          <aside>
            <div className="sticky top-6 rounded-2xl border border-[#e9e2d8] bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4efe7]">
                  <ShoppingBag
                    size={19}
                    className="text-[#8b7355]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Order summary
                  </h2>

                  <p className="text-sm text-[#8a8074]">
                    {totalQuantity}{" "}
                    {totalQuantity === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              {/* Products */}
              <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
                {cartItems.map((item, index) => {
                  const originalPrice = Number(item.price || 0);
                  const discountedPrice =
                    getDiscountedPrice(item);
                  const quantity = Number(item.quantity || 1);
                  const hasOffer = isOfferValid(item);

                  return (
                    <div
                      key={
                        item._id ||
                        item.product?._id ||
                        index
                      }
                      className="flex gap-3"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f4f0e9]">
                        <img
                          src={
                            item.image ||
                            "https://placehold.co/200x250/f5f0e8/292929?text=TrendKart"
                          }
                          alt={item.name || "Product"}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium">
                          {item.name || "Product"}
                        </p>

                        <p className="mt-1 text-xs text-[#8a8074]">
                          Qty: {quantity}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">
                            {formatPrice(
                              discountedPrice * quantity
                            )}
                          </span>

                          {hasOffer && (
                            <>
                              <span className="text-xs text-[#938a80] line-through">
                                {formatPrice(
                                  originalPrice * quantity
                                )}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded bg-[#f3eee6] px-2 py-1 text-[10px] font-semibold text-[#876744]">
                                <Tag size={11} />
                                {item.offerPercent}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="my-5 border-t border-[#eee8df]" />

              {/* Price details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3 text-[#81776b]">
                  <span>Original subtotal</span>
                  <span>{formatPrice(originalSubtotal)}</span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-emerald-700">
                      Offer savings
                    </span>

                    <span className="font-medium text-emerald-700">
                      −{formatPrice(totalSavings)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3 text-[#81776b]">
                  <span>Discounted subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between gap-3 text-[#81776b]">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0
                      ? "Free"
                      : formatPrice(shipping)}
                  </span>
                </div>

                {shipping === 0 && subtotal > 0 && (
                  <p className="text-xs text-[#8b7355]">
                    Free shipping applied.
                  </p>
                )}
              </div>

              <div className="my-5 border-t border-[#eee8df]" />

              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">Total</span>

                <span className="text-2xl font-semibold tracking-tight">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25221e] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#40382f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  "Placing order..."
                ) : (
                  <>
                    {paymentMethod === "card"
                      ? "Continue to payment"
                      : "Place order"}

                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8a8074]">
                <ShieldCheck size={15} />
                Safe and secure checkout
              </div>

              <div className="mt-5 rounded-xl bg-[#f8f6f2] p-4">
                <div className="flex items-start gap-3">
                  <Package
                    size={19}
                    className="mt-0.5 shrink-0 text-[#8b7355]"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Carefully packed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#8a8074]">
                      Your selected delivery address will be
                      included with your order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Remove-address confirmation modal */}
      {addressToRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setAddressToRemove(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-address-title"
            className="w-full max-w-md rounded-2xl border border-[#e9e2d8] bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4efe7] text-[#8b7355]">
              <Trash2 size={22} />
            </div>

            <h2
              id="remove-address-title"
              className="text-xl font-semibold text-[#25221e]"
            >
              Remove this address?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#81776b]">
              This saved delivery address will be removed from
              your list. You can add it again later.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setAddressToRemove(null)}
                className="flex-1 rounded-lg border border-[#ded6ca] px-4 py-3 text-sm font-medium text-[#51483e] hover:bg-[#f8f6f2]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRemoveAddress}
                className="flex-1 rounded-lg bg-[#25221e] px-4 py-3 text-sm font-medium text-white hover:bg-[#40382f]"
              >
                Remove address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyNow;