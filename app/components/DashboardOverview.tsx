import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";

interface DashboardOverviewProps {
  resumes: Resume[];
  onToggleFavorite: (id: string, current: boolean) => void;
}

const DashboardOverview = ({ resumes, onToggleFavorite }: DashboardOverviewProps) => {
  const totalResumes = resumes.length;
  const avgScore = totalResumes > 0
    ? Math.round(resumes.reduce((sum, r) => sum + (r.feedback?.overallScore ?? r.optimization?.optimized?.atsScoreEstimate ?? 0), 0) / totalResumes)
    : 0;
  const totalDownloads = resumes.reduce((sum, r) => sum + (r.downloads?.length ?? 0), 0);
  const totalOptimizations = resumes.filter(r => r.optimization).length;
  const recentResumes = resumes.slice(0, 5);

  const scoreTrend = (() => {
    if (resumes.length < 2) return 0;
    const recent = resumes.slice(0, Math.min(3, resumes.length));
    const older = resumes.slice(Math.min(3, resumes.length), Math.min(6, resumes.length));
    if (older.length === 0) return 0;
    const recentAvg = recent.reduce((s, r) => s + (r.feedback?.overallScore ?? 0), 0) / recent.length;
    const olderAvg = older.reduce((s, r) => s + (r.feedback?.overallScore ?? 0), 0) / older.length;
    return Math.round(recentAvg - olderAvg);
  })();

  const stats = [
    {
      label: "Total Résumés",
      value: totalResumes,
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      label: "Avg. ATS Score",
      value: avgScore,
      suffix: "/100",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      label: "AI Optimized",
      value: totalOptimizations,
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      label: "Downloads",
      value: totalDownloads,
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* ── Stats grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {stats.map((stat, i) => (
          <div key={i} className={`card anim-fade-up anim-delay-${i + 1}`} style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}>
            <div style={{
              width: 38, height: 38,
              borderRadius: "0.875rem",
              background: "var(--color-ivory-warm)",
              border: "1px solid rgba(184,168,152,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-warm-mid)",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </div>
            <div>
              <p style={{
                margin: 0,
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "var(--color-espresso)",
                fontFamily: "var(--font-serif)",
                lineHeight: 1,
              }}>
                {stat.value}{stat.suffix || ""}
              </p>
              <p style={{
                margin: "0.2rem 0 0",
                fontSize: "0.68rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-stone)",
              }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Score trend banner ── */}
      {resumes.length >= 2 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.875rem 1.25rem",
          borderRadius: "0.875rem",
          background: scoreTrend >= 0 ? "var(--color-sage-light)" : "var(--color-clay-light)",
          border: `1px solid ${scoreTrend >= 0 ? "rgba(90,122,92,0.2)" : "rgba(168,92,74,0.2)"}`,
        }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
            stroke={scoreTrend >= 0 ? "var(--color-sage-dark)" : "var(--color-clay)"}
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d={scoreTrend >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
          </svg>
          <span style={{
            fontSize: "0.82rem",
            fontWeight: 500,
            color: scoreTrend >= 0 ? "var(--color-sage-dark)" : "var(--color-clay)",
          }}>
            {scoreTrend >= 0 ? "+" : ""}{scoreTrend} pts score trend across recent analyses
          </span>
        </div>
      )}

      {/* ── Recent Uploads ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem" }} className="overview-grid">
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span className="section-label" style={{ marginBottom: 0 }}>Recent Uploads</span>
            {totalResumes > 5 && (
              <span style={{ fontSize: "0.75rem", color: "var(--color-stone)", cursor: "pointer" }}>
                View all →
              </span>
            )}
          </div>

          {recentResumes.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {recentResumes.map((resume, i) => {
                const score = resume.feedback?.overallScore ?? resume.optimization?.optimized?.atsScoreEstimate ?? 0;
                const date = resume.createdAt ? new Date(resume.createdAt) : null;
                return (
                  <Link
                    key={resume.id}
                    to={`/resume/${resume.id}`}
                    className={`anim-fade-up anim-delay-${Math.min(i + 1, 5)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      padding: "0.875rem 1rem",
                      borderRadius: "0.875rem",
                      background: "var(--color-paper)",
                      border: "1px solid rgba(184,168,152,0.2)",
                      textDecoration: "none",
                      transition: "border-color 0.2s, transform 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(154,136,120,0.4)"; e.currentTarget.style.transform = "translateX(3px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(184,168,152,0.2)"; e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    {/* Doc icon */}
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: "0.625rem",
                      background: "var(--color-ivory-warm)",
                      border: "1px solid rgba(184,168,152,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--color-taupe)",
                      flexShrink: 0,
                    }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        color: "var(--color-espresso)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {resume.companyName || "Analysis"}
                        {resume.jobTitle && ` · ${resume.jobTitle}`}
                      </p>
                      <p style={{ margin: "0.1rem 0 0", fontSize: "0.7rem", color: "var(--color-stone-light)" }}>
                        {date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        {resume.versions && resume.versions.length > 0 && ` · ${resume.versions.length} version${resume.versions.length > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    {/* Score */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      {resume.isFavorite && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-amber)" stroke="none">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      )}
                      <ScoreCircle score={score} size="sm" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
              <p style={{ color: "var(--color-stone)", fontSize: "0.9rem", margin: "0 0 1rem" }}>No résumés uploaded yet.</p>
              <Link to="/upload" className="btn-primary" style={{ fontSize: "0.72rem", padding: "0.55rem 1.125rem" }}>
                Upload Your First Résumé
              </Link>
            </div>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <span className="section-label" style={{ display: "block", marginBottom: "1rem" }}>Quick Actions</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              to="/upload"
              style={{
                display: "flex", alignItems: "center", gap: "0.875rem",
                padding: "1.125rem 1.25rem", borderRadius: "0.875rem",
                background: "var(--color-espresso)", color: "var(--color-ivory)",
                textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(28,23,19,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "0.625rem", background: "rgba(245,240,232,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "inherit" }}>Upload PDF</p>
                <p style={{ margin: "0.1rem 0 0", fontSize: "0.7rem", opacity: 0.75, color: "inherit" }}>Analyze an existing résumé</p>
              </div>
            </Link>
            <Link
              to="/build"
              style={{
                display: "flex", alignItems: "center", gap: "0.875rem",
                padding: "1.125rem 1.25rem", borderRadius: "0.875rem",
                background: "var(--color-paper)", border: "1px solid rgba(184,168,152,0.35)",
                color: "var(--color-espresso)", textDecoration: "none", transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(154,136,120,0.5)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(184,168,152,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "0.625rem", background: "var(--color-ivory-warm)", border: "1px solid rgba(184,168,152,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-warm-mid)" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--color-espresso)" }}>Build with AI</p>
                <p style={{ margin: "0.1rem 0 0", fontSize: "0.7rem", color: "var(--color-stone)" }}>Create a résumé from scratch</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
