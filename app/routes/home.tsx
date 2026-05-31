import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import DashboardTabs from "~/components/DashboardTabs";
import DashboardOverview from "~/components/DashboardOverview";
import PerformanceTimeline from "~/components/PerformanceTimeline";
import HistoryPanel from "~/components/HistoryPanel";
import FavoriteTemplates from "~/components/FavoriteTemplates";
import ProfileSettings from "~/components/ProfileSettings";
import AccountSecurity from "~/components/AccountSecurity";
import LoadingSkeleton from "~/components/LoadingSkeleton";
import SupportWidget from "~/components/SupportWidget";
import JobMatchingPanel from "~/components/JobMatchingPanel";
import PricingPanel from "~/components/PricingPanel";
import { useAppStore } from "~/lib/store";
import { Link } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumate — AI Résumé Analyzer" },
    { name: "description", content: "Craft your career story with intelligence. AI-powered platform that analyzes and optimizes your resume to help you land your dream job." },
    { name: "keywords", content: "resume analyzer, AI resume, ATS checker, resume feedback, resume builder" },
    { property: "og:title", content: "Resumate — AI Résumé Analyzer" },
    { property: "og:description", content: "Craft your career story with intelligence. AI-powered platform that analyzes and optimizes your resume." },
    { property: "og:type", content: "website" },
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:title", content: "Resumate — AI Résumé Analyzer" },
    { property: "twitter:description", content: "AI-powered resume analysis and optimization." },
  ];
}

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAppStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterSaved, setFilterSaved] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const load = async () => {
      setLoading(true);
      try {
        const { db } = await import("~/lib/firebase");
        const { collection, query, where, onSnapshot } = await import("firebase/firestore");
        const u = user;
        if (!u) { setLoading(false); return; }
        const q = query(collection(db, "resumes"), where("userId", "==", u.uid));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched = snapshot.docs.map(doc => doc.data() as Resume);
          fetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setResumes(fetched);
          setLoading(false);
        }, (err) => {
          console.error("Firestore listener error:", err);
          setLoading(false);
        });
      } catch (e) {
        console.error("Failed to load resumes:", e);
        setLoading(false);
      }
    };
    if (isAuthenticated) load();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [isAuthenticated, user]);

  const handleToggleFavorite = async (resumeId: string, currentFav: boolean) => {
    setResumes(prev => prev.map(r => r.id === resumeId ? { ...r, isFavorite: !currentFav } : r));
    try {
      const { db } = await import("~/lib/firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "resumes", resumeId), { isFavorite: !currentFav });
    } catch (e) {
      console.error("Failed to toggle favorite:", e);
      setResumes(prev => prev.map(r => r.id === resumeId ? { ...r, isFavorite: currentFav } : r));
    }
  };

  const firstName = user?.displayName?.split(" ")[0] ?? null;
  const displayedResumes = filterSaved ? resumes.filter(r => r.isFavorite) : resumes;

  // Show landing page while auth is loading (prevents flash)
  if (isLoading) {
    return (
      <div className="page-shell">
        <Navbar />
      </div>
    );
  }

  // Authenticated dashboard view
  if (isAuthenticated) {

    return (
      <div className="page-shell">
        <Navbar />

        {/* ── Video background ONLY on home screen ── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: -2,
          overflow: "hidden", pointerEvents: "none",
        }}>
          <video
            autoPlay muted loop playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.85 }}
          >
            <source src="/main.mp4" type="video/mp4" />
          </video>
        </div>
        <div style={{
          position: "fixed", inset: 0, zIndex: -1,
          background: "rgba(247, 244, 239, 0.65)",
          pointerEvents: "none",
        }} />

        {/* ── Dashboard Hero ── */}
        <div style={{
          minHeight: "75vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          position: "relative",
        }}>
          <h1 className="anim-fade-up" style={{ 
            fontSize: "clamp(4rem, 10vw, 8.5rem)", 
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            lineHeight: 1,
            marginBottom: "1.5rem",
            color: "var(--color-espresso)",
            letterSpacing: "-0.02em"
          }}>
            Resumate
          </h1>
          <p className="anim-fade-up anim-delay-1" style={{
            fontSize: "1.05rem",
            color: "var(--color-espresso)",
            marginBottom: "2.5rem",
            fontWeight: 400
          }}>
            Welcome back, <em style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", fontWeight: 500 }}>{firstName}</em>. Your intelligence dashboard awaits.
          </p>
          <div className="anim-fade-up anim-delay-2" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/upload" className="btn-secondary" style={{ 
              background: "rgba(92, 74, 56, 0.8)", 
              color: "white", 
              border: "none",
              padding: "0.85rem 1.75rem",
              fontSize: "0.75rem",
              backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}>
              UPLOAD RÉSUMÉ
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </Link>
            <Link to="/build" className="btn-secondary" style={{ 
              background: "rgba(255, 255, 255, 0.4)", 
              border: "1px solid rgba(184, 168, 152, 0.3)",
              color: "var(--color-espresso)",
              padding: "0.85rem 1.75rem",
              fontSize: "0.75rem",
              backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}>
              BUILD WITH AI
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>
          </div>
          
          {/* Scroll down indicator */}
          <div className="anim-fade-up anim-delay-3" style={{
            position: "absolute",
            bottom: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--color-stone)",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 500
          }}>
            {firstName ? `${firstName}'s Dashboard` : "Dashboard"}
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* ── Dashboard Content ── */}
        <div style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 2rem",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "var(--color-paper)", // solid background behind tabs to overlay the video
          borderRadius: "1.5rem 1.5rem 0 0",
          boxShadow: "0 -8px 32px rgba(28,23,19,0.03)",
          paddingTop: "2rem",
          position: "relative",
          zIndex: 10
        }}>

          {/* Tab bar */}
          <DashboardTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            resumeCount={resumes.length}
            userName={firstName}
          />

          {/* Tab content */}
          <div style={{ padding: "2rem 0 5rem", flex: 1 }}>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
                {[1, 2, 3].map(i => <LoadingSkeleton key={i} height={260} />)}
              </div>
            ) : (
              <>
                {activeTab === "overview" && (
                  <DashboardOverview resumes={resumes} onToggleFavorite={handleToggleFavorite} />
                )}

                {activeTab === "job-matching" && <JobMatchingPanel resumes={resumes} />}

                {activeTab === "resumes" && (
                  <div>
                    {/* Filter bar */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1.5rem",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}>
                      <p style={{ color: "var(--color-stone)", fontSize: "0.85rem", margin: 0 }}>
                        {displayedResumes.length} résumé{displayedResumes.length !== 1 ? "s" : ""}
                        {filterSaved ? " saved" : ""}
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button
                          onClick={() => setFilterSaved(!filterSaved)}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.375rem",
                            padding: "0.4rem 0.875rem",
                            borderRadius: "100px",
                            border: "1px solid",
                            fontSize: "0.72rem", fontWeight: 500,
                            fontFamily: "var(--font-sans)", cursor: "pointer",
                            transition: "all 0.2s ease",
                            borderColor: filterSaved ? "var(--color-amber)" : "rgba(184,168,152,0.4)",
                            background: filterSaved ? "var(--color-amber-light)" : "transparent",
                            color: filterSaved ? "var(--color-amber)" : "var(--color-stone)",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24"
                            fill={filterSaved ? "var(--color-amber)" : "none"}
                            stroke={filterSaved ? "var(--color-amber)" : "currentColor"} strokeWidth={2}>
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Saved
                        </button>
                        <Link to="/upload" className="btn-secondary" style={{ fontSize: "0.7rem", padding: "0.4rem 1rem" }}>
                          + New
                        </Link>
                      </div>
                    </div>

                    {resumes.length > 0 ? (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: "1.25rem",
                      }}>
                        {displayedResumes.map((resume, i) => (
                          <div key={resume.id} className={`anim-fade-up anim-delay-${Math.min(i + 1, 5)}`}>
                            <ResumeCard resume={resume} onToggleFavorite={handleToggleFavorite} />
                          </div>
                        ))}

                        {/* Create New Resume tile */}
                        <Link
                          to="/upload"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            minHeight: 280,
                            border: "1.5px dashed rgba(184,168,152,0.5)",
                            borderRadius: "1.25rem",
                            textDecoration: "none",
                            color: "var(--color-stone)",
                            transition: "border-color 0.2s, color 0.2s, background 0.2s",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "rgba(154,136,120,0.7)";
                            e.currentTarget.style.color = "var(--color-espresso)";
                            e.currentTarget.style.background = "var(--color-ivory-warm)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "rgba(184,168,152,0.5)";
                            e.currentTarget.style.color = "var(--color-stone)";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <div style={{
                            width: 44, height: 44,
                            borderRadius: "100%",
                            border: "1.5px solid rgba(184,168,152,0.5)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, color: "inherit" }}>
                            Create New Resume
                          </p>
                        </Link>
                      </div>
                    ) : (
                      /* Empty state */
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: "2rem",
                        padding: "5rem 1rem",
                      }} className="anim-fade-up">
                        <div style={{
                          width: 80, height: 80,
                          borderRadius: "100%",
                          border: "1.5px dashed rgba(184,168,152,0.5)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "var(--color-taupe)",
                        }}>
                          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>No résumés yet.</h2>
                          <p style={{ maxWidth: 360, fontSize: "0.95rem" }}>
                            Upload your résumé and receive instant, intelligent AI feedback tailored to your target role.
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
                          <Link to="/upload" className="btn-primary">
                            Upload Your First Résumé
                          </Link>
                          <Link to="/build" className="btn-secondary">
                            Build from Scratch
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "performance" && <PerformanceTimeline resumes={resumes} />}
                {activeTab === "history" && <HistoryPanel resumes={resumes} />}
                {activeTab === "templates" && user && <FavoriteTemplates userId={user.uid} />}
                {activeTab === "plans" && <PricingPanel />}
                {activeTab === "profile" && user && <ProfileSettings userId={user.uid} />}
                {activeTab === "security" && user && <AccountSecurity userId={user.uid} />}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: "1px solid rgba(184,168,152,0.2)",
          padding: "1.75rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.9rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-stone)",
          }}>
            Resumate
          </span>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.78rem" }}>
            <Link to="/terms" style={{ color: "var(--color-stone)", textDecoration: "none" }}>Terms</Link>
            <Link to="/privacy" style={{ color: "var(--color-stone)", textDecoration: "none" }}>Privacy</Link>
            <Link to="/refund" style={{ color: "var(--color-stone)", textDecoration: "none" }}>Refund</Link>
            <Link to="/contact" style={{ color: "var(--color-stone)", textDecoration: "none" }}>Contact</Link>
          </div>
        </footer>

        <SupportWidget />
      </div>
    );
  }

  // ─── Landing page (unauthenticated) ──────────────────────────────────────────
  return (
    <div className="page-shell">
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 5rem) clamp(4rem, 8vw, 7rem)",
        textAlign: "center",
      }}>
        {/* Video background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: -2,
          overflow: "hidden", pointerEvents: "none",
        }}>
          <video
            autoPlay muted loop playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.85 }}
          >
            <source src="/main.mp4" type="video/mp4" />
          </video>
        </div>
        <div style={{
          position: "absolute", inset: 0, zIndex: -1,
          background: "rgba(247, 244, 239, 0.65)",
          pointerEvents: "none",
        }} />
        {/* Decorative line-art SVG (inspired by reference) */}
        <svg
          style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: "42%", maxWidth: 500, opacity: 0.12, pointerEvents: "none" }}
          viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="200" cy="200" r="140" stroke="#5C4A38" strokeWidth="1"/>
          <circle cx="200" cy="200" r="100" stroke="#5C4A38" strokeWidth="1"/>
          <circle cx="200" cy="200" r="60" stroke="#5C4A38" strokeWidth="1" strokeDasharray="4 4"/>
          <line x1="60" y1="200" x2="340" y2="200" stroke="#5C4A38" strokeWidth="1"/>
          <line x1="200" y1="60" x2="200" y2="340" stroke="#5C4A38" strokeWidth="1"/>
          <path d="M 60 200 Q 200 60 340 200 Q 200 340 60 200" stroke="#5C4A38" strokeWidth="1" fill="none"/>
          <circle cx="200" cy="200" r="8" fill="#5C4A38" opacity="0.6"/>
          <circle cx="200" cy="60" r="5" fill="#5C4A38" opacity="0.4"/>
          <circle cx="340" cy="200" r="5" fill="#5C4A38" opacity="0.4"/>
          <circle cx="200" cy="340" r="5" fill="#5C4A38" opacity="0.4"/>
        </svg>

        {/* Left decorative circle */}
        <svg
          style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "25%", maxWidth: 300, opacity: 0.07, pointerEvents: "none" }}
          viewBox="0 0 300 300" fill="none"
        >
          <circle cx="150" cy="150" r="120" stroke="#5C4A38" strokeWidth="1"/>
          <circle cx="150" cy="150" r="80" stroke="#5C4A38" strokeWidth="1" strokeDasharray="3 3"/>
        </svg>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto" }}>
          {/* Tag */}
          <div className="anim-fade-up" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 1rem",
            borderRadius: "100px",
            border: "1px solid rgba(184,168,152,0.5)",
            background: "rgba(250,247,242,0.8)",
            fontSize: "0.72rem",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-stone)",
            marginBottom: "2rem",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "100%", background: "var(--color-sage)" }} />
            AI-Powered Career Intelligence
          </div>

          {/* Headline */}
          <h1
            className="anim-fade-up anim-delay-1"
            style={{
              fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
              lineHeight: 1.08,
              marginBottom: "1.5rem",
              fontWeight: 600,
            }}
          >
            Craft your career story
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>with intelligence.</em>
          </h1>

          {/* Subtext */}
          <p
            className="anim-fade-up anim-delay-2"
            style={{
              maxWidth: 520,
              margin: "0 auto 2.5rem",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "var(--color-brown)",
              lineHeight: 1.65,
            }}
          >
            Our AI-powered platform analyzes and optimizes your
            resume to help you land your dream job.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up anim-delay-3" style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/auth" className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.9rem 2.25rem" }}>
              Get Started for Free
            </Link>
            <Link to="/help" className="btn-secondary" style={{ fontSize: "0.85rem", padding: "0.9rem 2.25rem" }}>
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div style={{ height: 1, background: "rgba(184,168,152,0.2)" }} />

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
      <section style={{
        padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 5rem)",
        background: "var(--color-ivory)",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 className="anim-fade-up" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              How it works.
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "2.5rem",
          }}>
            {[
              {
                icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
                title: "Upload your résumé",
                description: "Upload your PDF résumé and let our AI extract and analyze every detail instantly.",
              },
              {
                icon: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
                title: "AI Analysis & Optimization",
                description: "Our AI platform analyzes your resume and optimizes it to help you land your dream job.",
              },
              {
                icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
                title: "Apply with Confidence",
                description: "Resumate gives you career assistance and helps you apply with confidence.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`anim-fade-up anim-delay-${i + 1}`}
                style={{ textAlign: "center" }}
              >
                <div className="how-icon-circle">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>{step.title}</h3>
                <p style={{ fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div style={{ height: 1, background: "rgba(184,168,152,0.2)" }} />

      {/* ══ FEATURES STRIP ═══════════════════════════════════════════════════ */}
      <section style={{
        padding: "clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 5rem)",
        background: "var(--color-ivory-warm)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-label">What you get</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}>
              Everything to land your next role.
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}>
            {[
              { title: "ATS Score Analysis", desc: "See exactly how well your resume ranks with automated screening systems and how to improve.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
              { title: "Job Match Analysis", desc: "Compare your resume to any job description and see your compatibility score instantly.", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              { title: "AI Resume Builder", desc: "Build a professionally formatted, ATS-optimized resume from scratch using our 70B AI engine.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { title: "Section Rewriting", desc: "Let AI rewrite specific sections of your resume — bullets, summaries, skills — for maximum impact.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
            ].map((feat, i) => (
              <div
                key={i}
                className={`card anim-fade-up anim-delay-${i + 1}`}
                style={{ padding: "1.75rem" }}
              >
                <div style={{
                  width: 40, height: 40,
                  borderRadius: "0.75rem",
                  background: "var(--color-ivory)",
                  border: "1px solid rgba(184,168,152,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-warm-mid)",
                  marginBottom: "1rem",
                }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                  </svg>
                </div>
                <h4 style={{ marginBottom: "0.5rem", fontSize: "0.95rem" }}>{feat.title}</h4>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div style={{ height: 1, background: "rgba(184,168,152,0.2)" }} />

      {/* ══ CTA BANNER ════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 5rem)",
        background: "var(--color-espresso)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 className="anim-fade-up" style={{ color: "var(--color-ivory)", fontSize: "clamp(1.8rem, 4vw, 3rem)", marginBottom: "1rem" }}>
            Start for free today.
          </h2>
          <p className="anim-fade-up anim-delay-1" style={{ color: "rgba(245,240,232,0.7)", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
            No credit card required. Upload your first résumé and see your AI analysis instantly.
          </p>
          <Link
            to="/auth"
            className="anim-fade-up anim-delay-2"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.9rem 2.25rem",
              background: "var(--color-ivory)",
              color: "var(--color-espresso)",
              borderRadius: "100px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "background 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--color-ivory-warm)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--color-ivory)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Get Started Free
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: "1px solid rgba(184,168,152,0.2)",
        padding: "2rem 2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        background: "var(--color-ivory)",
      }}>
        <span style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--color-espresso)",
        }}>
          Resumate
        </span>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.78rem" }}>
          <Link to="/terms" style={{ color: "var(--color-stone)", textDecoration: "none" }}>Terms</Link>
          <Link to="/privacy" style={{ color: "var(--color-stone)", textDecoration: "none" }}>Privacy</Link>
          <Link to="/refund" style={{ color: "var(--color-stone)", textDecoration: "none" }}>Refund</Link>
          <Link to="/contact" style={{ color: "var(--color-stone)", textDecoration: "none" }}>Contact</Link>
        </div>
        <p style={{ fontSize: "0.7rem", color: "var(--color-stone-light)", margin: 0 }}>
          © {new Date().getFullYear()} Resumate Technologies. All rights reserved.
        </p>
      </footer>
    </div>
  );
}