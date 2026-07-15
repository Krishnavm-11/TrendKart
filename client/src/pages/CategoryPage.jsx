import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
        console.log(error);
      }
    };

    fetchProducts();
  }, [dispatch]);

  const filteredProducts = products.filter(
    (product) =>
      product.category?.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {categoryName}
      </h1>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;