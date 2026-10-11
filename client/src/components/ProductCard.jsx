import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart, Heart, Tag } from "lucide-react";
import { addToCart } from "../redux/cartSlice";
import { toggleWishlist } from "../redux/wishlistSlice";
import { toast } from "react-hot-toast";
import { checkLogin } from "../utils/authCheck";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const isInCart = cartItems.some(
    (item) => item._id === product._id
  );

  const isInWishlist = wishlistItems.some(
    (item) => item._id === product._id
  );

  // Check whether the offer is currently valid.
  const now = new Date();

  const offerStarted =
    !product.offerStartDate ||
    now >= new Date(product.offerStartDate);

  const offerNotExpired =
    !product.offerEndDate ||
    now <= new Date(product.offerEndDate);

  const hasOffer =
    product.offerActive === true &&
    Number(product.offerPercent) > 0 &&
    Number(product.offerPercent) <= 100 &&
    offerStarted &&
    offerNotExpired;

  // Keep the original price unchanged.
  const originalPrice = Number(product.price) || 0;

  const discountedPrice = hasOffer
    ? Math.round(
        originalPrice *
          (1 - Number(product.offerPercent) / 100)
      )
    : originalPrice;

  const savings = originalPrice - discountedPrice;

  const formatPrice = (price) =>
    `₹${price.toLocaleString("en-IN")}`;

  const stock = Math.max(0, Number(product.stock) || 0);
  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (!checkLogin()) {
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (isInCart) {
      navigate("/cart");
      return;
    }

    dispatch(addToCart(product));
    toast.success("Product added to cart!");
  };

  const handleWishlist = () => {
    if (!checkLogin()) {
      return;
    }

    dispatch(toggleWishlist(product));

    if (isInWishlist) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Added to wishlist!");
    }
  };

  return (
    <div className="group overflow-hidden border border-[#e9e1d6] bg-[#fffdf9] transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Product Image */}
      <div className="relative bg-[#f3efe8]">
        <Link
          to={`/product/${product._id}`}
          state={{ product }}
          className="block"
        >
          <div className="flex h-64 items-center justify-center overflow-hidden sm:h-72">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain p-4 transition duration-700 group-hover:scale-105"
            />
          </div>
        </Link>

        {/* Offer Badge */}
        {hasOffer && (
          <div className="absolute left-3 top-3 flex items-center gap-1 bg-[#201d18] px-3 py-2 text-[10px] font-semibold tracking-wide text-white">
            <Tag size={12} />
            {product.offerPercent}% OFF
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={
            isInWishlist
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full transition ${
            isInWishlist
              ? "bg-[#201d18] text-white"
              : "bg-[#fffdf9] text-[#302b24] hover:bg-[#201d18] hover:text-white"
          }`}
        >
          <Heart
            size={18}
            strokeWidth={1.6}
            fill={isInWishlist ? "currentColor" : "none"}
          />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/65">
            <span className="bg-[#201d18] px-4 py-2 text-xs font-semibold tracking-[2px] text-white">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5">

        {product.brand && (
          <p className="text-[10px] font-medium uppercase tracking-[2px] text-[#9b7c53]">
            {product.brand}
          </p>
        )}

        <Link
          to={`/product/${product._id}`}
          state={{ product }}
        >
          <h3 className="mt-2 truncate text-base font-medium text-[#201d18] transition hover:text-[#9b7c53]">
            {product.name}
          </h3>
        </Link>

        {/* Price and Offer */}
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-semibold text-[#201d18]">
              {formatPrice(discountedPrice)}
            </span>

            {hasOffer && (
              <span className="text-sm text-[#968b7d] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {hasOffer && savings > 0 && (
            <p className="mt-1 text-xs font-medium text-[#7b6a4e]">
              You save {formatPrice(savings)}
            </p>
          )}
        </div>

        {/* Stock Information */}
        <p
          className={`mt-3 text-xs ${
            isOutOfStock
              ? "text-red-700"
              : stock <= 5
                ? "text-amber-700"
                : "text-[#777064]"
          }`}
        >
          {isOutOfStock
            ? "Currently unavailable"
            : stock <= 5
              ? `Only ${stock} left in stock`
              : "In stock"}
        </p>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/product/${product._id}`}
            state={{ product }}
            className="flex flex-1 items-center justify-center border border-[#ded5c9] px-2 py-3 text-xs font-medium text-[#302b24] transition hover:bg-[#f1ebe2]"
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex flex-1 items-center justify-center gap-2 bg-[#201d18] px-2 py-3 text-xs font-medium text-white transition hover:bg-[#8d704b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart size={15} />
            {isOutOfStock
              ? "Sold Out"
              : isInCart
                ? "View Cart"
                : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;