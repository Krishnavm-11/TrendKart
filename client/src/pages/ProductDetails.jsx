import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  Tag,
  PackageCheck,
} from "lucide-react";

import {
  addToCart,
  updateCartItemSize,
} from "../redux/cartSlice";

import { toast } from "react-hot-toast";
import { checkLogin } from "../utils/authCheck";

function ProductDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const product = location.state?.product;

  const cartItems = useSelector(
    (state) => state.cart.cartItems || []
  );

  const existingCartItem = cartItems.find(
    (item) => String(item._id) === String(product?._id)
  );

  const [selectedSize, setSelectedSize] = useState(
    existingCartItem?.selectedSize || ""
  );

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] px-6 py-20 text-center">
        <ShoppingBag
          size={42}
          className="mx-auto mb-4 text-[#8b7963]"
        />

        <h2 className="text-2xl font-semibold text-[#29251f]">
          Product not found
        </h2>

        <p className="mt-2 text-sm text-[#756b5f]">
          Please return to the shop and choose a product.
        </p>

        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 bg-[#29251f] px-6 py-3 text-sm text-white transition hover:bg-[#514536]"
        >
          <ArrowLeft size={16} />
          Back to Shopping
        </Link>
      </div>
    );
  }

  const originalPrice = Number(product.price) || 0;
  const offerPercent = Number(product.offerPercent) || 0;

  const offerActive =
    product.offerActive === true &&
    offerPercent > 0 &&
    offerPercent <= 100;

  const discountedPrice = offerActive
    ? Math.round(originalPrice * (1 - offerPercent / 100))
    : originalPrice;

  const stock = Math.max(0, Number(product.stock) || 0);

  // Determine sizes using the product category
  const category = (product.category || "").toLowerCase();

  let sizeOptions = [];

  if (
    category.includes("footwear") ||
    category.includes("shoes") ||
    category.includes("sandal") ||
    category.includes("sneaker")
  ) {
    sizeOptions = ["4", "5", "6", "7", "8", "9"];
  } else if (category.includes("kid")) {
    sizeOptions = [
      "0–1 years",
      "1–2 years",
      "2–4 years",
      "4–6 years",
      "6–8 years",
      "8–10 years",
      "10–12 years",
    ];
  } else if (category.includes("accessor")) {
    sizeOptions = ["Free Size"];
  } else if (
    category.includes("men") ||
    category.includes("women") ||
    category.includes("cloth") ||
    category.includes("shirt") ||
    category.includes("dress") ||
    category.includes("fashion") ||
    category.includes("jeans") ||
    category.includes("t-shirt") ||
    category.includes("top")
  ) {
    sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  }

  // Check whether this product already exists in the cart
  const isInCart = cartItems.some(
    (item) => String(item._id) === String(product._id)
  );

  // Validate before purchase
  const validateProduct = () => {
    if (stock <= 0) {
      toast.error("This product is currently out of stock.");
      return false;
    }

    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error("Please select a size first.");
      return false;
    }

    return true;
  };

  // Add to cart or open the cart if the product already exists
  const handleAddToCart = () => {
    if (!checkLogin()) return;

    if (!validateProduct()) return;

    if (isInCart) {
      navigate("/cart");
      return;
    }

    dispatch(
      addToCart({
        ...product,
        originalPrice,
        price: discountedPrice,
        selectedSize: selectedSize || null,
      })
    );

    toast.success("Product added to cart!");
  };

  // Buy now
  const handleBuyNow = () => {
    if (!checkLogin()) return;

    if (!validateProduct()) return;

    if (isInCart) {
      dispatch(
        updateCartItemSize({
          id: product._id,
          selectedSize: selectedSize || null,
        })
      );
    } else {
      dispatch(
        addToCart({
          ...product,
          originalPrice,
          price: discountedPrice,
          selectedSize: selectedSize || null,
        })
      );
    }

    navigate("/buy");
  };

  // Change the size and update the existing cart item
  const handleSizeChange = (size) => {
    setSelectedSize(size);

    const existingItem = cartItems.find(
      (item) => String(item._id) === String(product._id)
    );

    if (existingItem) {
      dispatch(
        updateCartItemSize({
          id: product._id,
          selectedSize: size,
        })
      );
    }
  };

  // Clear the selected size
  const handleClearSize = () => {
    setSelectedSize("");

    const existingItem = cartItems.find(
      (item) => String(item._id) === String(product._id)
    );

    if (existingItem) {
      dispatch(
        updateCartItemSize({
          id: product._id,
          selectedSize: null,
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] px-4 py-8 sm:px-8 lg:px-16">
      <Link
        to="/shop"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[#62574a] transition hover:text-[#29251f]"
      >
        <ArrowLeft size={16} />
        Back to Shopping
      </Link>

      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        {/* Product image */}
        <div className="flex items-center justify-center bg-white p-6">
          <img
            src={
              product.image ||
              product.images?.[0] ||
              product.thumbnail ||
              "https://placehold.co/400x500/f5f0e8/292929?text=TrendKart"
            }
            alt={product.name || "Product"}
            className="max-h-[500px] w-full object-contain"
          />
        </div>

        {/* Product information */}
        <div className="flex flex-col">
          {product.brand && (
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#8b7963]">
              {product.brand}
            </p>
          )}

          <h1 className="text-3xl font-semibold leading-tight text-[#29251f] sm:text-4xl">
            {product.name || product.title}
          </h1>

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold text-[#29251f]">
              ₹{discountedPrice.toLocaleString("en-IN")}
            </span>

            {offerActive && (
              <>
                <span className="text-base text-[#948a7e] line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>

                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                  <Tag size={14} />
                  {offerPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[#756b5f]">
            {product.description}
          </p>

          {/* Size selection */}
          {sizeOptions.length > 0 && (
            <div className="mt-4">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-medium text-[#62574a]">
                  {selectedSize
                    ? `Selected Size: ${selectedSize}`
                    : "Choose Size"}
                </label>

                {selectedSize && (
                  <button
                    type="button"
                    onClick={handleClearSize}
                    className="text-xs text-[#8b7963] underline transition hover:text-[#29251f]"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    aria-pressed={selectedSize === size}
                    className={`min-w-11 border px-4 py-2 text-sm transition ${
                      selectedSize === size
                        ? "border-[#29251f] bg-[#29251f] text-white"
                        : "border-[#ded8ce] bg-white text-[#29251f] hover:border-[#8b7963]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {!selectedSize && (
                <p className="mt-2 text-xs text-amber-700">
                  Please select a size before checkout.
                </p>
              )}
            </div>
          )}

          {/* Stock status */}
          <div className="mt-5 flex items-center gap-2 text-sm">
            <PackageCheck
              size={17}
              className={
                stock > 0 ? "text-green-700" : "text-red-600"
              }
            />

            <span
              className={
                stock > 0 ? "text-green-700" : "text-red-600"
              }
            >
              {stock > 0 ? `${stock} items available` : "Out of stock"}
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className="flex flex-1 items-center justify-center gap-2 bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#514536] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={17} />
              {isInCart ? "VIEW CART" : "ADD TO CART"}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={stock <= 0}
              className="flex flex-1 items-center justify-center gap-2 border border-[#29251f] px-5 py-3 text-sm font-medium text-[#29251f] transition hover:bg-[#eae5dc] disabled:cursor-not-allowed disabled:opacity-50"
            >
              BUY NOW
              <ArrowRight size={17} />
            </button>
          </div>

          {/* Delivery and security information */}
          <div className="mt-8 space-y-4 border-t border-[#ded8ce] pt-6">
            <div className="flex items-start gap-3">
              <Truck
                size={19}
                className="mt-0.5 text-[#8b7963]"
              />

              <div>
                <p className="text-sm font-medium text-[#29251f]">
                  Delivery Information
                </p>

                <p className="mt-1 text-xs leading-5 text-[#756b5f]">
                  Delivery availability and timing may vary by location.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 text-[#8b7963]"
              />

              <div>
                <p className="text-sm font-medium text-[#29251f]">
                  Secure Shopping
                </p>

                <p className="mt-1 text-xs leading-5 text-[#756b5f]">
                  Shop with confidence using our secure checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;