import { useEffect, useRef, useState } from "react";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
  const [animated, setAnimated] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
    const t = setTimeout(() => setAnimated(true), 180);
    return () => clearTimeout(t);
  }, []);

  const color = score > 69 ? "var(--color-sage)" : score > 49 ? "var(--color-amber-warm)" : "var(--color-clay)";
  const progress = animated ? score / 100 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
      <div style={{ position: "relative", width: 200, height: 105 }}>
        <svg viewBox="0 0 200 105" style={{ width: "100%", height: "100%" }}>
          {/* Track */}
          <path d="M20,95 A80,80 0 0,1 180,95" fill="none" stroke="rgba(196,181,160,0.25)" strokeWidth="8" strokeLinecap="round" />
          {/* Filled arc */}
          <path
            ref={pathRef}
            d="M20,95 A80,80 0 0,1 180,95"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={len || 251}
            strokeDashoffset={(len || 251) * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        {/* Score number */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "0.25rem" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "3.25rem", fontWeight: 500, color: "var(--color-espresso)", lineHeight: 1 }}>{score}</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-stone)", marginTop: "0.25rem" }}>/100</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
