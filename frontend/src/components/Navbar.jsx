import { useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ isAuthed, userName, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const resolvedUserName = userName?.trim() || "Traveler";
  const isHomePage = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const handleAuthClick = () => {
    if (isAuthed) {
      onLogout();
      navigate("/");
      return;
    }
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/explore", label: "Explore Cities" },
    { to: "/plan-trip", label: "Plan Trip" },
    { to: "/my-trips", label: "My Trips" },
    { to: "/bookings", label: "Bookings" },
    { to: "/support", label: "Support" }
  ];

  const homeNavbarStyle = isHomePage
    ? {
        backgroundColor: isScrolled || isMenuOpen ? "rgba(4, 19, 24, 0.72)" : "transparent",
        backdropFilter: isScrolled || isMenuOpen ? "blur(18px)" : "none",
        WebkitBackdropFilter: isScrolled || isMenuOpen ? "blur(18px)" : "none",
        boxShadow: isScrolled || isMenuOpen ? "0 18px 60px rgba(2, 20, 24, 0.24)" : "none"
      }
    : {
        backgroundColor: "rgba(4, 19, 24, 0.88)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "0 18px 60px rgba(2, 20, 24, 0.2)"
      };

  const nonHomeLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-[0.18em] transition ${
      isActive
        ? "bg-[#123f48] text-[#8edcff] shadow-[0_10px_24px_rgba(2,18,24,0.18)]"
        : "text-white/82 hover:bg-white/10 hover:text-[#8edcff]"
    }`;

  return (
    <nav
      className={`navbar ${
        isHomePage
          ? "fixed inset-x-0 top-0 z-50 transition-all duration-300"
          : "relative z-40 bg-transparent py-5 transition-all duration-300"
      }`}
      style={homeNavbarStyle}
    >
      <div className="container">
        <div
          className={`navbar-inner px-4 py-3 md:px-6 ${
            isHomePage
              ? "rounded-full border border-white/10 bg-[rgba(7,29,34,0.42)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur"
              : "rounded-[28px] border border-white/10 bg-[rgba(7,29,34,0.72)] shadow-[0_22px_60px_rgba(2,18,24,0.18)] backdrop-blur-xl"
          }`}
        >
          <Link
            to="/"
            className={`logo text-xl sm:text-2xl ${
              isHomePage ? "text-white" : "text-white"
            }`}
          >
            TripWise
          </Link>

          <div className={`hidden items-center gap-2 lg:flex ${isHomePage ? "nav-links text-white/90" : ""}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={
                  isHomePage
                    ? ({ isActive }) =>
                        `transition ${isActive ? "text-[#8edcff]" : "text-white/82 hover:text-[#8edcff]"}`
                    : nonHomeLinkClass
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:gap-4 lg:flex">
            {isAuthed && (
              <span className={`text-sm font-medium ${isHomePage ? "text-white/72" : "text-white/72"}`}>
                Welcome, {resolvedUserName}
              </span>
            )}
            <button
              className={
                isHomePage
                  ? "nav-cta border-[#8edcff]/30 bg-[#0b3b43]/60 text-white backdrop-blur hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
                  : "rounded-full border border-[#8edcff]/30 bg-[#0b3b43]/60 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_16px_34px_rgba(2,18,24,0.18)] transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
              }
              onClick={handleAuthClick}
              type="button"
            >
              {isAuthed ? "Logout" : "Login"}
            </button>
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition lg:hidden ${
              isHomePage
                ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border border-white/10 bg-white/5 text-white shadow-[0_12px_28px_rgba(2,18,24,0.12)] hover:bg-white/10"
            }`}
          >
            <span className="text-lg">{isMenuOpen ? "X" : "+"}</span>
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            isMenuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`mt-3 rounded-[28px] p-4 backdrop-blur-xl ${
              isHomePage
                ? "border border-white/10 bg-[rgba(7,29,34,0.9)] shadow-[0_24px_80px_rgba(2,18,24,0.2)]"
                : "border border-white/10 bg-[rgba(7,29,34,0.9)] shadow-[0_24px_80px_rgba(2,18,24,0.2)]"
            }`}
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={
                    isHomePage
                      ? ({ isActive }) =>
                          `rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition ${
                            isActive
                              ? "bg-[#123f48] text-[#8edcff]"
                              : "text-white/85 hover:bg-white/5 hover:text-[#8edcff]"
                          }`
                      : ({ isActive }) =>
                          `rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition ${
                            isActive
                              ? "bg-[#123f48] text-[#8edcff]"
                              : "text-white/85 hover:bg-white/5 hover:text-[#8edcff]"
                          }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div
              className={`mt-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
                isHomePage
                  ? "border border-white/10 bg-white/5"
                  : "border border-white/10 bg-white/5"
              }`}
            >
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isHomePage ? "text-white/45" : "text-white/45"}`}>Account</p>
                <p className={`mt-1 text-sm font-medium ${isHomePage ? "text-white/80" : "text-white/80"}`}>
                  {isAuthed ? resolvedUserName : "Guest"}
                </p>
              </div>
              <button
                className={
                  isHomePage
                    ? "nav-cta border-[#8edcff]/30 bg-[#0b3b43]/60 text-white hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
                    : "rounded-full border border-[#8edcff]/30 bg-[#0b3b43]/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
                }
                onClick={handleAuthClick}
                type="button"
              >
                {isAuthed ? "Logout" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
