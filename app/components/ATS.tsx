import ScoreCircle from "./ScoreCircle";

const ATS = ({ score, suggestions }: { score: number; suggestions: { type: "good" | "improve"; tip: string }[] }) => {
  const scoreColor = score > 69 ? "var(--color-sage)" : score > 49 ? "var(--color-amber-warm)" : "var(--color-clay)";
  const scoreBg = score > 69 ? "var(--color-sage-light)" : score > 49 ? "var(--color-amber-light)" : "var(--color-clay-light)";
  const label = score > 69 ? "Excellent" : score > 49 ? "Fair" : "Needs Improvement";

  return (
    <div className="card-elevated" style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <div>
          <span className="section-label">ATS Compatibility</span>
          <h3 style={{ margin: 0, fontSize: "1.6rem" }}>Applicant Tracking Score</h3>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>How well your résumé ranks with automated screening systems.</p>
        </div>
        {/* Score visual */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <ScoreCircle score={score} />
          <span style={{
            fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
            color: scoreColor, background: scoreBg, padding: "0.3rem 0.875rem", borderRadius: "100px"
          }}>{label}</span>
        </div>
      </div>

      <div className="divider" style={{ margin: "1.5rem 0" }} />

      {/* Findings */}
      <div>
        <span className="section-label">Key Findings</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: "0.875rem", alignItems: "flex-start",
              padding: "1rem 1.25rem",
              background: s.type === "good" ? "var(--color-sage-light)" : "var(--color-cream-warm)",
              borderRadius: "1rem",
              border: `1px solid ${s.type === "good" ? "rgba(123,155,126,0.15)" : "rgba(196,181,160,0.3)"}`,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "100%", flexShrink: 0, marginTop: "0.15rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: s.type === "good" ? "var(--color-sage)" : "var(--color-amber-warm)",
                color: "#fff"
              }}>
                {s.type === "good" ? (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" /></svg>
                )}
              </div>
              <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--color-espresso)", lineHeight: 1.6 }}>{s.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ATS;
