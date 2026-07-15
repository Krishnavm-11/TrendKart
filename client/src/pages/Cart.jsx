import { useDispatch, useSelector } from "react-redux";
import {
  increaseQty,
  decreaseQty,
  removeFromCart,
} from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);

  
  const totalProducts = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">🛒 Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 text-xl mt-10">
          Your cart is empty.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-center gap-4 bg-white border rounded-xl p-4 shadow-md"
              >
                
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-28 h-28 object-contain"
                />

               
                <div className="flex-1 w-full">
                  <h2 className="text-xl font-semibold">
                    {item.name}
                  </h2>

                  <p className="text-gray-500">
                    Brand: {item.brand}
                  </p>

                  <p className="text-lg font-bold text-green-600 mt-2">
                    ₹{item.price}
                  </p>

                  
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => dispatch(decreaseQty(item._id))}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>

                    <span className="font-semibold text-lg">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => dispatch(increaseQty(item._id))}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                
                <button
                  onClick={() => dispatch(removeFromCart(item._id))}
                  className="text-red-600 font-medium hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          
          <div className="bg-white border rounded-xl shadow-md p-6 h-fit">
            <h2 className="text-2xl font-bold mb-6">
              Order Summary
            </h2>

            <div className="flex justify-between mb-3">
              <span>Total Items</span>
              <span>{totalProducts}</span>
            </div>

            <div className="flex justify-between mb-3">
              <span>Total Amount</span>
              <span className="font-bold text-green-600">
                ₹{totalAmount}
              </span>
            </div>

            <hr className="my-4" />

            <button
              onClick={() => navigate("/buy")}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;