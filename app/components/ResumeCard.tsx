import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useState } from "react";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, optimization } }: { resume: Resume }) => {
  const [hover, setHover] = useState(false);

  // imagePath is now a direct Firebase Storage URL
  const url = imagePath || "";

  return (
    <Link
      to={`/resume/${id}`}
      style={{
        display: "flex", flexDirection: "column",
        width: "100%", maxWidth: 400,
        background: "var(--color-parchment)",
        borderRadius: "2rem",
        border: `1px solid ${hover ? "rgba(168,152,128,0.4)" : "rgba(196,181,160,0.22)"}`,
        boxShadow: hover ? "0 16px 40px rgba(44,35,24,0.09)" : "0 2px 12px rgba(44,35,24,0.04)",
        overflow: "hidden",
        textDecoration: "none",
        transform: hover ? "translateY(-6px)" : "translateY(0)",
        transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s, border-color 0.3s",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ padding: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Elegant Icon instead of image */}
          <div style={{ width: 44, height: 44, borderRadius: "100%", background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-taupe)", flexShrink: 0 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, color: "var(--color-espresso)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{companyName || "Analysis"}</p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--color-stone)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{jobTitle || "Role"}</p>
          </div>
        </div>
        <ScoreCircle score={feedback?.overallScore ?? optimization?.optimized?.atsScoreEstimate ?? 95} />
      </div>


    </Link>
  );
};

export default ResumeCard;
