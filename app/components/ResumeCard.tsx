import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useState } from "react";

interface ResumeCardProps {
  resume: Resume;
  onToggleFavorite?: (id: string, current: boolean) => void;
}

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, optimization, createdAt, isFavorite, versions, downloads }, onToggleFavorite }: ResumeCardProps) => {
  const [hover, setHover] = useState(false);

  const date = createdAt ? new Date(createdAt) : null;
  const versionCount = versions?.length ?? 0;
  const downloadCount = downloads?.length ?? 0;
  const score = feedback?.overallScore ?? optimization?.optimized?.atsScoreEstimate ?? 0;

  return (
    <div style={{ position: "relative" }}>
      {/* Favorite toggle */}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id, !!isFavorite); }}
          style={{
            position: "absolute", top: "0.875rem", right: "0.875rem", zIndex: 5,
            background: "none", border: "none", cursor: "pointer", padding: "0.25rem",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          title={isFavorite ? "Remove from saved" : "Save résumé"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={isFavorite ? "var(--color-amber-warm)" : "none"}
            stroke={isFavorite ? "var(--color-amber-warm)" : "var(--color-taupe)"}
            strokeWidth={2}
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      )}

      <Link
        to={`/resume/${id}`}
        style={{
          display: "flex", flexDirection: "column",
          width: "100%", maxWidth: 400,
          background: "var(--color-parchment)",
          borderRadius: "1.5rem",
          border: `1px solid ${hover ? "rgba(168,152,128,0.4)" : "rgba(196,181,160,0.22)"}`,
          boxShadow: hover ? "0 16px 40px rgba(44,35,24,0.09)" : "0 2px 12px rgba(44,35,24,0.04)",
          overflow: "hidden",
          textDecoration: "none",
          transform: hover ? "translateY(-4px)" : "translateY(0)",
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s, border-color 0.3s",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", minWidth: 0 }}>
            {/* Icon */}
            <div style={{ width: 40, height: 40, borderRadius: "0.875rem", background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-taupe)", flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 500, color: "var(--color-espresso)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{companyName || "Analysis"}</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "var(--color-stone)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{jobTitle || "Role"}</p>
            </div>
          </div>
          <ScoreCircle score={score} />
        </div>

        {/* Bottom meta bar */}
        <div style={{
          padding: "0.625rem 1.5rem", borderTop: "1px solid rgba(196,181,160,0.15)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(237,232,223,0.25)",
        }}>
          <span style={{ fontSize: "0.68rem", color: "var(--color-stone-light)" }}>
            {date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {versionCount > 0 && (
              <span style={{
                display: "flex", alignItems: "center", gap: "0.25rem",
                fontSize: "0.62rem", fontWeight: 600, color: "var(--color-amber-warm)",
                padding: "0.1rem 0.4rem", borderRadius: "100px",
                background: "var(--color-amber-light)",
              }}>
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {versionCount}
              </span>
            )}
            {downloadCount > 0 && (
              <span style={{
                display: "flex", alignItems: "center", gap: "0.25rem",
                fontSize: "0.62rem", fontWeight: 600, color: "var(--color-stone)",
                padding: "0.1rem 0.4rem", borderRadius: "100px",
                background: "rgba(196,181,160,0.2)",
              }}>
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloadCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ResumeCard;
