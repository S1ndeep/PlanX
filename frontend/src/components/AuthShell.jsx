import { Link } from "react-router-dom";

const AuthShell = ({
  backgroundImage,
  imageAlt,
  eyebrow,
  title,
  description,
  asideTitle,
  asideDescription,
  featureItems,
  children,
  footer
}) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#062f35] text-white">
      <img
        src={backgroundImage}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,24,31,0.28)_0%,rgba(4,24,31,0.46)_32%,rgba(4,24,31,0.72)_66%,rgba(4,24,31,0.86)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(7,190,210,0.14),transparent_30%)]" />

      <div className="relative z-10 px-6 pb-16 pt-28 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
            <div className="rounded-[40px] border border-white/10 bg-white/5 px-8 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-md sm:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                {eyebrow}
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                {description}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {featureItems.map((item) => (
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
                {asideTitle}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                {asideDescription.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {asideDescription.copy}
              </p>

              <div className="mt-8">{children}</div>

              {footer ? <div className="mt-8 text-sm text-slate-600">{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AuthMessage = ({ tone = "error", children }) => {
  if (!children) return null;

  const styles =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className={`rounded-[20px] border px-4 py-3 text-sm font-medium ${styles}`}>
      {children}
    </div>
  );
};

export const AuthFooterLink = ({ to, label, action }) => (
  <>
    {label}{" "}
    <Link to={to} className="font-semibold text-[#147ea2] hover:text-[#0d6b89]">
      {action}
    </Link>
  </>
);

export default AuthShell;
