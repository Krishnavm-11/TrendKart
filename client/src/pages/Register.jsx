
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);

  // Update the input values.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Step 1: Validate the details and send OTP.
  const handleSendOtp = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (name.length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      toast.error(
        "Use at least 8 characters, including one letter and one number."
      );
      return;
    }

    if (password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post(
        "/auth/register/send-otp",
        {
          name,
          email,
          password,
        }
      );

      setFormData((previous) => ({
        ...previous,
        name,
        email,
      }));

      setStep("otp");

      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration could not continue. Please try again."
      );

      if (error.response?.status === 409) {
        toast("Please use the login page instead.", {
          icon: "↩",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create the account.
  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post(
        "/auth/verify-otp",
        {
          email: formData.email,
          otp,
          purpose: "register",
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Email verified! Welcome to TrendKart.");

      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP if needed.
  const resendOtp = async () => {
    try {
      setLoading(true);

      const { data } = await API.post(
        "/auth/register/send-otp",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      setOtp("");
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-10 text-[#211f1b]">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-[#e6dfd4] bg-white shadow-xl md:min-h-[650px] md:grid-cols-2">

        {/* Left side */}
        <div className="hidden bg-[#171613] p-10 text-[#f8f4ed] md:flex md:flex-col md:justify-between">
          <Link to="/" className="text-3xl font-semibold">
            TrendKart<span className="text-[#c9ad83]">.</span>
          </Link>

          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#c9ad83]">
              A considered collection
            </p>

            <h2 className="max-w-sm text-4xl font-light leading-tight">
              Make room for things you'll love.
            </h2>

            <p className="mt-5 max-w-sm leading-7 text-white/60">
              Create an account for a more personal shopping experience.
            </p>
          </div>

          <p className="text-xs text-white/40">
            Your next favourite thing is closer.
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-md">

            <Link to="/" className="text-2xl font-semibold md:hidden">
              TrendKart<span className="text-[#b99a6b]">.</span>
            </Link>

            {step === "details" ? (
              <>
                <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#9b815e] md:mt-0">
                  Join TrendKart
                </p>

                <h1 className="mt-3 text-3xl font-semibold">
                  Create your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Enter your details. We'll verify your email before creating your account.
                </p>

                <form onSubmit={handleSendOtp} className="mt-7 space-y-4">

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full name
                    </label>

                    <input
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-[#ded8ce] px-4 py-3 outline-none focus:border-[#9b815e]"
                      required
                      minLength={2}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email address
                    </label>

                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#ded8ce] px-4 py-3 outline-none focus:border-[#9b815e]"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-[#ded8ce] px-4 py-3 outline-none focus:border-[#9b815e]"
                      required
                      minLength={8}
                    />

                    <p className="mt-1.5 text-xs text-gray-400">
                      Include at least one letter and one number.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Confirm password
                    </label>

                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className="w-full rounded-xl border border-[#ded8ce] px-4 py-3 outline-none focus:border-[#9b815e]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#211f1b] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {loading ? "Sending OTP..." : "Create account"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#806344] hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setOtp("");
                  }}
                  className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
                >
                  <ArrowLeft size={16} />
                  Back to registration
                </button>

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4eee5] text-[#8a6b45]">
                  <ShieldCheck size={24} />
                </div>

                <h1 className="text-3xl font-semibold">
                  Verify your email
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium text-[#28251f]">
                    {formData.email}
                  </span>.
                  Your account will only be created after verification.
                </p>

                <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Verification code
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      placeholder="000000"
                      className="w-full rounded-xl border border-[#ded8ce] px-4 py-4 text-center text-2xl tracking-[0.45em] outline-none focus:border-[#9b815e]"
                      required
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      The code expires after 10 minutes.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#211f1b] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify and create account"}
                  </button>
                </form>

                <p className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Mail size={14} />
                  Didn't receive it?
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={loading}
                    className="font-semibold text-[#806344] hover:underline"
                  >
                    Resend code
                  </button>
                </p>

                <p className="mt-5 text-center text-sm text-gray-500">
                  Already registered?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#806344] hover:underline"
                  >
                    Go to login
                  </Link>
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;