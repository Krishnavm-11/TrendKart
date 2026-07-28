import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert("Account created successfully.");

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <Link to="/" className="text-3xl font-bold">
            TrendKart
          </Link>

          <h1 className="mt-6 text-3xl font-bold">
            Create Account
          </h1>

          <p className="mt-2 text-gray-500">
            Register to start shopping.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-5">
            <label className="mb-2 block font-medium">
              Full name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block font-medium">
              Email address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-medium">
              Confirm password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-black underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;