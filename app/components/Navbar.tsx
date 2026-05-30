import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAppStore } from "~/lib/store";

const Navbar = () => {
  const { isAuthenticated, signOut } = useAppStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand-wordmark" style={{ zIndex: 51 }}>Resumate</Link>
      
      {/* Desktop Navigation */}
      <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
        {isAuthenticated ? (
          <>
            <Link to="/" style={{ fontSize: "0.78rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-stone)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-espresso)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-stone)")}>
              Dashboard
            </Link>
            <Link to="/upload" className="btn-primary" style={{ padding: "0.625rem 1.625rem", fontSize: "0.72rem" }}>
              Upload
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </Link>
            <button 
              onClick={handleLogout}
              style={{ 
                background: "transparent", 
                border: "none", 
                cursor: "pointer", 
                fontSize: "0.78rem", 
                letterSpacing: "0.15em", 
                textTransform: "uppercase", 
                color: "var(--color-clay)", 
                transition: "color 0.2s",
                padding: 0
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-clay-dark)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-clay)")}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" style={{ fontSize: "0.78rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-stone)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-espresso)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-stone)")}>
            Login
          </Link>
        )}
      </div>

      {/* Mobile Hamburger Button */}
      <button 
        className="hide-on-desktop"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem",
          zIndex: 51, position: "relative"
        }}
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--color-espresso)" strokeWidth={2}>
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="flex-hide-on-desktop" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(250,247,242,0.98)", backdropFilter: "blur(10px)",
          zIndex: 50, flexDirection: "column",
          padding: "6rem 2rem 2rem", gap: "2rem"
        }}>
          {isAuthenticated ? (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.2rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-espresso)", textDecoration: "none" }}>
                Dashboard
              </Link>
              <Link to="/upload" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.2rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-espresso)", textDecoration: "none" }}>
                Upload Résumé
              </Link>
              <Link to="/help" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.2rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-espresso)", textDecoration: "none" }}>
                Help Center
              </Link>
              <div style={{ marginTop: "auto", borderTop: "1px solid rgba(196,181,160,0.3)", paddingTop: "2rem" }}>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    background: "transparent", border: "none", cursor: "pointer", 
                    fontSize: "1.2rem", letterSpacing: "0.15em", textTransform: "uppercase", 
                    color: "var(--color-clay)", padding: 0
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ justifyContent: "center", padding: "1rem" }}>
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
