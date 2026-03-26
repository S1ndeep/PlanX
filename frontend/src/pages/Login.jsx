import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const Login = ({ onAuth }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userName", user.name);
      onAuth();
      navigate("/");
    } catch (error) {
      setMessage("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="planx-page">
      <div className="planx-page-content">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
            <div className="planx-dark-panel rounded-[40px] px-8 py-12 sm:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                Welcome Back
              </p>
              <h1 className="mt-5 max-w-2xl font-[var(--font-editorial)] text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
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

            <div className="planx-panel rounded-[36px] p-8 sm:p-10">
              <p className="planx-kicker">
                Account Access
              </p>
              <h2 className="planx-heading mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Login
              </h2>
              <p className="planx-subtle mt-3 text-base leading-7">
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
                    value={formData.password}
                    onChange={(event) => updateField("password", event.target.value)}
                  />
                </div>

                <button className="planx-button w-full px-6 py-4 text-base" type="submit">
                  Login
                </button>

                {message && (
                  <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {message}
                  </div>
                )}
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
