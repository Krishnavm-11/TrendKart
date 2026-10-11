import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  increaseQty,
  decreaseQty,
  removeFromCart,
  selectCartItemSize,
} from "../redux/cartSlice";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Tag,
} from "lucide-react";

// Categories that require a size
const getSizeOptions = (category = "") => {
  const value = category.toLowerCase();

  if (
    value.includes("footwear") ||
    value.includes("shoes") ||
    value.includes("sandal") ||
    value.includes("sneaker")
  ) {
    return ["4", "5", "6", "7", "8", "9"];
  }

  if (value.includes("kid")) {
    return [
      "0–1 years",
      "1–2 years",
      "2–4 years",
      "4–6 years",
      "6–8 years",
      "8–10 years",
      "10–12 years",
    ];
  }

  if (value.includes("accessor")) {
    return ["Free Size"];
  }

  if (
    value.includes("men") ||
    value.includes("women") ||
    value.includes("cloth") ||
    value.includes("shirt") ||
    value.includes("dress") ||
    value.includes("fashion") ||
    value.includes("jeans") ||
    value.includes("t-shirt") ||
    value.includes("top")
  ) {
    return ["XS", "S", "M", "L", "XL", "XXL"];
  }

  // Unknown categories do not require a size by default
  return [];
};

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector(
    (state) => state.cart.cartItems
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  const getProductImage = (item) => {
    if (item.image) return item.image;

    if (item.images?.length) return item.images[0];

    if (item.thumbnail) return item.thumbnail;

    return "https://placehold.co/400x500/f5f0e8/292929?text=TrendKart";
  };

  // Check whether an offer is still valid
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

  // Get original price without applying the discount twice
  const getOriginalPrice = (item) => {
    if (item.originalPrice !== undefined) {
      return Number(item.originalPrice) || 0;
    }

    return Number(item.price) || 0;
  };

  const getDiscountedPrice = (item) => {
    const originalPrice = getOriginalPrice(item);

    if (
      isOfferValid(item) &&
      Number(item.offerPercent) > 0
    ) {
      return Math.round(
        originalPrice *
          (1 - Number(item.offerPercent) / 100)
      );
    }

    return Number(item.price) || originalPrice;
  };

  // Require size selection only for categories with size options
  const needsSize = (item) =>
    getSizeOptions(item.category).length > 0;

  const hasMissingSize = cartItems.some(
    (item) => needsSize(item) && !item.selectedSize
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const originalSubtotal = cartItems.reduce(
    (total, item) =>
      total +
      getOriginalPrice(item) *
        Number(item.quantity || 1),
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      getDiscountedPrice(item) *
        Number(item.quantity || 1),
    0
  );

  const totalSavings = Math.max(
    0,
    originalSubtotal - subtotal
  );

  // Update quantity for the correct product and size
  const getItemPayload = (item) => ({
    id: item._id,
    selectedSize: item.selectedSize || null,
  });

  const handleCheckout = () => {
    if (hasMissingSize) {
      return;
    }

    navigate("/buy");
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] px-4 py-10 text-[#1c1c1c] sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-8 border-b border-[#ded8ce] pb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-[#8b7963]">
            Your Shopping Bag
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Shopping Cart
          </h1>

          <p className="mt-3 text-sm text-[#77716a]">
            Review your selections before completing your order.
          </p>
        </div>

        {/* Empty cart */}
        {cartItems.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center border border-[#e5dfd5] bg-white px-6 py-14 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f3eee6]">
              <ShoppingBag size={32} strokeWidth={1.3} />
            </div>

            <h2 className="text-2xl font-medium">
              Your cart is waiting
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-[#77716a]">
              You haven't added anything to your shopping bag yet.
              Discover something you love.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-8 inline-flex items-center gap-3 bg-[#1c1c1c] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#8b7963]"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">

            {/* Product list */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  Your Items
                </h2>

                <span className="text-sm text-[#77716a]">
                  {totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"}
                </span>
              </div>

              {cartItems.map((item, index) => {
                const originalPrice = getOriginalPrice(item);
                const discountedPrice = getDiscountedPrice(item);
                const hasOffer =
                  isOfferValid(item) &&
                  discountedPrice < originalPrice;

                const quantity = Number(item.quantity || 1);
                const itemTotal = discountedPrice * quantity;
                const sizes = getSizeOptions(item.category);
                const itemPayload = getItemPayload(item);

                return (
                  <div
                    key={`${item._id}-${item.selectedSize || "no-size"}-${index}`}
                    className="flex gap-4 border border-[#e5dfd5] bg-white p-4 sm:gap-6 sm:p-5"
                  >
                    {/* Product image */}
                    <button
                      onClick={() =>
                        navigate(`/product/${item._id}`, {
                          state: { product: item },
                        })
                      }
                      className="h-36 w-28 shrink-0 overflow-hidden bg-[#f3eee6] sm:h-44 sm:w-36"
                    >
                      <img
                        src={getProductImage(item)}
                        alt={item.name || "Product"}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </button>

                    {/* Product details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#8b7963]">
                              TrendKart Collection
                            </p>

                            <h3 className="text-base font-medium sm:text-lg">
                              {item.name || item.title || "Product"}
                            </h3>

                            {item.category && (
                              <p className="mt-2 text-sm text-[#77716a]">
                                {item.category}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              dispatch(removeFromCart(itemPayload))
                            }
                            aria-label="Remove product"
                            className="shrink-0 p-2 text-[#77716a] transition hover:bg-[#f5eee7] hover:text-red-600"
                          >
                            <Trash2 size={18} strokeWidth={1.5} />
                          </button>
                        </div>

                        {/* Size selector */}
                        {sizes.length > 0 && (
                          <div className="mt-3">
                            <label className="mb-1 block text-xs font-medium text-[#62574a]">
                              {item.selectedSize
                                ? "Selected Size"
                                : "Choose Size"}
                            </label>

                            <select
                              value={item.selectedSize || ""}
                              onChange={(event) => {
                                dispatch(
                                  selectCartItemSize({
                                    id: item._id,
                                    oldSize: item.selectedSize || null,
                                    newSize: event.target.value,
                                  })
                                );
                              }}
                              className="w-full max-w-40 border border-[#ded8ce] bg-white px-3 py-2 text-sm outline-none focus:border-[#8b7963]"
                            >
                              <option value="" disabled>
                                Select size
                              </option>

                              {sizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>

                            {!item.selectedSize && (
                              <p className="mt-1 text-xs text-amber-700">
                                Please select a size before checkout.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold">
                            {formatPrice(discountedPrice)}
                          </p>

                          {hasOffer && (
                            <>
                              <p className="text-sm text-[#938a80] line-through">
                                {formatPrice(originalPrice)}
                              </p>

                              <span className="inline-flex items-center gap-1 bg-[#f3eee6] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#876744]">
                                <Tag size={11} />
                                {item.offerPercent}% off
                              </span>
                            </>
                          )}
                        </div>

                        {hasOffer && (
                          <p className="mt-1 text-xs text-emerald-700">
                            You save{" "}
                            {formatPrice(originalPrice - discountedPrice)}{" "}
                            per item
                          </p>
                        )}
                      </div>

                      {/* Quantity controls */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center border border-[#ded8ce]">
                          <button
                            onClick={() =>
                              dispatch(decreaseQty(itemPayload))
                            }
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                            className="p-2.5 transition hover:bg-[#f3eee6] disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-10 text-center text-sm">
                            {quantity}
                          </span>

                          <button
                            onClick={() =>
                              dispatch(increaseQty(itemPayload))
                            }
                            aria-label="Increase quantity"
                            className="p-2.5 transition hover:bg-[#f3eee6]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <p className="text-sm font-semibold">
                          {formatPrice(itemTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 py-3 text-sm text-[#62574a] transition hover:text-black"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </button>
            </div>

            {/* Order summary */}
            <aside className="border border-[#e5dfd5] bg-white p-6 sm:p-7 lg:sticky lg:top-6">
              <h2 className="text-xl font-medium">
                Order Summary
              </h2>

              <p className="mt-2 text-sm text-[#77716a]">
                Your available discounts are reflected below.
              </p>

              <div className="my-6 border-t border-[#e5dfd5]" />

              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#77716a]">
                    Original subtotal
                  </span>

                  <span className="font-medium">
                    {formatPrice(originalSubtotal)}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-emerald-700">
                      Offer savings
                    </span>

                    <span className="font-semibold text-emerald-700">
                      −{formatPrice(totalSavings)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-4">
                  <span className="text-[#77716a]">
                    Subtotal ({totalItems}{" "}
                    {totalItems === 1 ? "item" : "items"})
                  </span>

                  <span className="font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#77716a]">
                    Shipping
                  </span>

                  <span className="font-medium">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-[#e5dfd5]" />

              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold">
                  Estimated Total
                </span>

                <span className="text-xl font-semibold">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#77716a]">
                Shipping charges will be confirmed during checkout.
              </p>

              <button
                onClick={handleCheckout}
                disabled={hasMissingSize}
                className="mt-7 flex w-full items-center justify-center gap-3 bg-[#1c1c1c] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#8b7963] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>

              {hasMissingSize && (
                <p className="mt-3 text-center text-xs text-amber-700">
                  Select a size for each clothing or footwear item.
                </p>
              )}

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#77716a]">
                <ShieldCheck size={16} strokeWidth={1.5} />
                Secure checkout
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;