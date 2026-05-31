import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useState } from "react";

interface ResumeCardProps {
  resume: Resume;
  onToggleFavorite?: (id: string, current: boolean) => void;
}

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath, optimization, createdAt, isFavorite, versions, downloads },
  onToggleFavorite,
}: ResumeCardProps) => {
  const [hover, setHover] = useState(false);

  const date = createdAt ? new Date(createdAt) : null;
  const score = feedback?.overallScore ?? optimization?.optimized?.atsScoreEstimate ?? 0;
  const isOptimized = !!optimization;
  const dateStr = date
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  // Format the date label
  const now = new Date();
  const isToday = date && date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date && date.toDateString() === yesterday.toDateString();
  const relativeDate = isToday ? "Today" : isYesterday ? "Yesterday" : dateStr;

  return (
    <div style={{ position: "relative", height: "100%" }}>
      {/* Favorite star */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(id, !!isFavorite);
          }}
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
            fill={isFavorite ? "var(--color-amber)" : "none"}
            stroke={isFavorite ? "var(--color-amber)" : "rgba(184,168,152,0.7)"}
            strokeWidth={2}
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      )}

      <Link
        to={`/resume/${id}`}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "var(--color-paper)",
          borderRadius: "1.25rem",
          border: `1px solid ${hover ? "rgba(154,136,120,0.4)" : "rgba(184,168,152,0.25)"}`,
          boxShadow: hover
            ? "0 12px 36px rgba(28,23,19,0.1)"
            : "0 2px 12px rgba(28,23,19,0.05)",
          overflow: "hidden",
          textDecoration: "none",
          transform: hover ? "translateY(-3px)" : "translateY(0)",
          transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s, border-color 0.25s",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Thumbnail area — resume paper preview */}
        <div style={{
          height: 160,
          background: "var(--color-ivory-warm)",
          borderBottom: "1px solid rgba(184,168,152,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Paper lines decoration */}
          <div style={{
            width: "70%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            opacity: 0.4,
          }}>
            {[40, 85, 75, 90, 60, 80, 55, 70].map((w, i) => (
              <div key={i} style={{
                height: i === 0 ? 8 : 5,
                width: `${w}%`,
                borderRadius: "100px",
                background: i === 0 ? "var(--color-brown)" : "var(--color-taupe)",
              }} />
            ))}
          </div>

          {/* Status badge overlay */}
          <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem" }}>
            <span className={isOptimized ? "status-badge status-badge-optimized" : "status-badge status-badge-progress"}>
              {isOptimized ? "Optimized" : "Analyzed"}
            </span>
          </div>

          {/* Score circle — bottom right */}
          <div style={{ position: "absolute", bottom: "0.75rem", right: "0.75rem" }}>
            <ScoreCircle score={score} size="sm" />
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "1.125rem 1.25rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <p style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1rem",
            fontWeight: 500,
            color: "var(--color-espresso)",
            lineHeight: 1.3,
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {companyName ? `${jobTitle} — ${companyName}` : jobTitle || "Résumé Analysis"}
          </p>
          <p style={{
            fontSize: "0.75rem",
            color: "var(--color-stone)",
            margin: 0,
          }}>
            Last edited: {relativeDate ?? "—"}
          </p>
        </div>

        {/* CTA button strip */}
        <div style={{
          padding: "0.75rem 1.25rem",
          borderTop: "1px solid rgba(184,168,152,0.18)",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "0.55rem 1rem",
            borderRadius: "100px",
            border: "1px solid rgba(184,168,152,0.4)",
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-espresso)",
            background: hover ? "var(--color-ivory-warm)" : "transparent",
            transition: "background 0.2s",
          }}>
            {isOptimized ? "View" : "Edit"}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ResumeCard;
