import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import API from "../services/api";
import { addToCart } from "../redux/cartSlice";

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <h2 className="text-center mt-10">Loading...</h2>;
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    navigate("/cart");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white shadow-xl rounded-2xl p-6">

        <div className="flex items-center justify-center bg-gray-100 rounded-xl p-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-h-[450px] object-contain"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-3">{product.name}</h1>

          <div className="flex justify-between text-gray-500 mb-4">
            <span>Brand: {product.brand}</span>
            <span>Category: {product.category}</span>
          </div>

          <p className="text-gray-700 mb-5">
            {product.description}
          </p>

          <h2 className="text-3xl font-bold text-green-600 mb-3">
            ₹{product.price}
          </h2>

          <p className="mb-6">
            Stock:
            <span className="font-semibold ml-2">
              {product.stock}
            </span>
          </p>

          <button
            onClick={handleAddToCart}
            className="bg-black text-white py-3 rounded-lg text-lg hover:bg-gray-800 transition"
          >
           Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;