interface PerformanceTimelineProps {
  resumes: Resume[];
}

const PerformanceTimeline = ({ resumes }: PerformanceTimelineProps) => {
  // Build data points from resumes sorted by date (oldest first for the chart)
  const dataPoints = resumes
    .filter(r => r.createdAt && r.feedback?.overallScore != null)
    .map(r => ({
      id: r.id,
      date: new Date(r.createdAt!),
      score: r.feedback?.overallScore ?? 0,
      atsScore: r.feedback?.ATS?.score ?? 0,
      label: `${r.companyName || "Analysis"} · ${r.jobTitle || "Role"}`,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (dataPoints.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--color-stone)" }}>
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="var(--color-taupe)" strokeWidth={1.2} style={{ margin: "0 auto 1rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.2rem" }}>No performance data yet</p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>Upload and analyze résumés to see your score progression here.</p>
      </div>
    );
  }

  // Chart dimensions
  const W = 700, H = 280;
  const PAD = { top: 30, right: 30, bottom: 50, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minScore = Math.max(0, Math.min(...dataPoints.map(d => d.score)) - 10);
  const maxScore = Math.min(100, Math.max(...dataPoints.map(d => d.score)) + 10);
  const scoreRange = maxScore - minScore || 1;

  const getX = (i: number) => PAD.left + (dataPoints.length === 1 ? chartW / 2 : (i / (dataPoints.length - 1)) * chartW);
  const getY = (score: number) => PAD.top + chartH - ((score - minScore) / scoreRange) * chartH;

  // Build path
  const pathD = dataPoints.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.score)}`).join(" ");
  // Area fill path
  const areaD = `${pathD} L ${getX(dataPoints.length - 1)} ${PAD.top + chartH} L ${getX(0)} ${PAD.top + chartH} Z`;

  // Y-axis labels
  const yLabels = Array.from({ length: 5 }, (_, i) => Math.round(minScore + (scoreRange * i) / 4));

  // Score color
  const getColor = (score: number) => score >= 75 ? "var(--color-sage)" : score >= 50 ? "var(--color-amber-warm)" : "var(--color-clay)";

  // Summary stats
  const latestScore = dataPoints[dataPoints.length - 1]?.score ?? 0;
  const firstScore = dataPoints[0]?.score ?? 0;
  const improvement = latestScore - firstScore;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        <div style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: "rgba(250,247,242,0.8)", border: "1px solid rgba(196,181,160,0.2)" }}>
          <p style={{ margin: 0, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-stone)" }}>Latest Score</p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "1.6rem", fontWeight: 600, fontFamily: "var(--font-serif)", color: getColor(latestScore) }}>{latestScore}</p>
        </div>
        <div style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: "rgba(250,247,242,0.8)", border: "1px solid rgba(196,181,160,0.2)" }}>
          <p style={{ margin: 0, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-stone)" }}>Analyses</p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "1.6rem", fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--color-espresso)" }}>{dataPoints.length}</p>
        </div>
        <div style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: "rgba(250,247,242,0.8)", border: "1px solid rgba(196,181,160,0.2)" }}>
          <p style={{ margin: 0, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-stone)" }}>Net Change</p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "1.6rem", fontWeight: 600, fontFamily: "var(--font-serif)", color: improvement >= 0 ? "var(--color-sage)" : "var(--color-clay)" }}>
            {improvement >= 0 ? "+" : ""}{improvement}
          </p>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{
        borderRadius: "1.5rem", background: "rgba(250,247,242,0.85)",
        border: "1px solid rgba(196,181,160,0.2)", padding: "1.5rem",
        overflow: "hidden",
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
          {/* Grid lines */}
          {yLabels.map((val, i) => (
            <g key={i}>
              <line
                x1={PAD.left} y1={getY(val)} x2={W - PAD.right} y2={getY(val)}
                stroke="rgba(196,181,160,0.2)" strokeDasharray="4 4"
              />
              <text x={PAD.left - 10} y={getY(val) + 4} textAnchor="end"
                fill="var(--color-stone-light)" fontSize="10" fontFamily="var(--font-sans)">
                {val}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGrad)" opacity={0.4} />

          {/* Line */}
          <path d={pathD} fill="none" stroke="var(--color-olive)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots + labels */}
          {dataPoints.map((d, i) => (
            <g key={d.id}>
              <circle cx={getX(i)} cy={getY(d.score)} r={5} fill="var(--color-parchment)" stroke="var(--color-olive)" strokeWidth={2.5} />
              <text x={getX(i)} y={getY(d.score) - 12} textAnchor="middle"
                fill="var(--color-espresso)" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)">
                {d.score}
              </text>
              {/* Date labels */}
              <text x={getX(i)} y={H - 10} textAnchor="middle"
                fill="var(--color-stone-light)" fontSize="9" fontFamily="var(--font-sans)">
                {d.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </text>
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-olive)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-olive)" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Individual Scores List */}
      <div>
        <span className="section-label">Score Breakdown by Analysis</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
          {[...dataPoints].reverse().map((d, i) => (
            <div key={d.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem 1rem", borderRadius: "0.875rem",
              background: "rgba(250,247,242,0.6)", border: "1px solid rgba(196,181,160,0.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-stone-light)", width: "1.5rem" }}>#{dataPoints.length - i}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 500, color: "var(--color-espresso)" }}>{d.label}</p>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--color-stone-light)" }}>
                    {d.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--color-stone)" }}>ATS: {d.atsScore}</span>
                <span style={{
                  fontSize: "0.85rem", fontWeight: 700, color: getColor(d.score),
                  padding: "0.2rem 0.625rem", borderRadius: "100px",
                  background: d.score >= 75 ? "var(--color-sage-light)" : d.score >= 50 ? "var(--color-amber-light)" : "var(--color-clay-light)",
                }}>
                  {d.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTimeline;
