import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from "./GoogleIcon.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const GoogleAuthSection = ({
  isLoading = false,
  message,
  setMessage,
  onSuccess
}) => {
  const launchGoogleAuth = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: (tokenResponse) => onSuccess(tokenResponse),
    onError: () => setMessage("Google sign-in could not be completed. Please try again."),
    onNonOAuthError: () => setMessage("Google sign-in popup was closed or blocked. Please try again.")
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/90 to-slate-300/70" />
        <span className="shrink-0">Or Continue With</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300/90 to-slate-300/70" />
      </div>

      {GOOGLE_CLIENT_ID ? (
        <button
          className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-[22px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(244,247,251,0.88)_100%)] px-6 py-4 text-[15px] font-semibold text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(148,163,184,0.08)] backdrop-blur-xl transition duration-300 ease-out hover:scale-[1.02] hover:border-white/80 hover:shadow-[0_24px_54px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.35),inset_0_1px_0_rgba(255,255,255,0.98)] active:scale-[0.99] active:shadow-[0_12px_30px_rgba(15,23,42,0.08),inset_0_2px_6px_rgba(15,23,42,0.08)] disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          disabled={isLoading}
          onClick={() => {
            setMessage("");
            launchGoogleAuth();
          }}
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(66,133,244,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(52,168,83,0.06),transparent_28%),linear-gradient(120deg,rgba(251,188,5,0.05),transparent_34%,rgba(234,67,53,0.05))] opacity-80 transition duration-300 group-hover:opacity-100" />
          <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/90" />
          <span className="relative flex items-center justify-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(15,23,42,0.06)]">
              <GoogleIcon />
            </span>
            <span className="tracking-[0.01em] text-slate-700">Continue with Google</span>
          </span>
        </button>
      ) : (
        <button
          className="inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-[#d8dfeb] bg-white/80 px-6 py-4 text-base font-semibold text-slate-400 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          type="button"
          disabled
        >
          <GoogleIcon />
          Continue with Google
        </button>
      )}

      {!GOOGLE_CLIENT_ID && (
        <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          Google sign-in is unavailable until `VITE_GOOGLE_CLIENT_ID` is set in the frontend environment.
        </div>
      )}

      {isLoading && (
        <div className="rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
          Verifying your Google account...
        </div>
      )}

      {message && (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {message}
        </div>
      )}
    </div>
  );
};

export default GoogleAuthSection;
