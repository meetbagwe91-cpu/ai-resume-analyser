import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useAppStore } from "~/lib/store";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resuman — AI Résumé Analyzer" },
    { name: "description", content: "Get intelligent, actionable feedback on your résumé." },
  ];
}

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAppStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth?next=/");
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const load = async () => {
      setLoading(true);
      try {
        const { db } = await import("~/lib/firebase");
        const { collection, query, where, onSnapshot } = await import("firebase/firestore");
        
        const u = user;
        if (!u) {
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "resumes"),
          where("userId", "==", u.uid)
        );
        
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedResumes = querySnapshot.docs.map(doc => doc.data() as Resume);
          
          // Sort by newest first since orderBy requires composite index in Firestore sometimes
          fetchedResumes.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          
          setResumes(fetchedResumes);
          setLoading(false);
        }, (error) => {
          console.error("Firestore listener error on dashboard:", error);
          setLoading(false);
        });
        
      } catch (e) {
        console.error("Failed to load resumes from Firestore", e);
        setLoading(false);
      }
    };

    if (isAuthenticated) load();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [isAuthenticated, user]);

  return (
    <div className="page-shell">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ background: "rgba(237, 232, 223, 0.45)", borderBottom: "1px solid rgba(196,181,160,0.25)", padding: "6rem 3rem 5rem", position: "relative", overflow: "hidden", backdropFilter: "blur(4px)" }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: 380, height: 380, borderRadius: "100%", background: "radial-gradient(circle, rgba(196,181,160,0.35) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "5%", width: 280, height: 280, borderRadius: "100%", background: "radial-gradient(circle, rgba(168,152,128,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.75rem", position: "relative", zIndex: 1 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-stone)", background: "rgba(247,244,239,0.6)", border: "1px solid rgba(196,181,160,0.35)", borderRadius: "100px", padding: "0.4rem 1.25rem" }}>
            AI · Résumé Intelligence
          </span>
          <h1 className="anim-fade-up" style={{ maxWidth: 820 }}>
            Your résumé,<br />
            <em style={{ fontStyle: "italic", color: "var(--color-taupe-dark)" }}>brilliantly</em> refined.
          </h1>
          <p className="anim-fade-up anim-delay-1" style={{ maxWidth: 560, fontSize: "1.1rem", color: "var(--color-brown-mid)" }}>
            Upload an existing PDF or build one from scratch. Get deep, actionable AI feedback and elite rewriting in seconds.
          </p>
          <div className="anim-fade-up anim-delay-2" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/upload" className="btn-secondary" style={{ fontSize: "0.8rem", background: "var(--color-cream-warm)", color: "var(--color-espresso)", border: "1px solid rgba(196,181,160,0.5)" }}>
              Upload PDF
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </Link>
            <Link to="/build" className="btn-primary" style={{ fontSize: "0.8rem", background: "var(--color-olive)", color: "#fff", border: "none" }}>
              Build with AI
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── RESUME GRID ───────────────────────────────────────── */}
      <section id="analyses" style={{ padding: "5rem 3rem 7rem" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "6rem 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "100%", border: "2px solid var(--color-taupe-light)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
              <p style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--color-stone)" }}>Loading dashboard…</p>
            </div>
          ) : resumes.length > 0 ? (
            <>
              {/* Section header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                  <span className="section-label">Résumé Library</span>
                  <h2 style={{ margin: 0 }}>Past Analyses</h2>
                </div>
                <Link to="/upload" className="btn-secondary" style={{ fontSize: "0.75rem" }}>
                  + New Analysis
                </Link>
              </div>

              {/* Staggered grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "2rem" }}>
                {resumes.map((resume, i) => (
                  <div key={resume.id} className={`anim-fade-up anim-delay-${Math.min(i + 1, 5)}`}>
                    <ResumeCard resume={resume} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* ── EMPTY STATE ─── */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "2.5rem", padding: "7rem 2rem" }} className="anim-fade-up">
              {/* Decorative ring */}
              <div style={{ width: 100, height: 100, borderRadius: "100%", border: "1.5px dashed var(--color-taupe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="var(--color-taupe-dark)" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 style={{ margin: "0 0 1rem" }}>No résumés yet.</h2>
                <p style={{ maxWidth: 400, fontSize: "1rem" }}>
                  Upload your first résumé and receive instant, intelligent AI feedback tailored to your target role.
                </p>
              </div>
              <Link to="/upload" className="btn-primary">
                Upload Your First Résumé
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(196,181,160,0.25)", padding: "2.5rem 3rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", letterSpacing: "0.1em", color: "var(--color-espresso)", textTransform: "uppercase" }}>Resuman</span>
        <p style={{ fontSize: "0.78rem", color: "var(--color-stone-light)", margin: 0, letterSpacing: "0.08em" }}>AI résumé intelligence. All rights reserved.</p>
      </footer>
    </div>
  );
}