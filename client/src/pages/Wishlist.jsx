import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  removeFromWishlist,
} from "../redux/wishlistSlice";
import { addToCart } from "../redux/cartSlice";
import { checkLogin } from "../utils/authCheck";

function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wishlistItems } = useSelector(
    (state) => state.wishlist
  );

  const { cartItems } = useSelector(
    (state) => state.cart
  );

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = (product) => {
    if (!checkLogin()) {
      return;
    }

    const isInCart = cartItems.some(
      (item) => item._id === product._id
    );

    if (isInCart) {
      navigate("/cart");
      return;
    }

    dispatch(addToCart(product));
    dispatch(removeFromWishlist(product._id));

    toast.success("Added to cart");
  };

  return (
    <main className="min-h-screen bg-[#fffdf9] px-4 py-10 text-[#201d18] sm:px-6 sm:py-14 lg:px-12">

      <div className="mx-auto max-w-[1400px]">

        {/* Page Heading */}
        <div className="mb-9 border-b border-[#e8e0d5] pb-7 sm:mb-12 sm:pb-9">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-[#f1ebe2] text-[#9b7c53]">
              <Heart size={22} strokeWidth={1.5} />
            </div>

            <div>
              <p className="text-[9px] font-semibold tracking-[3px] text-[#a1845d]">
                YOUR PERSONAL COLLECTION
              </p>

              <h1 className="mt-1 font-serif text-3xl font-medium sm:text-4xl">
                My Wishlist
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#82786b]">
            Keep your favourite finds close and come back to them anytime.
          </p>

          {wishlistItems.length > 0 && (
            <p className="mt-3 text-xs font-medium tracking-wide text-[#9b7c53]">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "ITEM" : "ITEMS"} SAVED
            </p>
          )}
        </div>

        {/* Empty Wishlist */}
        {wishlistItems.length === 0 ? (
          <section className="flex flex-col items-center border border-[#e8e0d5] bg-[#f8f4ed] px-5 py-16 text-center sm:py-24">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fffdf9] text-[#a1845d]">
              <Heart size={34} strokeWidth={1.2} />
            </div>

            <h2 className="mt-7 font-serif text-2xl sm:text-3xl">
              Nothing saved just yet.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#82786b]">
              When you find something you love, save it here to revisit it whenever you're ready.
            </p>

            <Link
              to="/"
              className="mt-7 inline-flex items-center gap-3 bg-[#201d18] px-7 py-4 text-xs font-semibold tracking-[1.5px] text-white transition hover:bg-[#8d704b]"
            >
              <ShoppingBag size={17} />
              EXPLORE COLLECTIONS
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <>
            {/* Wishlist Products */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">

              {wishlistItems.map((product) => {
                const isInCart = cartItems.some(
                  (item) => item._id === product._id
                );

                return (
                  <article
                    key={product._id}
                    className="group min-w-0"
                  >

                    {/* Product Image */}
                    <div className="relative overflow-hidden bg-[#f2eee7]">

                      <Link
                        to={`/product/${product._id}`}
                        state={{ product }}
                        className="block"
                      >
                        <div className="aspect-[3/4] overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      </Link>

                      {/* Remove from Wishlist */}
                      <button
                        type="button"
                        title="Remove from wishlist"
                        aria-label={`Remove ${product.name} from wishlist`}
                        onClick={() => handleRemove(product._id)}
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#fffdf9]/95 text-[#302b24] shadow-sm transition hover:bg-[#201d18] hover:text-white"
                      >
                        <Trash2 size={17} strokeWidth={1.6} />
                      </button>

                      {/* Saved Label */}
                      <span className="absolute bottom-3 left-3 bg-[#fffdf9]/95 px-3 py-1.5 text-[9px] font-semibold tracking-[1.5px] text-[#8d704b]">
                        <Heart
                          size={11}
                          fill="currentColor"
                          className="mr-1 inline"
                        />
                        SAVED
                      </span>
                    </div>

                    {/* Product Information */}
                    <div className="pt-4">

                      {product.brand && (
                        <p className="text-[9px] font-medium uppercase tracking-[2px] text-[#9b7c53]">
                          {product.brand}
                        </p>
                      )}

                      <Link
                        to={`/product/${product._id}`}
                        state={{ product }}
                        className="mt-2 flex items-start justify-between gap-2"
                      >
                        <h2 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-[#28241e] transition hover:text-[#9b7c53] sm:text-[15px]">
                          {product.name}
                        </h2>

                        <ArrowUpRight
                          size={16}
                          className="mt-0.5 shrink-0 text-[#9b7c53] opacity-0 transition group-hover:opacity-100"
                        />
                      </Link>

                      <p className="mt-2 text-base font-semibold text-[#201d18] sm:text-lg">
                        ₹{product.price}
                      </p>

                      {/* Add to Cart */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 px-3 py-3 text-[10px] font-semibold tracking-[1px] transition sm:text-xs ${
                          isInCart
                            ? "border border-[#d9d0c3] bg-[#f3eee6] text-[#302b24] hover:bg-[#e9dfd1]"
                            : "bg-[#201d18] text-white hover:bg-[#8d704b]"
                        }`}
                      >
                        <ShoppingBag size={16} strokeWidth={1.7} />
                        {isInCart ? "VIEW CART" : "ADD TO CART"}
                      </button>

                      {/* View Details */}
                      <Link
                        to={`/product/${product._id}`}
                        state={{ product }}
                        className="mt-3 flex items-center justify-center gap-2 py-2 text-[10px] font-semibold tracking-[1.5px] text-[#746b5f] transition hover:text-[#9b7c53]"
                      >
                        VIEW DETAILS
                        <ArrowRight size={14} />
                      </Link>

                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Wishlist;