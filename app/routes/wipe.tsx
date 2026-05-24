import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "~/lib/store";

export const meta = () => ([{ title: "Resuman — Data Management" }]);

const WipeApp = () => {
  const { isAuthenticated, isLoading, user } = useAppStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [wiping, setWiping] = useState(false);

  const loadResumes = async () => {
    if (!user) return;
    const { db } = await import("~/lib/firebase");
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const q = query(collection(db, "resumes"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    setResumes(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth?next=/wipe");
    else if (isAuthenticated) loadResumes();
  }, [isLoading, isAuthenticated]);

  const handleDelete = async () => {
    if (!confirm("This will permanently delete all résumé data. Are you sure?")) return;
    setWiping(true);
    const { db } = await import("~/lib/firebase");
    const { doc, deleteDoc } = await import("firebase/firestore");
    for (const r of resumes) {
      await deleteDoc(doc(db, "resumes", r.docId));
    }
    await loadResumes();
    setWiping(false);
  };

  if (isLoading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "var(--color-stone)" }}>Loading…</p></div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-cream)", padding: "3rem 2rem" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="card-elevated" style={{ padding: "3rem" }}>
          <span className="section-label">Admin Tools</span>
          <h2 style={{ margin: "0.5rem 0 0.5rem" }}>Data Management</h2>
          <p style={{ marginBottom: "2rem" }}>Authenticated as <strong style={{ color: "var(--color-espresso)" }}>{user?.displayName || user?.email}</strong></p>

          <div className="divider" />

          {/* Resume list */}
          <div style={{ margin: "2rem 0" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-stone)", marginBottom: "1rem" }}>
              Stored Resumes <span style={{ marginLeft: "0.5rem", background: "var(--color-cream-warm)", padding: "0.1rem 0.625rem", borderRadius: "100px" }}>{resumes.length}</span>
            </p>
            {resumes.length === 0 ? (
              <p style={{ color: "var(--color-stone-light)", fontStyle: "italic", fontSize: "0.9rem" }}>No resumes found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 300, overflowY: "auto" }}>
                {resumes.map(r => (
                  <div key={r.docId} style={{ padding: "0.75rem 1rem", background: "var(--color-cream-warm)", borderRadius: "0.875rem", fontSize: "0.87rem", color: "var(--color-brown-mid)", border: "1px solid rgba(196,181,160,0.2)" }}>
                    {r.companyName || "Untitled"} — {r.jobTitle || "No title"}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div style={{ background: "var(--color-clay-light)", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid rgba(168,92,74,0.15)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <p style={{ fontWeight: 600, color: "var(--color-clay)", margin: "0 0 0.375rem", fontSize: "0.9rem" }}>⚠ Danger Zone</p>
              <p style={{ fontSize: "0.85rem", color: "var(--color-brown-mid)", margin: 0 }}>Permanently deletes all your résumé data from Firestore. This cannot be undone.</p>
            </div>
            <button
              onClick={handleDelete}
              disabled={wiping || resumes.length === 0}
              style={{
                padding: "0.875rem 2rem", background: wiping || resumes.length === 0 ? "var(--color-stone-light)" : "var(--color-clay)",
                color: "#FAF7F2", borderRadius: "100px", border: "none", cursor: wiping || resumes.length === 0 ? "not-allowed" : "pointer",
                fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
                transition: "background 0.25s, transform 0.2s", width: "fit-content",
              }}
            >{wiping ? "Wiping…" : "Wipe All Data"}</button>
          </div>

          <button onClick={() => navigate("/")} className="btn-secondary" style={{ marginTop: "1.5rem", fontSize: "0.78rem" }}>← Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
};

export default WipeApp;
