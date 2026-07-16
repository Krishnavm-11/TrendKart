import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center">
          User Login
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Login to continue shopping
        </p>

        {error && (
          <p className="mb-4 text-center text-red-500">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <label className="block mb-2 font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-black"
            required
          />

          <label className="block mb-2 font-medium">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-5 outline-none focus:border-black"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-6 border-t pt-5 text-center">

          <Link
            to="/admin/login"
            className="inline-block border border-black px-6 py-2 rounded-lg font-semibold hover:bg-black hover:text-white transition"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;