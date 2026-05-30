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
  const favoriteCount = resumes.filter(r => r.isFavorite).length;

  // Score trend: compare avg of last 3 vs prior 3
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
    { label: "Total Résumés", value: totalResumes, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "Avg. ATS Score", value: avgScore, suffix: "/100", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Optimized", value: totalOptimizations, icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { label: "Downloads", value: totalDownloads, icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ── Stats Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="anim-fade-up"
            style={{
              animationDelay: `${i * 0.08}s`,
              background: "rgba(250,247,242,0.85)",
              backdropFilter: "blur(12px)",
              borderRadius: "1.25rem",
              border: "1px solid rgba(196,181,160,0.25)",
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: "0.875rem",
              background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-olive)", flexShrink: 0,
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600, color: "var(--color-espresso)", fontFamily: "var(--font-serif)", lineHeight: 1 }}>
                {stat.value}{stat.suffix || ""}
              </p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-stone)", lineHeight: 1.3 }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Score Trend Banner ── */}
      {resumes.length >= 2 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.875rem 1.5rem", borderRadius: "1rem",
          background: scoreTrend >= 0 ? "var(--color-sage-light)" : "var(--color-clay-light)",
          border: `1px solid ${scoreTrend >= 0 ? "rgba(123,155,126,0.2)" : "rgba(168,92,74,0.2)"}`,
        }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={scoreTrend >= 0 ? "var(--color-sage)" : "var(--color-clay)"} strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={scoreTrend >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
          </svg>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: scoreTrend >= 0 ? "var(--color-sage)" : "var(--color-clay)" }}>
            {scoreTrend >= 0 ? "+" : ""}{scoreTrend} pts score trend across recent analyses
          </span>
        </div>
      )}

      {/* ── Recent Uploads ── */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {recentResumes.map((resume, i) => {
              const score = resume.feedback?.overallScore ?? resume.optimization?.optimized?.atsScoreEstimate ?? 0;
              const date = resume.createdAt ? new Date(resume.createdAt) : null;
              return (
                <Link
                  key={resume.id}
                  to={`/resume/${resume.id}`}
                  className="anim-fade-up"
                  style={{
                    animationDelay: `${0.3 + i * 0.06}s`,
                    display: "flex", alignItems: "center", gap: "1rem",
                    padding: "0.875rem 1.25rem", borderRadius: "1rem",
                    background: "rgba(250,247,242,0.7)", border: "1px solid rgba(196,181,160,0.2)",
                    textDecoration: "none", transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(168,152,128,0.4)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,181,160,0.2)"; e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: "0.75rem",
                    background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--color-taupe)", flexShrink: 0,
                  }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, color: "var(--color-espresso)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {resume.companyName || "Analysis"} · {resume.jobTitle || "Role"}
                    </p>
                    <p style={{ margin: "0.15rem 0 0", fontSize: "0.72rem", color: "var(--color-stone-light)" }}>
                      {date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      {resume.versions && resume.versions.length > 0 && ` · ${resume.versions.length} version${resume.versions.length > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {resume.isFavorite && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-amber-warm)" stroke="none">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                    <ScoreCircle score={score} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-stone)" }}>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>No résumés uploaded yet.</p>
            <Link to="/upload" className="btn-primary" style={{ marginTop: "1rem", fontSize: "0.75rem" }}>
              Upload Your First Résumé
            </Link>
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Link
          to="/upload"
          style={{
            display: "flex", alignItems: "center", gap: "0.875rem",
            padding: "1.25rem 1.5rem", borderRadius: "1.25rem",
            background: "var(--color-olive)", color: "#FAF7F2",
            textDecoration: "none", transition: "all 0.25s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(74,69,53,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <div>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em", color: "inherit" }}>Upload PDF</p>
            <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", opacity: 0.8, color: "inherit" }}>Analyze an existing résumé</p>
          </div>
        </Link>
        <Link
          to="/build"
          style={{
            display: "flex", alignItems: "center", gap: "0.875rem",
            padding: "1.25rem 1.5rem", borderRadius: "1.25rem",
            background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.35)",
            color: "var(--color-espresso)", textDecoration: "none", transition: "all 0.25s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(168,152,128,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(196,181,160,0.35)"; }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em", color: "var(--color-espresso)" }}>Build with AI</p>
            <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", color: "var(--color-stone)" }}>Create a résumé from scratch</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardOverview;
