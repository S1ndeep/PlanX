import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import GoogleAuthSection from "../components/GoogleAuthSection.jsx";
import { API, persistAuthSession } from "../utils/auth.js";

const DASHBOARD_ROUTE = "/my-trips";

const Login = ({ onAuth }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      console.log("API URL:", import.meta.env.VITE_API_URL);
      const response = await axios.post(`${API}/api/auth/login`, formData);
      persistAuthSession(response.data);
      onAuth();
      navigate(DASHBOARD_ROUTE);
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    if (!tokenResponse.access_token) {
      setMessage("Google sign-in did not return an access token. Please try again.");
      return;
    }

    setMessage("");
    setIsGoogleLoading(true);

    try {
      console.log("API URL:", import.meta.env.VITE_API_URL);
      const response = await axios.post(`${API}/api/auth/google`, {
        accessToken: tokenResponse.access_token
      });
      persistAuthSession(response.data);
      onAuth();
      navigate(DASHBOARD_ROUTE);
    } catch (error) {
      setMessage(error.response?.data?.message || "Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#062f35] text-white">
      <img
        src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1800&q=80"
        alt="Aerial tropical shoreline with forest and turquoise water"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,24,31,0.28)_0%,rgba(4,24,31,0.46)_32%,rgba(4,24,31,0.72)_66%,rgba(4,24,31,0.86)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(7,190,210,0.14),transparent_30%)]" />

      <div className="relative z-10 px-6 pb-16 pt-28 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
            <div className="rounded-[40px] border border-white/10 bg-white/5 px-8 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-md sm:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                Welcome Back
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Pick up your next trip exactly where you left it.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                Sign in to reopen saved itineraries, continue planning, and manage your TripWise travel dashboard.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  "Access saved trips",
                  "Resume itinerary editing",
                  "Manage bookings and routes"
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-white/10 bg-[#10353d]/65 px-4 py-5 text-sm font-medium text-white shadow-[0_24px_80px_rgba(3,18,24,0.18)] backdrop-blur-md"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[36px] border border-white/30 bg-[rgba(255,255,255,0.72)] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.2)] backdrop-blur-[28px] sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                Account Access
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Login
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Enter your details to continue building and revisiting your travel plans.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Email
                  </label>
                  <input
                    className="w-full rounded-[22px] border border-[#d8dfeb] bg-white/90 px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Password
                  </label>
                  <input
                    className="w-full rounded-[22px] border border-[#d8dfeb] bg-white/90 px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(event) => updateField("password", event.target.value)}
                  />
                  <div className="mt-3 flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-[#147ea2] transition hover:text-[#0d6b89]"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <button
                  className="inline-flex w-full items-center justify-center rounded-[22px] border border-[#8edcff]/35 bg-[#0b3b43]/60 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(7,20,37,0.18)] backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

                <GoogleAuthSection
                  isLoading={isGoogleLoading}
                  message={message}
                  setMessage={setMessage}
                  onSuccess={handleGoogleSuccess}
                />
              </form>

              <div className="mt-8 text-sm text-slate-600">
                New here?{" "}
                <Link to="/signup" className="font-semibold text-[#147ea2] hover:text-[#0d6b89]">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
