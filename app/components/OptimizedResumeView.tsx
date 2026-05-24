import { useRef, useState } from "react";
import { exportToPDF } from "~/lib/pdf-export";
import ResumeTemplate from "./ResumeTemplate";
import DiagnosisCard from "./DiagnosisCard";

interface OptimizedResumeViewProps {
  optimization: ResumeOptimization;
  jobTitle: string;
}

const OptimizedResumeView = ({ optimization, jobTitle }: OptimizedResumeViewProps) => {
  const templateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"optimized" | "diagnosis" | "changelog">("optimized");

  const handleDownload = async () => {
    if (!templateRef.current) return;
    setIsExporting(true);
    try {
      await exportToPDF(templateRef.current, `optimized-resume-${Date.now()}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  const { diagnosis, optimized } = optimization;

  return (
    <div className="anim-fade-up" style={{ marginTop: "3rem" }}>
      {/* ── Section Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <span className="section-label">Auto-Optimize Complete</span>
          <h2 style={{ margin: "0.5rem 0 0", fontSize: "2rem" }}>Your Optimized Résumé</h2>
          <p style={{ margin: "0.5rem 0 0", color: "var(--color-stone)", fontSize: "0.9rem" }}>
            Estimated new ATS score: <strong style={{ color: "var(--color-sage)", fontSize: "1.1rem" }}>{optimized.atsScoreEstimate}/100</strong>
            {" "}· {optimized.changeLog?.length ?? 0} improvements made · Click any text to edit before downloading.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="btn-primary"
          style={{ gap: "0.625rem", fontSize: "0.82rem" }}
        >
          {isExporting ? (
            <>
              <div style={{ width: 14, height: 14, borderRadius: "100%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.9s linear infinite" }} />
              Exporting…
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Optimized PDF
            </>
          )}
        </button>
      </div>

      {/* ── Tab Nav ── */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "2rem", background: "rgba(196,181,160,0.15)", borderRadius: "1rem", padding: "0.3rem", width: "fit-content" }}>
        {(["optimized", "diagnosis", "changelog"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.75rem",
              border: "none",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              letterSpacing: "0.05em",
              transition: "all 0.18s ease",
              background: activeTab === tab ? "var(--color-parchment)" : "transparent",
              color: activeTab === tab ? "var(--color-espresso)" : "var(--color-stone)",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(44,35,24,0.08)" : "none",
            }}
          >
            {{ optimized: "Optimized Résumé", diagnosis: "Diagnosis", changelog: "Change Log" }[tab]}
          </button>
        ))}
      </div>

      {/* ── OPTIMIZED TAB ── */}
      {activeTab === "optimized" && (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{ padding: "0.3rem 0.875rem", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--color-sage-light)", color: "var(--color-sage)" }}>After</span>
            <span style={{ fontSize: "0.85rem", color: "var(--color-stone)" }}>AI-optimized · click to edit</span>
          </div>
          <div style={{ borderRadius: "1.5rem", overflow: "hidden", border: "1px solid rgba(123,155,126,0.3)", boxShadow: "0 4px 20px rgba(44,35,24,0.08)", background: "#fff" }}>
            <ResumeTemplate ref={templateRef} data={optimized.parsed} theme={optimized.theme} editable />
          </div>
        </div>
      )}

      {/* ── DIAGNOSIS TAB ── */}
      {activeTab === "diagnosis" && (
        <DiagnosisCard diagnosis={diagnosis} />
      )}

      {/* ── CHANGELOG TAB ── */}
      {activeTab === "changelog" && (
        <div className="card-elevated" style={{ padding: "2.5rem" }}>
          <span className="section-label">What Changed</span>
          <h3 style={{ margin: "0.5rem 0 2rem" }}>{optimized.changeLog?.length ?? 0} Improvements Made</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "2.5rem" }}>
            {optimized.changeLog?.map((entry, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", padding: "1rem 1.25rem", background: "var(--color-cream-warm)", borderRadius: "1rem", border: "1px solid rgba(196,181,160,0.25)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "100%", background: "var(--color-sage-light)", color: "var(--color-sage)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem", fontWeight: 700 }}>
                  {i + 1}
                </div>
                <div>
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-stone)", fontWeight: 600 }}>{entry.section}</p>
                  <p style={{ margin: "0 0 0.25rem", fontWeight: 600, fontSize: "0.9rem", color: "var(--color-espresso)" }}>{entry.change}</p>
                  <p style={{ margin: 0, fontSize: "0.83rem", color: "var(--color-stone)", fontStyle: "italic" }}>{entry.reason}</p>
                </div>
              </div>
            ))}
          </div>

          {optimized.suggestedAdditions?.length > 0 && (
            <>
              <div className="divider" />
              <h3 style={{ margin: "1.75rem 0 1.25rem", fontSize: "1.2rem" }}>💡 Suggested Additions</h3>
              <p style={{ margin: "0 0 1.25rem", fontSize: "0.87rem", color: "var(--color-stone)" }}>The AI thinks these would strengthen your résumé — <strong>add them only if accurate.</strong></p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {optimized.suggestedAdditions.map((s, i) => (
                  <div key={i} style={{ padding: "1rem 1.25rem", background: "var(--color-amber-light)", borderRadius: "1rem", border: "1px solid rgba(184,137,42,0.2)" }}>
                    <p style={{ margin: "0 0 0.25rem", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-amber-warm)", fontWeight: 600 }}>{s.section}</p>
                    <p style={{ margin: "0 0 0.25rem", fontWeight: 600, fontSize: "0.9rem", color: "var(--color-espresso)" }}>{s.suggestion}</p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-brown-mid)", fontStyle: "italic" }}>⚠ {s.note}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizedResumeView;
