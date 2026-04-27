import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AuthShell, { AuthFooterLink, AuthMessage } from "../components/AuthShell.jsx";
import { API_BASE_URL } from "../utils/auth.js";

const getPasswordStrength = (password = "") => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { label: "Weak", color: "bg-rose-400", text: "Add length, numbers, and symbols." };
  }

  if (score <= 3) {
    return { label: "Medium", color: "bg-amber-400", text: "Good start. Add more variety for a stronger password." };
  }

  return { label: "Strong", color: "bg-emerald-400", text: "Strong password." };
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token = "" } = useParams();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("This reset link is invalid or has expired");
    }
  }, [token]);

  const strength = getPasswordStrength(formData.newPassword);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("This reset link is invalid or has expired");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword: formData.newPassword
      });

      setMessage(response.data.message || "Password reset successful");
      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reset password right now");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      backgroundImage="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80"
      imageAlt="Ocean cove with layered blue water"
      eyebrow="New Password"
      title="Create a fresh password with the same secure, calm TripWise experience."
      description="Choose a strong password, confirm it, and we’ll bring you straight back to login after the reset succeeds."
      asideTitle="Secure Reset"
      asideDescription={{
        title: "Reset Password",
        copy: "Enter a strong new password below. For your security, this reset link only works for a limited time."
      }}
      featureItems={[
        "Password strength feedback",
        "Expired-link protection",
        "Automatic login-page redirect"
      ]}
      footer={<AuthFooterLink to="/login" label="Need your account page?" action="Back to login" />}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthMessage tone="success">{message}</AuthMessage>
        <AuthMessage>{error}</AuthMessage>

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            New Password
          </label>
          <input
            className="w-full rounded-[22px] border border-[#d8dfeb] bg-white/90 px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            minLength={8}
            required
            value={formData.newPassword}
            onChange={(event) => handleChange("newPassword", event.target.value)}
          />
        </div>

        <div className="rounded-[22px] border border-white/50 bg-white/70 px-4 py-4 text-slate-700">
          <div className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span>Password strength</span>
            <span>{formData.newPassword ? strength.label : "Waiting for input"}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${strength.color}`}
              style={{
                width: formData.newPassword
                  ? strength.label === "Weak"
                    ? "33%"
                    : strength.label === "Medium"
                      ? "66%"
                      : "100%"
                  : "0%"
              }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {formData.newPassword ? strength.text : "Use at least 8 characters with a mix of letters, numbers, and symbols."}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Confirm Password
          </label>
          <input
            className="w-full rounded-[22px] border border-[#d8dfeb] bg-white/90 px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
            type="password"
            placeholder="Confirm your new password"
            autoComplete="new-password"
            minLength={8}
            required
            value={formData.confirmPassword}
            onChange={(event) => handleChange("confirmPassword", event.target.value)}
          />
        </div>

        <button
          className="inline-flex w-full items-center justify-center rounded-[22px] border border-[#8edcff]/35 bg-[#0b3b43]/60 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(7,20,37,0.18)] backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting || !token}
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
