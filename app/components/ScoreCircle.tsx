import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const ScoreCircle = ({ score = 0, size = "md" }: ScoreCircleProps) => {
  const [animated, setAnimated] = useState(false);

  // Size variants
  const dim = size === "lg" ? 160 : size === "sm" ? 72 : 88;
  const strokeW = size === "lg" ? 8 : size === "sm" ? 4 : 5;

  const r = dim / 2 - strokeW;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (animated ? score / 100 : 0));

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const color =
    score > 69 ? "var(--color-sage)" :
    score > 49 ? "var(--color-amber)" :
    "var(--color-clay)";

  const fontSize = size === "lg" ? "2.2rem" : size === "sm" ? "1rem" : "1.25rem";

  return (
    <div style={{ position: "relative", width: dim, height: dim, flexShrink: 0 }}>
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          stroke="rgba(184,168,152,0.2)"
          strokeWidth={strokeW}
          fill="none"
        />
        {/* Progress */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeW}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      {/* Center label */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 600,
          fontSize: fontSize,
          color: "var(--color-espresso)",
          lineHeight: 1,
        }}>
          {score}
        </span>
        {size === "lg" && (
          <span style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-stone)",
            marginTop: "0.25rem",
          }}>
            Match Score
          </span>
        )}
      </div>
    </div>
  );
};

export default ScoreCircle;
