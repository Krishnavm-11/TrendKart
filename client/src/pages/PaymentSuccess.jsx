import { Link, useLocation } from "react-router-dom";

function PaymentSuccess() {
  const location = useLocation();

  const message =
    location.state?.message || "Your order has been placed successfully.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white shadow-lg p-10 rounded-xl">
        <h1 className="text-4xl font-bold text-green-600">
          Order Successful
        </h1>

        <p className="mt-4">{message}</p>

        <Link
          to="/"
          className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;