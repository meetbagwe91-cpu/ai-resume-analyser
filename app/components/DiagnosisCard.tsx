const priorityColor: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: "var(--color-clay-light)",   text: "var(--color-clay)",       border: "rgba(168,92,74,0.2)" },
  medium: { bg: "var(--color-amber-light)",  text: "var(--color-amber-warm)", border: "rgba(184,137,42,0.2)" },
  low:    { bg: "var(--color-sage-light)",   text: "var(--color-sage)",       border: "rgba(123,155,126,0.2)" },
};

const ReadinessBadge = ({ value }: { value: string }) => {
  const map: Record<string, { color: string; bg: string }> = {
    poor:      { color: "var(--color-clay)",       bg: "var(--color-clay-light)" },
    fair:      { color: "var(--color-amber-warm)", bg: "var(--color-amber-light)" },
    good:      { color: "var(--color-sage)",       bg: "var(--color-sage-light)" },
    excellent: { color: "var(--color-olive)",      bg: "rgba(74,69,53,0.1)" },
  };
  const style = map[value] ?? map.fair;
  return (
    <span style={{ padding: "0.3rem 0.875rem", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", background: style.bg, color: style.color }}>
      {value}
    </span>
  );
};

const DiagnosisCard = ({ diagnosis }: { diagnosis: DeepDiagnosis }) => (
  <div className="card-elevated" style={{ padding: "2.5rem" }}>
    <span className="section-label">Deep Diagnosis</span>

    {/* Header row */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
      <div>
        <h3 style={{ margin: 0, fontSize: "1.6rem" }}>AI Résumé Audit</h3>
        <p style={{ margin: "0.4rem 0 0", fontSize: "0.9rem" }}>Full diagnosis of every flaw before optimization.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-stone)" }}>Overall Readiness</span>
        <ReadinessBadge value={diagnosis.overallReadiness} />
      </div>
    </div>

    <div className="divider" style={{ margin: "0 0 2rem" }} />

    {/* Role Alignment Score */}
    <div style={{ marginBottom: "2rem" }}>
      <span className="section-label">Role Alignment</span>
      <div style={{ height: 8, background: "rgba(196,181,160,0.25)", borderRadius: "100px", overflow: "hidden", margin: "0.5rem 0" }}>
        <div style={{ width: `${diagnosis.roleAlignmentScore}%`, height: "100%", background: diagnosis.roleAlignmentScore > 69 ? "var(--color-sage)" : diagnosis.roleAlignmentScore > 49 ? "var(--color-amber-warm)" : "var(--color-clay)", borderRadius: "100px", transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--color-stone)", margin: "0.25rem 0 0" }}>{diagnosis.roleAlignmentScore}/100</p>
    </div>

    {/* Critical Issues */}
    {diagnosis.criticalIssues?.length > 0 && (
      <div style={{ marginBottom: "2rem" }}>
        <span className="section-label">Critical Issues ({diagnosis.criticalIssues.length})</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {diagnosis.criticalIssues.map((issue, i) => {
            const c = priorityColor[issue.priority] ?? priorityColor.medium;
            return (
              <div key={i} style={{ padding: "1rem 1.25rem", background: c.bg, borderRadius: "1rem", border: `1px solid ${c.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--color-espresso)" }}>{issue.category}</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: c.text }}>{issue.priority}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.87rem", color: "var(--color-brown-mid)" }}>{issue.issue}</p>
                {issue.impact && <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--color-stone)", fontStyle: "italic" }}>Impact: {issue.impact}</p>}
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* Keyword Overlap Analysis */}
    {(diagnosis.foundKeywords?.length > 0 || diagnosis.missingKeywords?.length > 0) && (
      <div style={{ marginBottom: "2rem" }}>
        <span className="section-label">Keyword Overlap Analysis</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {diagnosis.foundKeywords?.map((kw, i) => (
            <span key={`found-${i}`} style={{ padding: "0.3rem 0.875rem", background: "var(--color-sage-light)", color: "var(--color-sage-dark)", border: "1px solid rgba(123,155,126,0.2)", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 500 }}>
              ✓ {kw}
            </span>
          ))}
          {diagnosis.missingKeywords?.map((kw, i) => (
            <span key={`missing-${i}`} style={{ padding: "0.3rem 0.875rem", background: "var(--color-clay-light)", color: "var(--color-clay)", border: "1px solid rgba(168,92,74,0.2)", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 500 }}>
              ✗ {kw}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Job Title Recommendations */}
    {diagnosis.suggestedJobTitles?.length > 0 && (
      <div style={{ marginBottom: "2rem" }}>
        <span className="section-label">Recommended Job Titles</span>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--color-stone)" }}>Based on your core skills, your résumé is naturally suited for:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {diagnosis.suggestedJobTitles.map((title, i) => (
            <span key={`title-${i}`} style={{ padding: "0.4rem 1rem", background: "var(--color-cream-warm)", color: "var(--color-espresso)", border: "1px solid rgba(196,181,160,0.4)", borderRadius: "0.5rem", fontSize: "0.85rem", fontWeight: 500 }}>
              {title}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* ATS Warnings */}
    {diagnosis.atsWarnings?.length > 0 && (
      <div>
        <span className="section-label">ATS Warnings</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {diagnosis.atsWarnings.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem 1rem", background: "var(--color-cream-warm)", borderRadius: "0.875rem" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--color-amber-warm)" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: "0.1rem" }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              <p style={{ margin: 0, fontSize: "0.87rem", color: "var(--color-brown-mid)" }}>{w}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default DiagnosisCard;
