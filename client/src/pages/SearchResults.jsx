import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { setProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await API.get("/products");
      dispatch(setProducts(data));
    };

    fetchProducts();
  }, [dispatch]);

  const results = products.filter((product) =>
    `${product.name} ${product.brand} ${product.category} ${product.description}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for "{query}"
      </h1>

      {results.length === 0 ? (
        <p className="text-gray-500">Item not found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;