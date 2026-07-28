import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      if (data.user?.role === "admin") {
        setError("Please use the Admin Login link below.");
        return;
      }

      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* Left side */}
        <div className="hidden bg-black p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <Link to="/" className="text-3xl font-bold">
              TrendKart
            </Link>

            <h2 className="mt-16 text-4xl font-bold leading-tight">
              Welcome back to TrendKart.
            </h2>

            <p className="mt-4 max-w-sm text-gray-300">
              Sign in to continue shopping, manage your cart,
              and view your orders.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Simple shopping. Secure checkout.
          </p>
        </div>

        {/* Right side */}
        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <Link
              to="/"
              className="text-2xl font-bold md:hidden"
            >
              TrendKart
            </Link>

            <h1 className="mt-5 text-3xl font-bold md:mt-0">
              User Login
            </h1>

            <p className="mt-2 text-gray-500">
              Enter your account details to continue.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="mb-2 block font-medium">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                required
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 outline-none transition focus:border-black"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-black"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-black underline underline-offset-4"
              >
                Register
              </Link>
            </p>
          </div>

          <div className="mt-8 border-t pt-6 text-center">
            <Link
              to="/admin/login"
              className="text-sm font-semibold text-gray-500 hover:text-black hover:underline"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;