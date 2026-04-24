import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import GoogleAuthSection from "../components/GoogleAuthSection.jsx";
import { API_BASE_URL, persistAuthSession } from "../utils/auth.js";

const DASHBOARD_ROUTE = "/my-trips";

const Signup = ({ onAuth }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
      persistAuthSession(response.data);
      onAuth();
      navigate(DASHBOARD_ROUTE);
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed. Please try again.");
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
      const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        accessToken: tokenResponse.access_token
      });

      persistAuthSession(response.data);
      onAuth();
      navigate(DASHBOARD_ROUTE);
    } catch (error) {
      setMessage(error.response?.data?.message || "Google signup failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#062f35] text-white">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80"
        alt="Turquoise ocean and bright shoreline"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,24,31,0.28)_0%,rgba(4,24,31,0.46)_32%,rgba(4,24,31,0.72)_66%,rgba(4,24,31,0.86)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(7,190,210,0.14),transparent_30%)]" />

      <div className="relative z-10 px-6 pb-16 pt-28 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
            <div className="rounded-[40px] border border-white/10 bg-white/5 px-8 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-md sm:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                Create Account
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Start building smarter trips with your own TripWise workspace.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                Create an account to save itineraries, reopen planning sessions, and manage your routes, weather, and travel ideas in one place.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  "Save itinerary drafts",
                  "Share trips with a link",
                  "Revisit routes anytime"
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
                Account Setup
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Create Your Account
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Join TripWise and keep your destinations, routes, and planning history in one place.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Name
                  </label>
                  <input
                    className="w-full rounded-[22px] border border-[#d8dfeb] bg-white/90 px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={(event) => updateField("name", event.target.value)}
                  />
                </div>

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
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={formData.password}
                    onChange={(event) => updateField("password", event.target.value)}
                  />
                </div>

                <button
                  className="inline-flex w-full items-center justify-center rounded-[22px] border border-[#8edcff]/35 bg-[#0b3b43]/60 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(7,20,37,0.18)] backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
                  type="submit"
                >
                  Sign Up
                </button>

                <GoogleAuthSection
                  isLoading={isGoogleLoading}
                  message={message}
                  setMessage={setMessage}
                  onSuccess={handleGoogleSuccess}
                />
              </form>

              <div className="mt-8 text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-[#147ea2] hover:text-[#0d6b89]">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
