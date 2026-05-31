import ScoreCircle from "./ScoreCircle";

const ATS = ({ score, suggestions }: { score: number; suggestions: { type: "good" | "improve"; tip: string }[] }) => {
  const label = score > 69 ? "Excellent" : score > 49 ? "Fair" : "Needs Improvement";
  const scoreColor = score > 69 ? "var(--color-sage-dark)" : score > 49 ? "var(--color-amber)" : "var(--color-clay)";
  const scoreBg = score > 69 ? "var(--color-sage-light)" : score > 49 ? "var(--color-amber-light)" : "var(--color-clay-light)";

  return (
    <div className="card-elevated" style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "2rem",
        flexWrap: "wrap",
        marginBottom: "2rem",
      }}>
        <div style={{ flex: 1 }}>
          <span className="section-label">ATS Compatibility</span>
          <h3 style={{ fontSize: "1.5rem", marginTop: "0.25rem" }}>Applicant Tracking Score</h3>
          <p style={{ marginTop: "0.5rem", maxWidth: 420 }}>
            How well your résumé ranks with automated screening systems.
          </p>
        </div>

        {/* Score display */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.625rem" }}>
          <ScoreCircle score={score} size="md" />
          <span style={{
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: scoreColor,
            background: scoreBg,
            padding: "0.25rem 0.75rem",
            borderRadius: "100px",
            border: "none",
          }}>
            {label}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* Findings */}
      <div>
        <span className="section-label">Key Findings</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{
              display: "flex",
              gap: "0.875rem",
              alignItems: "flex-start",
              padding: "1rem 1.125rem",
              background: s.type === "good" ? "var(--color-sage-light)" : "var(--color-ivory-warm)",
              borderRadius: "0.875rem",
              border: `1px solid ${s.type === "good" ? "rgba(90,122,92,0.15)" : "rgba(184,168,152,0.3)"}`,
            }}>
              <div style={{
                width: 22, height: 22,
                borderRadius: "100%",
                flexShrink: 0,
                marginTop: "0.15rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: s.type === "good" ? "var(--color-sage)" : "var(--color-amber)",
                color: "#fff",
              }}>
                {s.type === "good" ? (
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
                  </svg>
                )}
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-espresso)", lineHeight: 1.65 }}>
                {s.tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ATS;
