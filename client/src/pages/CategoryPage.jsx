import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

import API from "../services/api";
import { setProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";

function CategoryPage() {
  const { categoryName } = useParams();
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        dispatch(setProducts(data));
      } catch (error) {
        console.log("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [dispatch]);

  const filteredProducts = products.filter(
    (product) =>
      product.category?.toLowerCase() ===
      categoryName?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

        {/* Back Navigation */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#777066] transition-colors hover:text-black"
        >
          <ArrowLeft size={16} strokeWidth={1.6} />
          Back to Home
        </Link>

        {/* Category Heading */}
        <div className="mb-10 border-b border-[#e8e1d7] pb-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e1d7] bg-[#f2ede5] text-[#29251f]">
              <ShoppingBag size={21} strokeWidth={1.5} />
            </div>

            <span className="text-xs font-medium uppercase tracking-[0.22em] text-[#8b8175]">
              TrendKart Collection
            </span>
          </div>

          <h1 className="text-3xl font-semibold capitalize tracking-tight text-[#29251f] sm:text-4xl">
            {categoryName}
          </h1>

          <p className="mt-2 text-sm text-[#81796f]">
            Discover pieces selected for your style.
          </p>
        </div>

        {/* Product Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#777066]">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[#e8e1d7] bg-white px-6 text-center">
            <ShoppingBag
              size={35}
              strokeWidth={1.3}
              className="mb-4 text-[#a59a8c]"
            />

            <h2 className="text-lg font-medium text-[#29251f]">
              No products found
            </h2>

            <p className="mt-2 text-sm text-[#81796f]">
              There are currently no products in this collection.
            </p>

            <Link
              to="/"
              className="mt-6 border border-[#29251f] px-6 py-3 text-xs font-medium uppercase tracking-widest text-[#29251f] transition-colors hover:bg-[#29251f] hover:text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;