import { useEffect, useState } from "react";

const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const [animated, setAnimated] = useState(false);
  const r = 38;
  const strokeW = 5;
  const nr = r - strokeW / 2;
  const circ = 2 * Math.PI * nr;
  const offset = circ * (1 - (animated ? score / 100 : 0));

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const color = score > 69 ? "var(--color-sage)" : score > 49 ? "var(--color-amber-warm)" : "var(--color-clay)";

  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={nr} stroke="rgba(196,181,160,0.25)" strokeWidth={strokeW} fill="none" />
        <circle
          cx="50" cy="50" r={nr}
          stroke={color}
          strokeWidth={strokeW}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: "1.3rem", color: "var(--color-espresso)", lineHeight: 1 }}>{score}</span>
      </div>
    </div>
  );
};

export default ScoreCircle;
