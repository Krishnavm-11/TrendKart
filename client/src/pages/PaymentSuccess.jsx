
import { Link, useLocation } from "react-router-dom";

function PaymentSuccess() {
  const location = useLocation();

  const message =
    location.state?.message ||
    "Your order has been placed successfully.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4ef] px-4 py-10">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#e8e0d5] bg-white shadow-xl">

        {/* Header */}
        <div className="bg-[#171614] px-6 py-10 text-center text-white">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.35em] text-[#c9b99f]">
            TrendKart
          </p>

          {/* Success Icon */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#c9b99f]/40 bg-[#c9b99f]/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[#d8c6a8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12l4 4L19 6"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Order Successful
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-300">
            Your shopping journey just got better.
          </p>
        </div>

        {/* Success Details */}
        <div className="px-6 py-9 text-center sm:px-10">
          <h2 className="text-xl font-semibold text-[#24211d]">
            Thank you for your order!
          </h2>

          <p className="mt-3 text-sm leading-7 text-gray-500">
            {message}
          </p>

          <div className="my-7 rounded-xl border border-[#e8e0d5] bg-[#faf8f4] p-5 text-left">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[#8b7658]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 3c-2.755 0-5.292.93-7.313 2.484A11.956 11.956 0 003 12c0 2.755.93 5.292 2.484 7.313A11.956 11.956 0 0012 21c2.755 0 5.292-.93 7.313-2.484A11.956 11.956 0 0021 12c0-2.755-.93-5.292-2.484-7.313z"
                  />
                </svg>
              </span>

              <div>
                <h3 className="text-sm font-semibold text-[#24211d]">
                  Order confirmation
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Your order confirmation is ready. You can continue shopping
                  or return to the homepage.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="flex-1 rounded-lg bg-[#171614] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35312b]"
            >
              Back to Home
            </Link>

            <Link
              to="/products"
              className="flex-1 rounded-lg border border-[#d9cdbb] px-5 py-3 text-sm font-semibold text-[#24211d] transition hover:bg-[#f7f4ef]"
            >
              Continue Shopping
            </Link>
          </div>

          <p className="mt-7 text-xs tracking-wide text-gray-400">
            THANK YOU FOR CHOOSING TRENDKART
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;