import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useAppStore } from "~/lib/store";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import OptimizedResumeView from "~/components/OptimizedResumeView";
import PaywallModal from "~/components/PaywallModal";
import { checkPremiumStatus } from "~/lib/premium";
import { runOptimization, type OptimizeProgress } from "~/lib/optimizer";
import SectionRewriter from "~/components/SectionRewriter";

export const meta = () => ([
  { title: "Resumate — Analysis Result" },
  { name: "description", content: "Review your AI résumé analysis." },
]);

const Resume = () => {
  const { isAuthenticated, isLoading, user } = useAppStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [companyInfo, setCompanyInfo] = useState({ name: "", title: "" });
  const [jobDescription, setJobDescription] = useState("");
  const [resumePath, setResumePath] = useState("");
  const [resumeText, setResumeText] = useState("");
  const navigate = useNavigate();

  // Premium & Optimization States
  const [optCredits, setOptCredits] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState<OptimizeProgress | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<ResumeOptimization | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    let unsubscribe: (() => void) | null = null;

    const subscribe = async () => {
      try {
        const { db } = await import("~/lib/firebase");
        const { doc, onSnapshot } = await import("firebase/firestore");

        // Real-time listener — fires immediately with current data, then again
        // whenever the background upload patches imagePath / resumePath.
        unsubscribe = onSnapshot(
          doc(db, "resumes", id as string),
          (snap) => {
            if (!snap.exists()) {
              setFeedback({ error: "not_found" } as any);
              return;
            }
            const data = snap.data();
            setCompanyInfo({ name: data.companyName, title: data.jobTitle });
            setJobDescription(data.jobDescription || "");
            setResumePath(data.resumePath || "");
            setResumeText(data.resumeText || "");
            if (data.resumePath) setResumeUrl(data.resumePath);
            if (data.imagePath)  setImageUrl(data.imagePath);
            setFeedback(data.feedback);
          },
          (err) => {
            console.error("Firestore listener error:", err);
            setFeedback({ error: "firebase_error" } as any);
          }
        );
      } catch (e) {
        console.error("Failed to subscribe to resume:", e);
        setFeedback({ error: "firebase_error" } as any);
      }
    };

    subscribe();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [isAuthenticated, id]);

  const loadCredits = () => {
    checkPremiumStatus().then(status => setOptCredits(status.optimizationCredits));
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const handleOptimize = async () => {
    if (optCredits <= 0) {
      setShowPaywall(true);
      return;
    }
    
    if (!resumeText || !feedback) return;
    
    setOptimizationProgress({ step: "idle", message: "Starting optimization..." });
    try {
      // Consume a credit
      const { useOptimizationCredit } = await import("~/lib/premium");
      const used = await useOptimizationCredit();
      if (!used) throw new Error("Not enough credits.");
      loadCredits(); // Refresh local count

      const result = await runOptimization(
        resumeText,
        companyInfo.title,
        jobDescription,
        feedback,
        (progress) => setOptimizationProgress(progress)
      );
      setOptimizationResult(result);
      setOptimizationProgress(null);
    } catch (err: any) {
      console.error(err);
      setOptimizationProgress({ step: "error", message: err.message || "Optimization failed." });
    }
  };

  /* ── Loading state ──────────────────────────────────── */
  if (isLoading || !feedback) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "100%", border: "2px solid var(--color-taupe-light)", borderTopColor: "var(--color-olive)", animation: "spin 1s linear infinite", margin: "0 auto 1.5rem" }} />
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--color-espresso)", margin: "0 0 0.375rem" }}>Loading analysis…</p>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-stone-light)" }}>Resumate</span>
        </div>
      </div>
    );
  }

  if (feedback && (feedback as any).error === "not_found") {
    // If the database was wiped but localStorage kept the cache, clear it so they can re-upload
    try {
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("resumate_cache_")) {
            const raw = localStorage.getItem(key);
            if (raw && raw.includes(id as string)) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch(e) {}

    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
        <div style={{ textAlign: "center", color: "var(--color-clay)" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", margin: "0 0 0.375rem" }}>Résumé Not Found</p>
          <p style={{ maxWidth: 400, margin: "0 auto 1.5rem", fontSize: "0.9rem" }}>
            This résumé could not be found in the database. If this is an older résumé, it may not have been migrated to the new database.
          </p>
          <Link to="/upload" className="btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem", textDecoration: "none" }}>
            Upload Résumé Again
          </Link>
        </div>
      </div>
    );
  }

  if (feedback && (feedback as any).error === "firebase_error") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
        <div style={{ textAlign: "center", color: "var(--color-clay)" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", margin: "0 0 0.375rem" }}>Database Connection Error</p>
          <p>Failed to connect to Firebase. Your Firestore Database might not be created yet, or your Security Rules are locked in Production Mode.</p>
        </div>
      </div>
    );
  }

  if (feedback && !feedback.ATS && !(feedback as any).error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
        <div style={{ textAlign: "center", color: "var(--color-clay)" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", margin: "0 0 0.375rem" }}>AI Model Error</p>
          <p>The AI model returned a malformed response without an ATS section. Please try again.</p>
        </div>
      </div>
    );
  }

  /* ── Result page ────────────────────────────────────── */
  return (
    <div className="page-shell">
      {/* ── Sticky top bar ─────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(247,244,239,0.9)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(196,181,160,0.25)",
        padding: "1.125rem clamp(1rem, 4vw, 3rem)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link to="/" style={{
            width: 38, height: 38, borderRadius: "100%",
            background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--color-brown-mid)", textDecoration: "none", transition: "background 0.2s"
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-cream-deep)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--color-cream-warm)")}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontWeight: 500, color: "var(--color-espresso)", margin: 0, lineHeight: 1.2 }}>{companyInfo.name || "Analysis"}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--color-stone)", margin: "0.125rem 0 0", letterSpacing: "0.08em" }}>{companyInfo.title || "Role"}</p>
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(1.5rem, 5vw, 3rem) clamp(1.25rem, 4vw, 3rem) 7rem", display: "flex", flexDirection: "column", gap: "3rem", alignItems: "stretch" }}>

        {/* Feedback sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }} className="anim-fade-up anim-delay-2">
          {optimizationResult ? (
            <OptimizedResumeView 
              optimization={optimizationResult} 
              originalImageUrl={imageUrl} 
              jobTitle={companyInfo.title}
              resumeId={id}
            />
          ) : (
            <>
              {/* Premium Auto-Optimize Banner */}
              <div className="card-elevated" style={{ 
                padding: "clamp(1.5rem, 4vw, 2.5rem)", 
                background: "linear-gradient(135deg, rgba(74,69,53,1) 0%, rgba(44,35,24,1) 100%)", 
                color: "#F7F4EF",
                display: "flex", flexDirection: "column", gap: "1.25rem",
                boxShadow: "0 24px 50px rgba(44,35,24,0.15), 0 4px 15px rgba(44,35,24,0.08)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", background: "rgba(255,255,255,0.15)", padding: "0.25rem 0.6rem", borderRadius: "100px", color: "#E0D7C1" }}>Premium</span>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "var(--color-amber-warm)" }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 style={{ margin: 0, fontSize: "clamp(1.3rem, 4vw, 1.8rem)", color: "#F7F4EF", fontFamily: "var(--font-serif)", fontWeight: 400 }}>Auto-Optimize My Résumé</h3>
                  </div>
                  
                  {optimizationProgress ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", background: "rgba(255,255,255,0.08)", padding: "0.75rem 1.25rem", borderRadius: "100px" }}>
                      {optimizationProgress.step === "error" ? (
                        <span style={{ color: "#FFB4A9", fontSize: "0.82rem", fontWeight: 500 }}>{optimizationProgress.message}</span>
                      ) : (
                        <>
                          <div style={{ width: 14, height: 14, borderRadius: "100%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 1s linear infinite" }} />
                          <span style={{ color: "#F7F4EF", fontSize: "0.82rem", fontWeight: 500 }}>{optimizationProgress.message}</span>
                        </>
                      )}
                    </div>
                  ) : (
                      <button 
                        onClick={handleOptimize}
                        className="btn-primary" 
                        style={{ 
                          background: "#F7F4EF", color: "#2C2318", border: "none", 
                          padding: "0.875rem 1.5rem", fontSize: "0.85rem", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" 
                        }}
                      >
                        {optCredits > 0 ? "Start AI Optimization" : "Unlock Auto-Optimize"}
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                  )}
                </div>
                
                {!optimizationProgress && (
                  <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(247,244,239,0.8)", lineHeight: 1.5, maxWidth: 500 }}>
                    Let our advanced AI rewrite your bullets, fix keyword gaps, and reformat your résumé for maximum ATS compatibility.
                  </p>
                )}
                
                {optimizationProgress?.step === "error" && (
                  <button onClick={() => setOptimizationProgress(null)} style={{ alignSelf: "flex-start", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "100px", fontSize: "0.75rem", cursor: "pointer" }}>
                    Try Again
                  </button>
                )}
              </div>

              <ATS score={feedback.ATS?.score ?? 0} suggestions={feedback.ATS?.tips ?? []} />
              <Summary feedback={feedback} />
              <Details feedback={feedback} />

              {/* Section-by-section rewrite */}
              {resumeText && (
                <SectionRewriter
                  resumeText={resumeText}
                  jobTitle={companyInfo.title}
                  jobDescription={jobDescription}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(196,181,160,0.2)", padding: "clamp(1.5rem, 4vw, 3rem)", textAlign: "center" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-stone-light)" }}>Resumate</span>
      </footer>

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal 
          feature="auto-optimize"
          onClose={() => setShowPaywall(false)} 
          onSuccess={() => {
            loadCredits();
            setShowPaywall(false);
            setTimeout(() => {
              handleOptimize(); // Use the timeout so state has a moment to settle if needed
            }, 0);
          }} 
          userName={user?.displayName || user?.email || ""} 
          userEmail={user?.email || ""}
        />
      )}
    </div>
  );
};

export default Resume;
