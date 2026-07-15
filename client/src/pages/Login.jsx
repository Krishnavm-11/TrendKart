import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        await API.post("/auth/register", {
          name,
          email,
          password,
        });

        alert("Registration successful. Please login.");
        setIsRegister(false);
        setName("");
        setPassword("");
        return;
      }

      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          {isRegister ? "Create Account" : "Login"}
        </h1>

        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border p-3 rounded-lg mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          className="w-full border p-3 rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-black text-white py-3 rounded-lg font-semibold">
          {isRegister ? "Register" : "Login"}
        </button>

        <p className="text-center mt-5 text-gray-600">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-black font-semibold"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>

        <Link
          to="/"
          className="block text-center mt-4 text-sm text-gray-500 hover:text-black"
        >
          Back to Home
        </Link>
      </form>
    </div>
  );
}

export default Login;