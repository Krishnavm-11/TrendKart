import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-64 object-cover"
      />

      <div className="p-4">
        <h2 className="text-xl font-semibold">{product.name}</h2>

        <div className="flex justify-between text-gray-500 text-sm mt-1">
          <span>{product.brand}</span>
          <span>{product.category}</span>
        </div>

        <p className="text-lg font-bold mt-2">₹{product.price}</p>

        <Link
          to={`/product/${product._id}`}
          className="block mt-4 text-center bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;