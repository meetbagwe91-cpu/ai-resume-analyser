import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAppStore } from "~/lib/store";

const Navbar = () => {
  const { isAuthenticated, signOut } = useAppStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1.125rem 2.5rem",
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: scrolled ? "rgba(245, 240, 232, 0.96)" : "rgba(245, 240, 232, 0.88)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(184, 168, 152, 0.2)",
      transition: "background 0.3s ease",
    }}>
      {/* Brand */}
      <Link to="/" style={{
        fontFamily: "var(--font-serif)",
        fontSize: "1.1rem",
        fontWeight: 600,
        letterSpacing: "0.2em",
        color: "var(--color-espresso)",
        textDecoration: "none",
        textTransform: "uppercase",
        zIndex: 101,
      }}>
        Resumate
      </Link>

      {/* Desktop nav */}
      <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {isAuthenticated ? (
          <>
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/upload" className="nav-link">Analyze</Link>
            <Link to="/build" className="nav-link">Build</Link>
            <Link to="/help" className="nav-link">Help</Link>
            <div style={{ width: 1, height: 18, background: "rgba(184,168,152,0.4)" }} />
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{ color: "var(--color-stone)" }}
            >
              Sign Out
            </button>
            <Link to="/upload" className="btn-primary" style={{ padding: "0.6rem 1.375rem", fontSize: "0.72rem" }}>
              Upload Résumé
            </Link>
          </>
        ) : (
          <>
            <Link to="/help" className="nav-link">How it works</Link>
            <Link to="/auth" className="nav-link">Sign In</Link>
            <Link to="/auth" className="btn-primary" style={{ padding: "0.6rem 1.375rem", fontSize: "0.72rem" }}>
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="hide-on-desktop"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          padding: "0.5rem", zIndex: 101, position: "relative",
        }}
        aria-label="Toggle menu"
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--color-espresso)" strokeWidth={2}>
          {mobileMenuOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {/* Mobile overlay menu */}
      {mobileMenuOpen && (
        <div className="flex-hide-on-desktop" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(245, 240, 232, 0.98)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
          flexDirection: "column",
          padding: "5.5rem 2rem 3rem",
          gap: "0",
        }}>
          {isAuthenticated ? (
            <>
              {[
                { to: "/", label: "Dashboard" },
                { to: "/upload", label: "Analyze Résumé" },
                { to: "/build", label: "Build with AI" },
                { to: "/help", label: "Help Center" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "1.125rem 0",
                    fontSize: "1.4rem",
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-espresso)",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(184,168,152,0.15)",
                  }}
                >
                  {label}
                </Link>
              ))}
              <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "var(--color-stone)", padding: 0, fontFamily: "var(--font-sans)",
                  }}
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              {[
                { to: "/help", label: "How It Works" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "1.125rem 0",
                    fontSize: "1.4rem",
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-espresso)",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(184,168,152,0.15)",
                  }}
                >
                  {label}
                </Link>
              ))}
              <div style={{ marginTop: "2rem" }}>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ display: "block", textAlign: "center", padding: "1rem" }}
                >
                  Get Started Free
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
