import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";

type CategoryRowProps = { title: string; score: number; icon: React.ReactNode };

const CategoryRow = ({ title, score, icon }: CategoryRowProps) => {
  const barColor = score > 69 ? "var(--color-sage)" : score > 49 ? "var(--color-amber-warm)" : "var(--color-clay)";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "1.25rem",
      padding: "1.125rem 1.5rem",
      background: "var(--color-parchment)",
      borderRadius: "1.25rem",
      border: "1px solid rgba(196,181,160,0.2)",
      transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "var(--color-cream-warm)"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 4px 16px rgba(44,35,24,0.06)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "var(--color-parchment)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
    >
      {/* Icon */}
      <div style={{
        width: 38, height: 38, borderRadius: "0.75rem", flexShrink: 0,
        background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brown-mid)"
      }}>{icon}</div>

      {/* Title & bar */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 500, color: "var(--color-espresso)", fontSize: "0.95rem", lineHeight: 1 }}>{title}</p>
        <div style={{ marginTop: "0.5rem", height: 4, background: "rgba(196,181,160,0.25)", borderRadius: "100px", overflow: "hidden" }}>
          <div style={{ width: `${score}%`, height: "100%", background: barColor, borderRadius: "100px", transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
        </div>
      </div>

      {/* Score & badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexShrink: 0 }}>
        <ScoreBadge score={score} />
        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: "1.35rem", color: "var(--color-espresso)", minWidth: "2.5rem", textAlign: "right" }}>{score}</span>
      </div>
    </div>
  );
};

const iconStyle = { width: 18, height: 18 };
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5 } as React.SVGProps<SVGSVGElement>;

const Summary = ({ feedback }: { feedback: Feedback }) => (
  <div className="card-elevated" style={{ padding: "2.5rem" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Header + Gauge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap" }}>
        <div>
          <span className="section-label">Overall Score</span>
          <h3 style={{ margin: 0, fontSize: "1.6rem" }}>Analysis Breakdown</h3>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", maxWidth: 340 }}>Your résumé scored across four critical dimensions of quality.</p>
        </div>
        <div style={{ background: "var(--color-cream-warm)", borderRadius: "1.5rem", padding: "1.5rem 2rem", border: "1px solid rgba(196,181,160,0.25)" }}>
          <ScoreGauge score={feedback.overallScore} />
        </div>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* Category Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        <CategoryRow title="Tone & Style" score={feedback.toneAndStyle.score}
          icon={<svg style={iconStyle} viewBox="0 0 24 24" {...stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
        />
        <CategoryRow title="Content Strength" score={feedback.content.score}
          icon={<svg style={iconStyle} viewBox="0 0 24 24" {...stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <CategoryRow title="Structure & Format" score={feedback.structure.score}
          icon={<svg style={iconStyle} viewBox="0 0 24 24" {...stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
        />
        <CategoryRow title="Skills Matching" score={feedback.skills.score}
          icon={<svg style={iconStyle} viewBox="0 0 24 24" {...stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
      </div>
    </div>
  </div>
);

export default Summary;
