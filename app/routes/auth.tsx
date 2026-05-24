import { useAppStore } from "~/lib/store";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => ([
  { title: "Resuman — Sign In" },
  { name: "description", content: "Sign in to access your résumé dashboard." },
]);

const Auth = () => {
  const { isLoading, isAuthenticated, signIn, error } = useAppStore();
  const location = useLocation();
  const next = location.search.split("next=")[1] || "/";
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(next);
  }, [isAuthenticated, next]);

  return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "-120px", right: "-100px", width: 500, height: 500, borderRadius: "100%", background: "radial-gradient(circle, rgba(196,181,160,0.4) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", left: "-80px", width: 400, height: 400, borderRadius: "100%", background: "radial-gradient(circle, rgba(168,152,128,0.25) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Card */}
      <div className="card-elevated anim-scale-in" style={{ width: "100%", maxWidth: 480, padding: "3.5rem", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Wordmark */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-espresso)", margin: 0, fontWeight: 600 }}>Resuman</p>
        </div>

        <div className="divider" />

        <div style={{ padding: "2rem 0" }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "2.5rem" }}>Welcome back.</h2>
          <p style={{ maxWidth: 320, margin: "0 auto", fontSize: "0.95rem" }}>
            Sign in to access your résumé intelligence dashboard and continue refining your career narrative.
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.875rem", padding: "1rem 0" }}>
            <div style={{ width: 20, height: 20, borderRadius: "100%", border: "2px solid var(--color-taupe-light)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
            <span style={{ fontSize: "0.82rem", color: "var(--color-stone)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Connecting…</span>
          </div>
        ) : (
          <button className="btn-primary" onClick={() => signIn()} style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem", background: "var(--color-espresso)", color: "var(--color-cream)" }}>
            Sign in with Google
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        )}

        {error && (
          <div style={{ marginTop: "1.25rem", padding: "0.75rem", background: "var(--color-clay-light)", border: "1px solid rgba(168,92,74,0.2)", borderRadius: "0.75rem", color: "var(--color-clay)", fontSize: "0.82rem" }}>
            {error}
          </div>
        )}

        <p style={{ marginTop: "1.75rem", fontSize: "0.75rem", color: "var(--color-stone-light)", letterSpacing: "0.06em" }}>
          Secured via Google Authentication
        </p>
      </div>
    </div>
  );
};

export default Auth;
