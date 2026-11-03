
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/auth/login", {
        email: normalizedEmail,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Welcome back!");

      navigate("/");
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data?.message || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-10 text-[#211f1b]">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-[#e6dfd4] bg-white shadow-xl md:min-h-[620px] md:grid-cols-2">

        {/* Left side */}
        <div className="hidden bg-[#171613] p-10 text-[#f8f4ed] md:flex md:flex-col md:justify-between">
          <Link to="/" className="text-3xl font-semibold">
            TrendKart<span className="text-[#c9ad83]">.</span>
          </Link>

          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#c9ad83]">
              Considered essentials
            </p>

            <h2 className="max-w-sm text-4xl font-light leading-tight">
              Good taste begins with the details.
            </h2>

            <p className="mt-5 max-w-sm leading-7 text-white/60">
              Sign in securely and continue shopping.
            </p>
          </div>

          <p className="text-xs text-white/40">
            A more considered way to shop.
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-md">

            <Link to="/" className="text-2xl font-semibold md:hidden">
              TrendKart<span className="text-[#b99a6b]">.</span>
            </Link>

            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#9b815e] md:mt-0">
              Welcome back
            </p>

            <h1 className="mt-3 text-3xl font-semibold">
              Sign in to your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Enter your email and password to continue shopping.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email address
                </label>

                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#ded8ce] px-4 py-3.5 outline-none focus:border-[#9b815e]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#ded8ce] px-4 py-3.5 outline-none focus:border-[#9b815e]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#211f1b] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#39352e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

            </form>

            <p className="mt-7 text-center text-sm text-gray-600">
              New to TrendKart?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#806344] hover:underline"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-8 border-t border-[#eee9e1] pt-5 text-center">
              <Link
                to="/admin/login"
                className="text-xs text-gray-500 hover:text-black"
              >
                Admin Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
