import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("Admin login response:", data);

      if (!data.user) {
        setError("User information not returned from server.");
        return;
      }

      if (data.user.role !== "admin") {
        setError("Only admin users can login here.");
        return;
      }

      localStorage.setItem(
        "adminToken",
        data.token
      );

      localStorage.setItem(
        "adminUser",
        JSON.stringify(data.user)
      );

      navigate("/admin/dashboard");
    } catch (error) {
      console.error(
        "Admin login error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Admin login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Admin Login
          </h1>

          <p className="text-gray-500 mt-2">
            Login with your administrator account
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Admin email"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Admin password"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login as Admin"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-black hover:underline"
          >
            Back to User Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;