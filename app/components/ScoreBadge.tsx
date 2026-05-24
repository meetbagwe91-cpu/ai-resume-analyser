const ScoreBadge = ({ score }: { score: number }) => {
  const cls = score > 69 ? "score-pill score-pill-good" : score > 49 ? "score-pill score-pill-mid" : "score-pill score-pill-low";
  const label = score > 69 ? "Strong" : score > 49 ? "Good" : "Needs Work";
  return <span className={cls}>{label}</span>;
};

export default ScoreBadge;
