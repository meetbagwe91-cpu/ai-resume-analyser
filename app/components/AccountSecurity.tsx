import { useState, useEffect } from "react";
import { useAppStore } from "~/lib/store";
import { useNavigate } from "react-router";
import Tooltip from "./Tooltip";

interface AccountSecurityProps {
  userId: string;
}

const AccountSecurity = ({ userId }: AccountSecurityProps) => {
  const { user, signOut, deleteAccount, sendPasswordReset, error, clearError } = useAppStore();
  const navigate = useNavigate();

  const [resumeCount, setResumeCount] = useState(0);
  const [fileStorageUsed, setFileStorageUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Delete account flow
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Privacy
  const [privacySettings, setPrivacySettings] = useState({
    analyticsOptIn: true,
    shareAnonymousData: false,
  });

  // Password reset
  const [resetSent, setResetSent] = useState(false);

  // Session info
  const metadata = user?.metadata;
  const providerData = user?.providerData ?? [];
  const isEmailUser = providerData.some(p => p.providerId === "password");
  const isGoogleUser = providerData.some(p => p.providerId === "google.com");

  // Load data counts
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { db } = await import("~/lib/firebase");
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const q = query(collection(db, "resumes"), where("userId", "==", userId));
        const snap = await getDocs(q);
        setResumeCount(snap.docs.length);

        // Estimate storage
        let totalSize = 0;
        snap.docs.forEach(d => {
          const data = d.data();
          totalSize += JSON.stringify(data).length;
        });
        setFileStorageUsed(totalSize);

        // Load privacy prefs
        const { doc, getDoc } = await import("firebase/firestore");
        const prefSnap = await getDoc(doc(db, "user_preferences", userId));
        if (prefSnap.exists()) {
          const data = prefSnap.data();
          if (data.privacySettings) {
            setPrivacySettings(data.privacySettings);
          }
        }
      } catch (e) {
        console.error("Failed to load account stats:", e);
      }
      setLoading(false);
    };
    loadStats();
  }, [userId]);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    clearError();
    const success = await sendPasswordReset(user.email);
    if (success) setResetSent(true);
  };

  const handleDeleteAllFiles = async () => {
    if (!confirm("This will permanently delete ALL your résumé data. This cannot be undone. Are you sure?")) return;
    try {
      const { db } = await import("~/lib/firebase");
      const { collection, query, where, getDocs, deleteDoc, doc } = await import("firebase/firestore");
      const q = query(collection(db, "resumes"), where("userId", "==", userId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, "resumes", d.id));
      }
      setResumeCount(0);
      setFileStorageUsed(0);
    } catch (e) {
      console.error("Failed to delete files:", e);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    clearError();

    // Delete all user data first
    try {
      const { db } = await import("~/lib/firebase");
      const { collection, query, where, getDocs, deleteDoc, doc } = await import("firebase/firestore");

      // Delete resumes
      const q = query(collection(db, "resumes"), where("userId", "==", userId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, "resumes", d.id));
      }

      // Delete preferences
      await deleteDoc(doc(db, "user_preferences", userId));
    } catch (e) {
      console.error("Failed to delete user data:", e);
    }

    // Delete the Firebase Auth account
    const success = await deleteAccount(isEmailUser ? deletePassword : undefined);
    setDeleting(false);
    if (success) {
      navigate("/auth");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const savePrivacy = async (newSettings: typeof privacySettings) => {
    setPrivacySettings(newSettings);
    try {
      const { db } = await import("~/lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "user_preferences", userId), { privacySettings: newSettings }, { merge: true });
    } catch (e) {
      console.error("Failed to save privacy settings:", e);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: "100%", border: "2px solid var(--color-taupe-light)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      {/* ── Account Info ── */}
      <div style={{
        padding: "1.75rem", borderRadius: "1.25rem",
        background: "rgba(250,247,242,0.9)", border: "1px solid rgba(196,181,160,0.25)",
      }}>
        <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>
          Account Information
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "1rem" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-stone)" }}>Name</p>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.95rem", fontWeight: 500, color: "var(--color-espresso)" }}>{user?.displayName || "—"}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-stone)" }}>Email</p>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.95rem", fontWeight: 500, color: "var(--color-espresso)" }}>{user?.email || "—"}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-stone)" }}>Auth Provider</p>
            <div style={{ display: "flex", gap: "0.375rem", marginTop: "0.25rem" }}>
              {isGoogleUser && (
                <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.6rem", borderRadius: "100px", background: "var(--color-sage-light)", color: "var(--color-sage)", fontWeight: 600 }}>
                  Google
                </span>
              )}
              {isEmailUser && (
                <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.6rem", borderRadius: "100px", background: "var(--color-amber-light)", color: "var(--color-amber-warm)", fontWeight: 600 }}>
                  Email/Password
                </span>
              )}
            </div>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-stone)" }}>User ID</p>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", fontFamily: "monospace", color: "var(--color-stone-light)", wordBreak: "break-all" }}>{userId}</p>
          </div>
        </div>
      </div>

      {/* ── Session Info ── */}
      <div>
        <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>
          Session Management
        </span>
        <div style={{
          padding: "1.25rem 1.5rem", borderRadius: "1.25rem",
          background: "rgba(250,247,242,0.9)", border: "1px solid rgba(196,181,160,0.25)",
          display: "flex", flexDirection: "column", gap: "0.875rem", marginTop: "0.5rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500, color: "var(--color-espresso)" }}>Current Session</p>
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--color-stone)" }}>
                Signed in since {metadata?.lastSignInTime ? new Date(metadata.lastSignInTime).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
              </p>
            </div>
            <span style={{ fontSize: "0.68rem", padding: "0.2rem 0.6rem", borderRadius: "100px", background: "var(--color-sage-light)", color: "var(--color-sage)", fontWeight: 600 }}>
              Active
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500, color: "var(--color-espresso)" }}>Account Created</p>
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--color-stone)" }}>
                {metadata?.creationTime ? new Date(metadata.creationTime).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-secondary"
            style={{ fontSize: "0.72rem", padding: "0.55rem 1.25rem", width: "fit-content", marginTop: "0.25rem" }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out of All Sessions
          </button>
        </div>
      </div>

      {/* ── Security ── */}
      {isEmailUser && (
        <div>
          <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>
            Security
          </span>
          <div style={{
            padding: "1.25rem 1.5rem", borderRadius: "1.25rem",
            background: "rgba(250,247,242,0.9)", border: "1px solid rgba(196,181,160,0.25)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: "0.5rem",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500, color: "var(--color-espresso)" }}>Password</p>
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--color-stone)" }}>
                {resetSent ? "Reset email sent — check your inbox." : "Change your account password via email."}
              </p>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={resetSent}
              className="btn-secondary"
              style={{ fontSize: "0.7rem", padding: "0.45rem 1rem", opacity: resetSent ? 0.5 : 1 }}
            >
              {resetSent ? "✓ Sent" : "Reset Password"}
            </button>
          </div>
        </div>
      )}

      {/* ── Secure File Storage ── */}
      <div>
        <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>
          Secure File Storage
        </span>
        <div style={{
          padding: "1.25rem 1.5rem", borderRadius: "1.25rem",
          background: "rgba(250,247,242,0.9)", border: "1px solid rgba(196,181,160,0.25)",
          display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-stone)" }}>Résumés Stored</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "1.3rem", fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--color-espresso)" }}>{resumeCount}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-stone)" }}>Data Used</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "1.3rem", fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--color-espresso)" }}>{formatBytes(fileStorageUsed)}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-stone)" }}>Encryption</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", fontWeight: 500, color: "var(--color-sage)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ verticalAlign: "middle", marginRight: "0.25rem" }}>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
                AES-256
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Tooltip content="We retain your data as long as your account is active. You can delete your account or individual files at any time.">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-sage)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--color-brown-mid)", borderBottom: "1px dashed rgba(196,181,160,0.5)", paddingBottom: "2px", display: "inline-block" }}>
                  All files are stored in Firebase Cloud Storage with Google's enterprise-grade encryption at rest and in transit.
                </p>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* ── Privacy Controls ── */}
      <div>
        <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>
          Privacy Controls
        </span>
        <div style={{
          padding: "1.25rem 1.5rem", borderRadius: "1.25rem",
          background: "rgba(250,247,242,0.9)", border: "1px solid rgba(196,181,160,0.25)",
          display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem",
        }}>
          {/* Analytics opt-in toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500, color: "var(--color-espresso)" }}>Usage Analytics</p>
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--color-stone)" }}>Help us improve by sharing anonymous usage data.</p>
            </div>
            <button
              onClick={() => savePrivacy({ ...privacySettings, analyticsOptIn: !privacySettings.analyticsOptIn })}
              style={{
                width: 44, height: 24, borderRadius: "100px", border: "none", cursor: "pointer",
                background: privacySettings.analyticsOptIn ? "var(--color-olive)" : "var(--color-taupe-light)",
                position: "relative", transition: "background 0.2s ease",
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "100%", background: "#fff",
                position: "absolute", top: 3,
                left: privacySettings.analyticsOptIn ? 23 : 3,
                transition: "left 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }} />
            </button>
          </div>

          {/* Anonymous data sharing toggle */}
          <div style={{ borderTop: "1px solid rgba(196,181,160,0.15)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500, color: "var(--color-espresso)" }}>Share Anonymous Insights</p>
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--color-stone)" }}>Contribute to benchmarks — your data is never personally identifiable.</p>
            </div>
            <button
              onClick={() => savePrivacy({ ...privacySettings, shareAnonymousData: !privacySettings.shareAnonymousData })}
              style={{
                width: 44, height: 24, borderRadius: "100px", border: "none", cursor: "pointer",
                background: privacySettings.shareAnonymousData ? "var(--color-olive)" : "var(--color-taupe-light)",
                position: "relative", transition: "background 0.2s ease",
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "100%", background: "#fff",
                position: "absolute", top: 3,
                left: privacySettings.shareAnonymousData ? 23 : 3,
                transition: "left 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div style={{
        padding: "1.75rem", borderRadius: "1.25rem",
        background: "var(--color-clay-light)", border: "1px solid rgba(168,92,74,0.18)",
      }}>
        <span className="section-label" style={{ marginBottom: "0.5rem", color: "var(--color-clay)", fontWeight: 600 }}>
          ⚠ Danger Zone
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
          {/* Delete all files */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500, color: "var(--color-espresso)" }}>Delete All Files</p>
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--color-brown-mid)" }}>Permanently delete all {resumeCount} résumé{resumeCount !== 1 ? "s" : ""} and associated data.</p>
            </div>
            <button
              onClick={handleDeleteAllFiles}
              disabled={resumeCount === 0}
              style={{
                padding: "0.5rem 1.125rem", borderRadius: "100px", fontSize: "0.72rem",
                fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                border: "1px solid rgba(168,92,74,0.3)", cursor: resumeCount === 0 ? "not-allowed" : "pointer",
                background: "transparent", color: "var(--color-clay)",
                transition: "all 0.2s ease", opacity: resumeCount === 0 ? 0.4 : 1,
                fontFamily: "var(--font-sans)",
              }}
            >
              Delete Files
            </button>
          </div>

          <div style={{ borderTop: "1px solid rgba(168,92,74,0.15)", paddingTop: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500, color: "var(--color-espresso)" }}>Delete Account</p>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--color-brown-mid)" }}>
                  Permanently deletes your account, all résumés, preferences, and analysis data. This cannot be undone.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    padding: "0.5rem 1.125rem", borderRadius: "100px", fontSize: "0.72rem",
                    fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                    border: "none", cursor: "pointer",
                    background: "var(--color-clay)", color: "#FAF7F2",
                    transition: "all 0.2s ease",
                    fontFamily: "var(--font-sans)", flexShrink: 0,
                  }}
                >
                  Delete Account
                </button>
              ) : null}
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
              <div style={{
                marginTop: "1rem", padding: "1.25rem", borderRadius: "1rem",
                background: "rgba(168,92,74,0.08)", border: "1px solid rgba(168,92,74,0.2)",
              }}>
                <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-clay)" }}>
                  Are you absolutely sure?
                </p>
                <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: "var(--color-brown-mid)" }}>
                  This action is <strong>irreversible</strong>. All your data will be permanently erased.
                </p>
                {isEmailUser && (
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-stone)", marginBottom: "0.4rem" }}>
                      Enter your password to confirm
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      placeholder="Your password"
                      style={{
                        width: "100%", maxWidth: 300, padding: "0.7rem 1rem", borderRadius: "0.625rem",
                        border: "1px solid rgba(168,92,74,0.3)", background: "rgba(255,255,255,0.8)",
                        fontSize: "0.88rem", color: "var(--color-espresso)", outline: "none",
                      }}
                    />
                  </div>
                )}
                {error && (
                  <div style={{ marginBottom: "0.75rem", padding: "0.5rem 0.75rem", background: "rgba(168,92,74,0.12)", borderRadius: "0.5rem", fontSize: "0.78rem", color: "var(--color-clay)" }}>
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || (isEmailUser && !deletePassword)}
                    style={{
                      padding: "0.55rem 1.25rem", borderRadius: "100px", fontSize: "0.72rem",
                      fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                      border: "none", cursor: deleting ? "wait" : "pointer",
                      background: "var(--color-clay)", color: "#FAF7F2",
                      opacity: deleting || (isEmailUser && !deletePassword) ? 0.5 : 1,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {deleting ? "Deleting…" : "Yes, Delete My Account"}
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); clearError(); }}
                    style={{
                      padding: "0.55rem 1.25rem", borderRadius: "100px", fontSize: "0.72rem",
                      fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                      border: "1px solid rgba(196,181,160,0.4)", cursor: "pointer",
                      background: "transparent", color: "var(--color-brown-mid)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurity;
