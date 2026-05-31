import { useRef, useState } from "react";
import { exportToPDF, logDownload } from "~/lib/pdf-export";
import { exportToDOCX } from "~/lib/docx-export";
import { exportToTXT, exportToJSON } from "~/lib/text-export";
import ResumeTemplate from "./ResumeTemplate";
import DiagnosisCard from "./DiagnosisCard";

interface OptimizedResumeViewProps {
  optimization: ResumeOptimization;
  originalImageUrl?: string;
  resumeId?: string;
  jobTitle: string;
}

const OptimizedResumeView = ({ optimization, jobTitle, resumeId }: OptimizedResumeViewProps) => {
  const templateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"pdf" | "docx" | "txt" | "json" | null>(null);
  const [activeTab, setActiveTab] = useState<"optimized" | "diagnosis" | "changelog">("optimized");
  const [versionSaved, setVersionSaved] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);

  const handleDownloadPDF = async () => {
    if (!templateRef.current) return;
    setIsExporting(true);
    setExportType("pdf");
    try {
      const filename = `optimized-resume-${Date.now()}.pdf`;
      await exportToPDF(templateRef.current, filename);
      if (resumeId) logDownload(resumeId, filename);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleDownloadDOCX = async () => {
    setIsExporting(true);
    setExportType("docx");
    try {
      const filename = `optimized-resume-${Date.now()}.docx`;
      await exportToDOCX(optimization.optimized.parsed, filename);
      if (resumeId) logDownload(resumeId, filename);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleDownloadTXT = () => {
    setIsExporting(true);
    setExportType("txt");
    try {
      const filename = `optimized-resume-${Date.now()}.txt`;
      exportToTXT(optimization.optimized.parsed, filename);
      if (resumeId) logDownload(resumeId, filename);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleDownloadJSON = () => {
    setIsExporting(true);
    setExportType("json");
    try {
      const filename = `optimized-resume-${Date.now()}.json`;
      exportToJSON(optimization, filename);
      if (resumeId) logDownload(resumeId, filename);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleSaveVersion = async () => {
    if (!resumeId || versionSaved) return;
    setSavingVersion(true);
    try {
      const { db } = await import("~/lib/firebase");
      const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");
      const version: ResumeVersion = {
        versionId: `v_${Date.now()}`,
        createdAt: new Date().toISOString(),
        atsScore: optimization.optimized.atsScoreEstimate,
        changesSummary: `${optimization.optimized.changeLog?.length ?? 0} improvements · Score: ${optimization.optimized.atsScoreEstimate}/100`,
        optimizationData: optimization.optimized,
      };
      await updateDoc(doc(db, "resumes", resumeId), {
        optimization,
        versions: arrayUnion(version),
      });
      setVersionSaved(true);
    } catch (e) {
      console.error("Failed to save version:", e);
    }
    setSavingVersion(false);
  };

  const { diagnosis, optimized } = optimization;

  return (
    <div className="anim-fade-up" style={{ marginTop: "3rem" }}>
      {/* ── Section Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <span className="section-label">Auto-Optimize Complete</span>
          <h2 style={{ margin: "0.5rem 0 0", fontSize: "2rem" }}>Your Optimized Résumé</h2>
          <p style={{ margin: "0.5rem 0 0", color: "var(--color-stone)", fontSize: "0.9rem" }}>
            Estimated new ATS score: <strong style={{ color: "var(--color-sage)", fontSize: "1.1rem" }}>{optimized.atsScoreEstimate}/100</strong>
            {" "}· {optimized.changeLog?.length ?? 0} improvements made · Click any text to edit before downloading.
          </p>
        </div>

        {/* ── Export panel ── */}
        <div style={{
          background: "var(--color-ivory-warm)",
          border: "1px solid rgba(184,168,152,0.3)",
          borderRadius: "1.25rem",
          padding: "1.125rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          minWidth: 230,
        }}>
          <p style={{ margin: 0, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-stone)", fontWeight: 600 }}>Download As</p>

          {/* Row 1: formatted exports */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              id="download-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="btn-primary"
              style={{ flex: 1, gap: "0.4rem", fontSize: "0.76rem", padding: "0.6rem 0.875rem", justifyContent: "center" }}
              title="Download as PDF — styled and print-ready"
            >
              {isExporting && exportType === "pdf" ? (
                <div style={{ width: 12, height: 12, borderRadius: "100%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.9s linear infinite" }} />
              ) : (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              )}
              PDF
            </button>
            <button
              id="download-docx-btn"
              onClick={handleDownloadDOCX}
              disabled={isExporting}
              className="btn-secondary"
              style={{ flex: 1, gap: "0.4rem", fontSize: "0.76rem", padding: "0.6rem 0.875rem", justifyContent: "center" }}
              title="Download as Word document (.docx)"
            >
              {isExporting && exportType === "docx" ? (
                <div style={{ width: 12, height: 12, borderRadius: "100%", border: "2px solid rgba(168,152,128,0.3)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
              ) : (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              )}
              DOCX
            </button>
          </div>

          {/* Row 2: raw/plain exports */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              id="download-txt-btn"
              onClick={handleDownloadTXT}
              disabled={isExporting}
              className="btn-secondary"
              style={{ flex: 1, gap: "0.4rem", fontSize: "0.76rem", padding: "0.6rem 0.875rem", justifyContent: "center" }}
              title="Plain text — as-is AI output, clean formatting"
            >
              {isExporting && exportType === "txt" ? (
                <div style={{ width: 12, height: 12, borderRadius: "100%", border: "2px solid rgba(168,152,128,0.3)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
              ) : (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
              )}
              TXT
            </button>
            <button
              id="download-json-btn"
              onClick={handleDownloadJSON}
              disabled={isExporting}
              className="btn-secondary"
              style={{ flex: 1, gap: "0.4rem", fontSize: "0.76rem", padding: "0.6rem 0.875rem", justifyContent: "center" }}
              title="Raw JSON — full AI output with changelog and score"
            >
              {isExporting && exportType === "json" ? (
                <div style={{ width: 12, height: 12, borderRadius: "100%", border: "2px solid rgba(168,152,128,0.3)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
              ) : (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              )}
              JSON
            </button>
          </div>

          <div style={{ height: 1, background: "rgba(184,168,152,0.2)" }} />

          {/* Save version */}
          <button
            onClick={handleSaveVersion}
            disabled={savingVersion || versionSaved}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
              background: "none", border: "none", cursor: versionSaved ? "default" : "pointer",
              fontSize: "0.72rem", color: versionSaved ? "var(--color-sage)" : "var(--color-stone)",
              fontFamily: "var(--font-sans)", fontWeight: 500,
              textDecoration: versionSaved ? "none" : "underline", textUnderlineOffset: "2px",
              padding: "0.125rem 0",
            }}
          >
            {savingVersion ? (
              <>
                <div style={{ width: 10, height: 10, borderRadius: "100%", border: "1.5px solid var(--color-stone-light)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
                Saving…
              </>
            ) : versionSaved ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-sage)" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Version saved to history
              </>
            ) : (
              <>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                Save this version
              </>
            )}
          </button>
        </div>
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
          <div style={{ borderRadius: "1.5rem", overflowX: "auto", WebkitOverflowScrolling: "touch", border: "1px solid rgba(123,155,126,0.3)", boxShadow: "0 4px 20px rgba(44,35,24,0.08)", background: "#fff" }}>
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
        <div className="card-elevated" style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}>
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
