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
import OnboardingTour from "~/components/OnboardingTour";
import JobMatchingPanel from "~/components/JobMatchingPanel";
import { useAppStore } from "~/lib/store";
import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [filterSaved, setFilterSaved] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

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
        if (!u) { setLoading(false); return; }

        const q = query(collection(db, "resumes"), where("userId", "==", u.uid));
        
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedResumes = querySnapshot.docs.map(doc => doc.data() as Resume);
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

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const displayedResumes = filterSaved ? resumes.filter(r => r.isFavorite) : resumes;
  const firstName = user?.displayName?.split(" ")[0] ?? null;

  return (
    <div className="page-shell">
      <Navbar />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* ═══════════════════════════════════════════════════════
            HERO — Full viewport splash with the brand name
        ═══════════════════════════════════════════════════════ */}
        <section style={{
          minHeight: "calc(100vh - 60px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          padding: "4rem 2rem",
        }}>

          {/* Decorative large orb behind the text */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -54%)",
            width: "70vw", height: "70vw",
            maxWidth: 900, maxHeight: 900,
            borderRadius: "100%",
            background: "radial-gradient(circle at 40% 40%, rgba(212,198,175,0.45) 0%, rgba(196,181,160,0.15) 50%, transparent 75%)",
            pointerEvents: "none",
            zIndex: 0,
          }} />
          <div style={{
            position: "absolute",
            bottom: "5%", right: "-5%",
            width: "35vw", height: "35vw",
            maxWidth: 480, maxHeight: 480,
            borderRadius: "100%",
            background: "radial-gradient(circle, rgba(168,152,128,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>



            {/* Brand name — the hero element */}
            <h1 className="anim-fade-up anim-delay-1" style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(5rem, 14vw, 12rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 0.9,
              color: "var(--color-espresso)",
              margin: 0,
            }}>
              Resuman
            </h1>

            {/* Tagline */}
            <p className="anim-fade-up anim-delay-2" style={{
              maxWidth: 600,
              fontSize: "clamp(1.1rem, 1.8vw, 1.35rem)",
              color: "var(--color-espresso)",
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 400,
            }}>
              {firstName
                ? <>Welcome back, <em style={{ fontStyle: "italic", color: "var(--color-espresso)", fontFamily: "var(--font-serif)" }}>{firstName}</em>. Your intelligence dashboard awaits.</>
                : "Deep AI feedback on your résumé. Optimized for the role that matters most to you."
              }
            </p>

            {/* Quick stats pill (if they have resumes) */}
            {resumes.length > 0 && (
              <div className="anim-fade-up anim-delay-3" style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}>
                <span style={{
                  fontSize: "0.85rem", letterSpacing: "0.1em", fontWeight: 500,
                  color: "var(--color-espresso)", background: "rgba(247,244,239,0.8)",
                  border: "1px solid rgba(196,181,160,0.6)",
                  borderRadius: "100px", padding: "0.45rem 1.2rem",
                  backdropFilter: "blur(8px)",
                }}>
                  {resumes.length} résumé{resumes.length > 1 ? "s" : ""} analyzed
                </span>
                {resumes.filter(r => r.optimization).length > 0 && (
                  <span style={{
                    fontSize: "0.85rem", letterSpacing: "0.1em", fontWeight: 500,
                    color: "var(--color-sage-dark)", background: "var(--color-sage-light)",
                    border: "1px solid rgba(123,155,126,0.5)",
                    borderRadius: "100px", padding: "0.45rem 1.2rem",
                  }}>
                    {resumes.filter(r => r.optimization).length} optimized
                  </span>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="anim-fade-up anim-delay-3" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/upload" className="btn-primary" style={{ fontSize: "0.78rem" }}>
                Upload Résumé
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </Link>
              <Link to="/build" className="btn-secondary" style={{ fontSize: "0.78rem" }}>
                Build with AI
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Scroll-down cue */}
          <button
            onClick={scrollToDashboard}
            className="anim-fade-in anim-delay-5"
            style={{
              position: "absolute",
              bottom: "2.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--color-stone)",
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              transition: "color 0.2s ease",
              zIndex: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-espresso)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-stone)")}
          >
            <span>Dashboard</span>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              style={{ animation: "scrollBounce 2s ease-in-out infinite" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </section>

        {/* ═══════════════════════════════════════════════════════
            DASHBOARD — Revealed on scroll
        ═══════════════════════════════════════════════════════ */}
        <div ref={dashboardRef}>
          {/* Divider */}
          <div style={{
            borderTop: "1px solid rgba(196,181,160,0.3)",
            background: "rgba(237,232,223,0.3)",
            padding: "2rem 2rem 0",
          }}>
            <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--color-stone-light)",
                }}>
                  Your Dashboard
                </span>
                <h2 style={{ margin: "0.2rem 0 0", fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)" }}>
                  {firstName ? `${firstName}'s Workspace` : "Résumé Workspace"}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <Link to="/upload" className="btn-secondary" style={{ fontSize: "0.7rem", padding: "0.6rem 1.25rem" }}>
                  Upload PDF
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </Link>
                <Link to="/build" className="btn-primary" style={{ fontSize: "0.7rem", padding: "0.6rem 1.25rem" }}>
                  Build with AI
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs bar */}
          <div className="dashboard-tabs" style={{ padding: "0 2rem", background: "rgba(237,232,223,0.3)", borderBottom: "1px solid rgba(196,181,160,0.18)" }}>
            <div style={{ maxWidth: 1320, margin: "0 auto", paddingBottom: "1rem" }}>
              <DashboardTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                resumeCount={resumes.length}
              />
            </div>
          </div>

          {/* Tab content */}
          <section style={{ padding: "2.5rem 2rem 5rem", flex: 1 }}>
            <div style={{ maxWidth: 1320, margin: "0 auto" }}>
              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                    <LoadingSkeleton height={100} />
                    <LoadingSkeleton height={100} />
                    <LoadingSkeleton height={100} />
                    <LoadingSkeleton height={100} />
                  </div>
                  <LoadingSkeleton height={200} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
                    <LoadingSkeleton height={120} />
                    <LoadingSkeleton height={120} />
                    <LoadingSkeleton height={120} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <DashboardOverview resumes={resumes} onToggleFavorite={handleToggleFavorite} />
                  )}

                  {/* Job Matching Tab */}
                  {activeTab === "job-matching" && (
                    <JobMatchingPanel resumes={resumes} />
                  )}

                  {/* All Résumés Tab */}
                  {activeTab === "resumes" && (
                    <div>
                      {resumes.length > 0 ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                            <div>
                              <span className="section-label" style={{ marginBottom: "0.25rem" }}>Résumé Library</span>
                              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-stone)" }}>
                                {displayedResumes.length} résumé{displayedResumes.length !== 1 ? "s" : ""}{filterSaved && " saved"}
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                              <button
                                onClick={() => setFilterSaved(!filterSaved)}
                                style={{
                                  display: "flex", alignItems: "center", gap: "0.375rem",
                                  padding: "0.45rem 0.875rem", borderRadius: "100px",
                                  border: "1px solid", fontSize: "0.72rem", fontWeight: 500,
                                  fontFamily: "var(--font-sans)", cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  borderColor: filterSaved ? "var(--color-amber-warm)" : "rgba(196,181,160,0.3)",
                                  background: filterSaved ? "var(--color-amber-light)" : "transparent",
                                  color: filterSaved ? "var(--color-amber-warm)" : "var(--color-stone)",
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24"
                                  fill={filterSaved ? "var(--color-amber-warm)" : "none"}
                                  stroke={filterSaved ? "var(--color-amber-warm)" : "currentColor"} strokeWidth={2}>
                                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                Saved Only
                              </button>
                              <Link to="/upload" className="btn-secondary" style={{ fontSize: "0.7rem", padding: "0.45rem 1rem" }}>
                                + New Analysis
                              </Link>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
                            {displayedResumes.map((resume, i) => (
                              <div key={resume.id} className={`anim-fade-up anim-delay-${Math.min(i + 1, 5)}`}>
                                <ResumeCard resume={resume} onToggleFavorite={handleToggleFavorite} />
                              </div>
                            ))}
                          </div>

                          {filterSaved && displayedResumes.length === 0 && (
                            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--color-stone)" }}>
                              <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>No saved résumés</p>
                              <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>Star your favorite résumés to see them here.</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "2rem", padding: "5rem 1rem" }} className="anim-fade-up">
                          <div style={{ width: 90, height: 90, borderRadius: "100%", border: "1.5px dashed var(--color-taupe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="var(--color-taupe-dark)" strokeWidth={1.25}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h2 style={{ margin: "0 0 0.75rem" }}>No résumés yet.</h2>
                            <p style={{ maxWidth: 380, fontSize: "0.9rem" }}>Upload your first résumé and receive instant, intelligent AI feedback tailored to your target role.</p>
                          </div>
                          <Link to="/upload" className="btn-primary" style={{ fontSize: "0.78rem" }}>
                            Upload Your First Résumé
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Performance Tab */}
                  {activeTab === "performance" && <PerformanceTimeline resumes={resumes} />}

                  {/* History Tab */}
                  {activeTab === "history" && <HistoryPanel resumes={resumes} />}

                  {/* Templates Tab */}
                  {activeTab === "templates" && user && <FavoriteTemplates userId={user.uid} />}

                  {/* Profile Tab */}
                  {activeTab === "profile" && user && <ProfileSettings userId={user.uid} />}

                  {/* Security Tab */}
                  {activeTab === "security" && user && <AccountSecurity userId={user.uid} />}
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(196,181,160,0.25)",
        padding: "1.5rem 2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", letterSpacing: "0.12em", color: "var(--color-espresso)", textTransform: "uppercase" }}>Resuman</span>
        <p style={{ fontSize: "0.7rem", color: "var(--color-stone-light)", margin: 0, letterSpacing: "0.08em" }}>AI résumé intelligence. All rights reserved.</p>
      </footer>
    </div>
  );
}