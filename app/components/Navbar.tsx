import { Link, useNavigate } from "react-router";
import { useAppStore } from "~/lib/store";

const Navbar = () => {
  const { isAuthenticated, signOut } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand-wordmark">Resuman</Link>
      <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
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
    </nav>
  );
};

export default Navbar;
