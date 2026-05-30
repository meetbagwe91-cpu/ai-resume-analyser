import { useAppStore } from "~/lib/store";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => ([
  { title: "Resumate — Sign In" },
  { name: "description", content: "Sign in to access your résumé dashboard." },
]);

type AuthMode = "signin" | "signup" | "reset";

const Auth = () => {
  const { isLoading, isAuthenticated, loginWithEmail, signUpWithEmail, sendPasswordReset, signIn, error, clearError } = useAppStore();
  const location = useLocation();
  const next = location.search.split("next=")[1] || "/";
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(next);
  }, [isAuthenticated, next]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Clear errors when switching modes
  useEffect(() => {
    setValidationError("");
    clearError();
    setResetSent(false);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email) {
      setValidationError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (mode === "reset") {
      const success = await sendPasswordReset(email);
      if (success) setResetSent(true);
      return;
    }

    if (!password) {
      setValidationError("Please enter a password.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setValidationError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setValidationError("Passwords do not match.");
        return;
      }
      await signUpWithEmail(email, password, displayName || undefined);
    } else {
      await loginWithEmail(email, password);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
  };

  const titles: Record<AuthMode, { heading: string; sub: string }> = {
    signin: { heading: "Welcome back.", sub: "Enter your credentials to access your résumé intelligence dashboard." },
    signup: { heading: "Create account.", sub: "Join Resumate and start optimizing your résumé with AI." },
    reset: { heading: "Reset password.", sub: "Enter your email and we'll send you a link to reset your password." },
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Image & Overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/img3.jpeg')",
        backgroundSize: "cover", backgroundPosition: "center",
        zIndex: -2,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(23, 21, 19, 0.55)",
        backdropFilter: "blur(2px)",
        zIndex: -1,
      }} />

      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "-120px", right: "-100px", width: 500, height: 500, borderRadius: "100%", background: "radial-gradient(circle, rgba(196,181,160,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", left: "-80px", width: 400, height: 400, borderRadius: "100%", background: "radial-gradient(circle, rgba(168,152,128,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Card */}
      <div className="card-elevated anim-scale-in" style={{
        width: "100%", maxWidth: 440, padding: "3rem",
        textAlign: "center", position: "relative", zIndex: 1,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
      }}>

        {/* Wordmark */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-espresso)", margin: 0, fontWeight: 600 }}>Resumate</p>
        </div>

        <div className="divider" />

        <div style={{ padding: "1.25rem 0 1.75rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.8rem" }}>{titles[mode].heading}</h2>
          <p style={{ maxWidth: 340, margin: "0 auto", fontSize: "0.9rem", color: "var(--color-brown-mid)" }}>
            {titles[mode].sub}
          </p>
        </div>

        {/* Password reset success */}
        {resetSent && (
          <div style={{
            marginBottom: "1.5rem", padding: "0.875rem 1rem",
            background: "var(--color-sage-light)", border: "1px solid rgba(123,155,126,0.3)",
            borderRadius: "0.75rem", color: "var(--color-sage)", fontSize: "0.85rem", fontWeight: 500,
          }}>
            ✓ Password reset email sent! Check your inbox.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem", textAlign: "left" }}>

          {/* Display Name (sign-up only) */}
          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-stone)", marginBottom: "0.4rem", fontWeight: 500 }}>
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane Smith"
                style={{
                  width: "100%", padding: "0.8rem 1rem", borderRadius: "0.625rem",
                  border: "1px solid rgba(196,181,160,0.5)",
                  background: "rgba(247, 244, 239, 0.5)",
                  fontSize: "0.92rem", color: "var(--color-espresso)", outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-olive)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(196,181,160,0.5)"}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-stone)", marginBottom: "0.4rem", fontWeight: 500 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%", padding: "0.8rem 1rem", borderRadius: "0.625rem",
                border: "1px solid rgba(196,181,160,0.5)",
                background: "rgba(247, 244, 239, 0.5)",
                fontSize: "0.92rem", color: "var(--color-espresso)", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--color-olive)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(196,181,160,0.5)"}
            />
          </div>

          {/* Password */}
          {mode !== "reset" && (
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-stone)", marginBottom: "0.4rem", fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "0.8rem 1rem", borderRadius: "0.625rem",
                  border: "1px solid rgba(196,181,160,0.5)",
                  background: "rgba(247, 244, 239, 0.5)",
                  fontSize: "0.92rem", color: "var(--color-espresso)", outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-olive)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(196,181,160,0.5)"}
              />
            </div>
          )}

          {/* Confirm Password (sign-up only) */}
          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-stone)", marginBottom: "0.4rem", fontWeight: 500 }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "0.8rem 1rem", borderRadius: "0.625rem",
                  border: "1px solid rgba(196,181,160,0.5)",
                  background: "rgba(247, 244, 239, 0.5)",
                  fontSize: "0.92rem", color: "var(--color-espresso)", outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-olive)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(196,181,160,0.5)"}
              />
            </div>
          )}

          {/* Forgot password link (sign-in mode) */}
          {mode === "signin" && (
            <button
              type="button"
              onClick={() => switchMode("reset")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.78rem", color: "var(--color-olive-light)",
                textAlign: "right", padding: 0, marginTop: "-0.5rem",
                fontFamily: "var(--font-sans)", textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              Forgot password?
            </button>
          )}

          {/* Error */}
          {(validationError || error) && (
            <div style={{ padding: "0.75rem", background: "var(--color-clay-light)", border: "1px solid rgba(168,92,74,0.2)", borderRadius: "0.625rem", color: "var(--color-clay)", fontSize: "0.82rem", textAlign: "center" }}>
              {validationError || error}
            </div>
          )}

          {/* Submit */}
          <div style={{ marginTop: "0.25rem" }}>
            {isLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.875rem", padding: "0.875rem 0" }}>
                <div style={{ width: 20, height: 20, borderRadius: "100%", border: "2px solid var(--color-taupe-light)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
                <span style={{ fontSize: "0.82rem", color: "var(--color-stone)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {mode === "signup" ? "Creating account…" : mode === "reset" ? "Sending…" : "Authenticating…"}
                </span>
              </div>
            ) : (
              <button type="submit" className="btn-primary" style={{
                width: "100%", justifyContent: "center", fontSize: "0.85rem",
                padding: "0.875rem", background: "var(--color-espresso)", color: "var(--color-cream)"
              }}>
                {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
              </button>
            )}
          </div>

          {/* Mode switcher */}
          {mode !== "reset" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "0.25rem 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(196,181,160,0.5)" }} />
                <span style={{ fontSize: "0.72rem", color: "var(--color-stone)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Or</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(196,181,160,0.5)" }} />
              </div>

              <button
                type="button"
                onClick={() => signIn()}
                className="btn-secondary"
                style={{
                  width: "100%", justifyContent: "center", fontSize: "0.85rem",
                  padding: "0.875rem", background: "rgba(247, 244, 239, 0.5)",
                  color: "var(--color-espresso)", border: "1px solid rgba(196,181,160,0.5)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "0.5rem" }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Toggle sign in / sign up / back */}
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            {mode === "signin" && (
              <p style={{ fontSize: "0.82rem", color: "var(--color-stone)", margin: 0 }}>
                Don't have an account?{" "}
                <button type="button" onClick={() => switchMode("signup")} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-espresso)", fontWeight: 600,
                  textDecoration: "underline", textUnderlineOffset: "2px",
                  fontSize: "inherit", fontFamily: "var(--font-sans)",
                }}>
                  Sign up
                </button>
              </p>
            )}
            {mode === "signup" && (
              <p style={{ fontSize: "0.82rem", color: "var(--color-stone)", margin: 0 }}>
                Already have an account?{" "}
                <button type="button" onClick={() => switchMode("signin")} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-espresso)", fontWeight: 600,
                  textDecoration: "underline", textUnderlineOffset: "2px",
                  fontSize: "inherit", fontFamily: "var(--font-sans)",
                }}>
                  Sign in
                </button>
              </p>
            )}
            {mode === "reset" && (
              <p style={{ fontSize: "0.82rem", color: "var(--color-stone)", margin: 0 }}>
                <button type="button" onClick={() => switchMode("signin")} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-espresso)", fontWeight: 600,
                  textDecoration: "underline", textUnderlineOffset: "2px",
                  fontSize: "inherit", fontFamily: "var(--font-sans)",
                }}>
                  ← Back to sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
