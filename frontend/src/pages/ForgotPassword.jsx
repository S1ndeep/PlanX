import { useState } from "react";
import axios from "axios";
import AuthShell, { AuthFooterLink, AuthMessage } from "../components/AuthShell.jsx";
import { API_BASE_URL } from "../utils/auth.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email
      });
      setMessage(response.data.message || "Password reset link sent to your email");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send reset link right now");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      backgroundImage="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80"
      imageAlt="Ocean waves with blue-green water and soft horizon"
      eyebrow="Password Recovery"
      title="Reset your password and get back to building your next trip."
      description="Send yourself a secure reset link and step back into your saved plans with the same calm, polished TripWise flow."
      asideTitle="Reset Access"
      asideDescription={{
        title: "Forgot Password",
        copy: "Enter the email tied to your TripWise account and we’ll send a secure reset link if it can be used for password sign-in."
      }}
      featureItems={[
        "Secure one-time reset link",
        "Short-lived token protection",
        "Back to login in one flow"
      ]}
      footer={<AuthFooterLink to="/login" label="Remembered it?" action="Back to login" />}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthMessage tone="success">{message}</AuthMessage>
        <AuthMessage>{error}</AuthMessage>

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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <button
          className="inline-flex w-full items-center justify-center rounded-[22px] border border-[#8edcff]/35 bg-[#0b3b43]/60 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(7,20,37,0.18)] backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;
