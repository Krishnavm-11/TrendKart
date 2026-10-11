
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  CircleAlert,
} from "lucide-react";

import API from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (loading) return;

    try {
      setLoading(true);

      const { data } = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // Check whether the backend returned a token and user.
      if (!data?.token || !data?.user) {
        setError(
          "Login failed because the server did not return the required user details or token."
        );
        return;
      }

      // Only administrator accounts can use this page.
      if (data.user.role !== "admin") {
        setError(
          "Access denied. Only administrator accounts can log in here."
        );
        return;
      }

      // Save the admin session.
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem(
        "adminUser",
        JSON.stringify(data.user)
      );

      // Remove any previous customer session.
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Navigate to the admin dashboard.
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error(
        "Admin login error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        setError(
          error.response?.data?.message ||
            "Invalid email or password. Please try again."
        );
      } else if (error.response?.status === 403) {
        setError(
          error.response?.data?.message ||
            "You do not have permission to access the admin portal."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to log in. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#ded6ca] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#b1a79b] focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/10";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4 py-10 text-[#211f1b]">
      <div className="w-full max-w-md">
        {/* Brand */}
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#211f1b] text-[#f7f5f0]">
            <ShieldCheck size={24} />
          </div>

          <span className="text-2xl font-semibold tracking-tight">
            TrendKart
          </span>
        </Link>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#e6dfd2] bg-white p-6 shadow-[0_15px_50px_rgba(33,31,27,0.07)] sm:p-9">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#8b7355]">
              Secure Administration
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Admin Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#82786c]">
              Sign in with your administrator account to manage
              your store.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <CircleAlert
                size={19}
                className="mt-0.5 shrink-0"
              />

              <p>{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8f81]"
                />

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  className={inputClass}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8f81]"
                />

                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-12`}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#8a8074] transition hover:bg-[#f4efe7] hover:text-[#211f1b]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#211f1b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#40382f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Login as Admin
                </>
              )}
            </button>
          </form>

          <div className="my-6 border-t border-[#eee8df]" />

          {/* Back to Customer Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-[#82786c] transition hover:text-[#211f1b]"
          >
            <ArrowLeft size={16} />
            Back to user login
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-[#9a9084]">
          TrendKart Admin Portal · Authorized access only
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
