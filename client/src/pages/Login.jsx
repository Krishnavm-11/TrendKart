
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials");
  const [loading, setLoading] = useState(false);

  // Step 1: Check login details and request OTP.
  const handleSendOtp = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post(
        "/auth/login/send-otp",
        {
          email: normalizedEmail,
          password,
        }
      );

      setEmail(normalizedEmail);
      setStep("otp");

      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and log in.
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
          email,
          otp,
          purpose: "login",
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Welcome back!");

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

  // Request another OTP.
  const resendOtp = async () => {
    try {
      setLoading(true);

      const { data } = await API.post(
        "/auth/login/send-otp",
        {
          email,
          password,
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

            {step === "credentials" ? (
              <>
                <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#9b815e] md:mt-0">
                  Welcome back
                </p>

                <h1 className="mt-3 text-3xl font-semibold">
                  Sign in to your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Enter your details. We'll email you a verification code.
                </p>

                <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
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
                    className="w-full rounded-xl bg-[#211f1b] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {loading ? "Sending OTP..." : "Continue securely"}
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
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setOtp("");
                  }}
                  className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </button>

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4eee5] text-[#8a6b45]">
                  <ShieldCheck size={24} />
                </div>

                <h1 className="text-3xl font-semibold">
                  Check your email
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium text-[#28251f]">
                    {email}
                  </span>.
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
                    {loading ? "Verifying..." : "Verify and sign in"}
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
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;