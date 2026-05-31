import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useAppStore } from "~/lib/store";
import Navbar from "~/components/Navbar";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import OptimizedResumeView from "~/components/OptimizedResumeView";
import PaywallModal from "~/components/PaywallModal";
import { checkPremiumStatus } from "~/lib/premium";
import { runOptimization, type OptimizeProgress } from "~/lib/optimizer";
import SectionRewriter from "~/components/SectionRewriter";
import ScoreCircle from "~/components/ScoreCircle";

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
        unsubscribe = onSnapshot(
          doc(db, "resumes", id as string),
          (snap) => {
            if (!snap.exists()) { setFeedback({ error: "not_found" } as any); return; }
            const data = snap.data();
            setCompanyInfo({ name: data.companyName, title: data.jobTitle });
            setJobDescription(data.jobDescription || "");
            setResumePath(data.resumePath || "");
            setResumeText(data.resumeText || "");
            if (data.resumePath) setResumeUrl(data.resumePath);
            if (data.imagePath) setImageUrl(data.imagePath);
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

  useEffect(() => { loadCredits(); }, []);

  const handleOptimize = async () => {
    if (optCredits <= 0) { setShowPaywall(true); return; }
    if (!resumeText || !feedback) return;
    setOptimizationProgress({ step: "idle", message: "Starting optimization..." });
    try {
      const { useOptimizationCredit } = await import("~/lib/premium");
      const used = await useOptimizationCredit();
      if (!used) throw new Error("Not enough credits.");
      loadCredits();
      const result = await runOptimization(resumeText, companyInfo.title, jobDescription, feedback, p => setOptimizationProgress(p));
      setOptimizationResult(result);
      setOptimizationProgress(null);
    } catch (err: any) {
      console.error(err);
      setOptimizationProgress({ step: "error", message: err.message || "Optimization failed." });
    }
  };

  /* ── Loading ──────────────────────────────────────── */
  if (isLoading || !feedback) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--color-ivory)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48,
            borderRadius: "100%",
            border: "2px solid rgba(184,168,152,0.3)",
            borderTopColor: "var(--color-espresso)",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1.5rem",
          }} />
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--color-espresso)", marginBottom: "0.25rem" }}>
            Loading analysis…
          </p>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-stone-light)" }}>
            Resumate
          </span>
        </div>
      </div>
    );
  }

  /* ── Error states ─────────────────────────────────── */
  if ((feedback as any).error === "not_found") {
    try {
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("resumate_cache_")) {
            const raw = localStorage.getItem(key);
            if (raw && raw.includes(id as string)) localStorage.removeItem(key);
          }
        }
      }
    } catch {}
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-ivory)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="card-elevated" style={{ padding: "3rem", textAlign: "center", maxWidth: 480 }}>
          <div style={{ width: 52, height: 52, borderRadius: "100%", background: "var(--color-clay-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--color-clay)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 style={{ marginBottom: "0.75rem" }}>Résumé Not Found</h2>
          <p style={{ marginBottom: "2rem" }}>
            This résumé could not be found. It may have been removed or the link is invalid.
          </p>
          <Link to="/upload" className="btn-primary">Upload Résumé Again</Link>
        </div>
      </div>
    );
  }

  if ((feedback as any).error === "firebase_error") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-ivory)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="card-elevated" style={{ padding: "3rem", textAlign: "center", maxWidth: 480 }}>
          <h2 style={{ marginBottom: "0.75rem" }}>Database Connection Error</h2>
          <p>Failed to connect to Firebase. Your Firestore Database might not be created yet, or your Security Rules are locked.</p>
        </div>
      </div>
    );
  }

  if (!feedback.ATS && !(feedback as any).error) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-ivory)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="card-elevated" style={{ padding: "3rem", textAlign: "center", maxWidth: 480 }}>
          <h2 style={{ marginBottom: "0.75rem" }}>AI Model Error</h2>
          <p>The AI model returned a malformed response. Please try uploading again.</p>
        </div>
      </div>
    );
  }

  /* ── Result page ──────────────────────────────────── */
  const matchScore = feedback.overallScore ?? feedback.ATS?.score ?? 0;

  return (
    <div className="page-shell" style={{ background: "var(--color-ivory)" }}>

      {/* ── Real Navbar ── */}
      <Navbar />

      {/* ── Page sub-header (title + optimize action) ── */}
      <div style={{
        borderBottom: "1px solid rgba(184,168,152,0.18)",
        padding: "0 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 56,
        flexWrap: "wrap",
        gap: "0.75rem",
        background: "var(--color-paper)",
      }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--color-stone)" }}>
          <Link to="/" style={{ color: "var(--color-stone)", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-espresso)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-stone)")}
          >
            Dashboard
          </Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--color-espresso)", fontWeight: 500 }}>
            {companyInfo.title || "Analysis"}
            {companyInfo.name ? ` · ${companyInfo.name}` : ""}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
          {optimizationResult && (
            <button onClick={() => { setOptimizationResult(null); setOptimizationProgress(null); }} className="btn-secondary" style={{ fontSize: "0.72rem", padding: "0.5rem 1rem" }}>
              ← Back to Analysis
            </button>
          )}
          {!optimizationResult && (
            <button
              onClick={handleOptimize}
              className="btn-primary"
              style={{ fontSize: "0.72rem", padding: "0.55rem 1.125rem" }}
              disabled={!!optimizationProgress && optimizationProgress.step !== "error"}
            >
              {optimizationProgress && optimizationProgress.step !== "error" ? (
                <>
                  <div className="spinner spinner-light" style={{ width: 13, height: 13 }} />
                  {optimizationProgress.message || "Optimizing…"}
                </>
              ) : (
                optCredits > 0 ? "AI Optimize" : "Unlock Optimize"
              )}
            </button>
          )}
        </div>
      </div>


      {/* ── Page title ── */}
      <div style={{ textAlign: "center", padding: "2.5rem 2rem 1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.4rem)", marginBottom: "0.25rem" }}>
          Resume &amp; Job Match Analysis
        </h1>
        {(companyInfo.name || companyInfo.title) && (
          <p style={{ fontSize: "0.9rem", color: "var(--color-stone)" }}>
            {companyInfo.title}{companyInfo.name ? ` · ${companyInfo.name}` : ""}
          </p>
        )}
      </div>

      {optimizationResult ? (
        /* ── Optimization view ── */
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem 5rem" }}>
          <OptimizedResumeView
            optimization={optimizationResult}
            originalImageUrl={imageUrl}
            jobTitle={companyInfo.title}
            resumeId={id}
          />
        </div>
      ) : (
        /* ── 3-column analysis layout ── */
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 2rem 5rem",
          display: "grid",
          gridTemplateColumns: "1fr 260px 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
          className="analysis-layout"
        >
          {/* ── LEFT: Your Resume ── */}
          <div className="card anim-fade-up" style={{ padding: "2rem" }}>
            <span className="section-label">Your Résumé</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "0.5rem" }}>
              {/* Content tips */}
              {feedback.content?.tips && feedback.content.tips.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }}>Content Analysis</h4>
                  {feedback.content.tips.slice(0, 4).map((tip, i) => (
                    <div key={i} style={{
                      display: "flex",
                      gap: "0.625rem",
                      alignItems: "flex-start",
                      marginBottom: "0.75rem",
                      paddingLeft: "0.25rem",
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "100%",
                        background: tip.type === "good" ? "var(--color-sage-light)" : "var(--color-amber-light)",
                        border: `1px solid ${tip.type === "good" ? "rgba(90,122,92,0.3)" : "rgba(184,137,42,0.3)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: "2px",
                      }}>
                        {tip.type === "good" ? (
                          <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="var(--color-sage-dark)" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="var(--color-amber)" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
                          </svg>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-espresso)", lineHeight: 1.55 }}>{tip.tip}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="divider-solid" />

              {/* Structure tips */}
              {feedback.structure?.tips && feedback.structure.tips.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }}>Structure</h4>
                  {feedback.structure.tips.slice(0, 3).map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: "100%",
                        background: tip.type === "good" ? "var(--color-sage-light)" : "var(--color-ivory-deep)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: "2px",
                      }}>
                        <svg width="7" height="7" fill="none" viewBox="0 0 24 24"
                          stroke={tip.type === "good" ? "var(--color-sage-dark)" : "var(--color-stone)"} strokeWidth={3}>
                          {tip.type === "good"
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />}
                        </svg>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-espresso)", lineHeight: 1.55 }}>{tip.tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills tips */}
              {feedback.skills?.tips && feedback.skills.tips.length > 0 && (
                <>
                  <div className="divider-solid" />
                  <div>
                    <h4 style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }}>Skills Feedback</h4>
                    {feedback.skills.tips.slice(0, 3).map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: "100%",
                          background: tip.type === "good" ? "var(--color-sage-light)" : "var(--color-ivory-deep)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, marginTop: "2px",
                        }}>
                          <svg width="7" height="7" fill="none" viewBox="0 0 24 24"
                            stroke={tip.type === "good" ? "var(--color-sage-dark)" : "var(--color-stone)"} strokeWidth={3}>
                            {tip.type === "good"
                              ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />}
                          </svg>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-espresso)", lineHeight: 1.55 }}>{tip.tip}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── CENTER: Match Score + Gaps/Strengths ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Score ring */}
            <div className="card-elevated anim-fade-up anim-delay-1" style={{
              padding: "2rem 1.25rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}>
              <ScoreCircle score={matchScore} size="lg" />
            </div>

            {/* Gaps — from ATS improve tips */}
            {feedback.ATS?.tips?.filter(t => t.type === "improve").length > 0 && (
              <div className="card anim-fade-up anim-delay-2" style={{ padding: "1.25rem" }}>
                <span className="section-label" style={{ marginBottom: "0.75rem" }}>Areas to Improve</span>
                {feedback.ATS.tips.filter(t => t.type === "improve").slice(0, 3).map((tip, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "100%", background: "var(--color-clay-light)", border: "1px solid rgba(168,92,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                      <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="var(--color-clay)" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p style={{ fontSize: "0.82rem", margin: 0, color: "var(--color-espresso)" }}>{tip.tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths — from ATS good tips */}
            {feedback.ATS?.tips?.filter(t => t.type === "good").length > 0 && (
              <div className="card anim-fade-up anim-delay-3" style={{ padding: "1.25rem" }}>
                <span className="section-label" style={{ marginBottom: "0.75rem" }}>Strengths</span>
                {feedback.ATS.tips.filter(t => t.type === "good").slice(0, 3).map((tip, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "100%", background: "var(--color-sage-light)", border: "1px solid rgba(90,122,92,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                      <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="var(--color-sage-dark)" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p style={{ fontSize: "0.82rem", margin: 0, color: "var(--color-espresso)" }}>{tip.tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleOptimize}
              className="btn-primary"
              style={{ width: "100%", padding: "0.875rem", fontSize: "0.78rem" }}
              disabled={!!optimizationProgress && optimizationProgress.step !== "error"}
            >
              {optimizationProgress && optimizationProgress.step !== "error" ? (
                <>
                  <div className="spinner spinner-light" style={{ width: 14, height: 14 }} />
                  {optimizationProgress.message}
                </>
              ) : (
                "Update Resume & Re-Analyze"
              )}
            </button>
            {optimizationProgress?.step === "error" && (
              <p style={{ fontSize: "0.78rem", color: "var(--color-clay)", textAlign: "center", margin: 0 }}>
                {optimizationProgress.message}
                <button onClick={() => setOptimizationProgress(null)} style={{ marginLeft: "0.5rem", background: "none", border: "none", cursor: "pointer", color: "var(--color-espresso)", textDecoration: "underline", fontFamily: "var(--font-sans)", fontSize: "inherit" }}>
                  Retry
                </button>
              </p>
            )}
          </div>

          {/* ── RIGHT: Job Description & ATS ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="card anim-fade-up" style={{ padding: "2rem" }}>
              <span className="section-label">Job Description</span>
              <div style={{ marginTop: "0.5rem" }}>
                {companyInfo.title && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4 style={{ fontSize: "1rem", fontFamily: "var(--font-serif)", fontWeight: 500 }}>
                      {companyInfo.title}
                    </h4>
                    {companyInfo.name && (
                      <p style={{ fontSize: "0.85rem", color: "var(--color-stone)", marginTop: "0.2rem" }}>
                        {companyInfo.name}
                      </p>
                    )}
                  </div>
                )}

                {jobDescription ? (
                  <div>
                    <h4 style={{ fontSize: "0.8rem", marginBottom: "0.75rem" }}>Responsibilities</h4>
                    {jobDescription.split("\n").filter(l => l.trim()).slice(0, 8).map((line, i) => (
                      <p key={i} style={{
                        fontSize: "0.85rem",
                        color: "var(--color-brown)",
                        lineHeight: 1.65,
                        paddingLeft: "0.875rem",
                        position: "relative",
                        marginBottom: "0.4rem",
                      }}>
                        <span style={{ position: "absolute", left: 0 }}>·</span>
                        {line.replace(/^[•\-\*]\s*/, "")}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.88rem", color: "var(--color-stone-light)", fontStyle: "italic" }}>
                    No job description provided. Add one for a more accurate match score.
                  </p>
                )}
              </div>
            </div>

            {/* ATS tips */}
            <div className="anim-fade-up anim-delay-1">
              <ATS score={feedback.ATS?.score ?? 0} suggestions={feedback.ATS?.tips ?? []} />
            </div>
          </div>
        </div>
      )}

      {/* ── Full analysis sections ── */}
      {!optimizationResult && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem 5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <Summary feedback={feedback} />
          <Details feedback={feedback} />

          {resumeText && (
            <SectionRewriter
              resumeText={resumeText}
              jobTitle={companyInfo.title}
              jobDescription={jobDescription}
            />
          )}
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(184,168,152,0.2)",
        padding: "1.75rem 2.5rem",
        textAlign: "center",
      }}>
        <span style={{
          fontFamily: "var(--font-serif)",
          fontSize: "0.9rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--color-stone-light)",
        }}>
          Resumate
        </span>
      </footer>

      {/* Paywall */}
      {showPaywall && (
        <PaywallModal
          feature="auto-optimize"
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            loadCredits();
            setShowPaywall(false);
            setTimeout(() => handleOptimize(), 0);
          }}
          userName={user?.displayName || user?.email || ""}
          userEmail={user?.email || ""}
        />
      )}
    </div>
  );
};

export default Resume;
