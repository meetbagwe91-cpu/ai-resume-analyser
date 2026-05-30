import { Link } from "react-router";
import { useState } from "react";

interface HistoryPanelProps {
  resumes: Resume[];
}

type HistoryFilter = "all" | "analyses" | "versions" | "downloads";

interface HistoryEvent {
  id: string;
  resumeId: string;
  type: "analysis" | "version" | "download";
  title: string;
  subtitle: string;
  date: Date;
  score?: number;
  icon: string;
}

const HistoryPanel = ({ resumes }: HistoryPanelProps) => {
  const [filter, setFilter] = useState<HistoryFilter>("all");

  // Build unified event timeline
  const events: HistoryEvent[] = [];

  resumes.forEach(r => {
    // Analysis events
    if (r.createdAt) {
      events.push({
        id: `analysis-${r.id}`,
        resumeId: r.id,
        type: "analysis",
        title: `${r.companyName || "Analysis"} · ${r.jobTitle || "Role"}`,
        subtitle: "Résumé analyzed",
        date: new Date(r.createdAt),
        score: r.feedback?.overallScore,
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      });
    }

    // Version events
    r.versions?.forEach(v => {
      events.push({
        id: `version-${v.versionId}`,
        resumeId: r.id,
        type: "version",
        title: `${r.companyName || "Résumé"} — Optimized`,
        subtitle: v.changesSummary || "AI optimization applied",
        date: new Date(v.createdAt),
        score: v.atsScore,
        icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
      });
    });

    // Download events
    r.downloads?.forEach((d, i) => {
      events.push({
        id: `download-${r.id}-${i}`,
        resumeId: r.id,
        type: "download",
        title: d.filename,
        subtitle: `Downloaded from ${r.companyName || "analysis"}`,
        date: new Date(d.downloadedAt),
        icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
      });
    });
  });

  // Sort newest first
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Apply filter
  const filtered = filter === "all" ? events : events.filter(e => {
    if (filter === "analyses") return e.type === "analysis";
    if (filter === "versions") return e.type === "version";
    if (filter === "downloads") return e.type === "download";
    return true;
  });

  // Group by date
  const grouped: Record<string, HistoryEvent[]> = {};
  filtered.forEach(e => {
    const key = e.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  const filterButtons: { id: HistoryFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: events.length },
    { id: "analyses", label: "Analyses", count: events.filter(e => e.type === "analysis").length },
    { id: "versions", label: "Versions", count: events.filter(e => e.type === "version").length },
    { id: "downloads", label: "Downloads", count: events.filter(e => e.type === "download").length },
  ];

  const typeColor = (type: string) => {
    switch (type) {
      case "analysis": return { bg: "var(--color-sage-light)", color: "var(--color-sage)" };
      case "version": return { bg: "var(--color-amber-light)", color: "var(--color-amber-warm)" };
      case "download": return { bg: "rgba(196,181,160,0.2)", color: "var(--color-brown-mid)" };
      default: return { bg: "var(--color-cream-warm)", color: "var(--color-stone)" };
    }
  };

  if (events.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--color-stone)" }}>
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="var(--color-taupe)" strokeWidth={1.2} style={{ margin: "0 auto 1rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.2rem" }}>No history yet</p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>Your analysis, optimization, and download history will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Filter bar */}
      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
        {filterButtons.map(fb => (
          <button
            key={fb.id}
            onClick={() => setFilter(fb.id)}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.45rem 0.875rem", borderRadius: "100px",
              border: "1px solid",
              borderColor: filter === fb.id ? "var(--color-olive)" : "rgba(196,181,160,0.3)",
              background: filter === fb.id ? "var(--color-olive)" : "transparent",
              color: filter === fb.id ? "#FAF7F2" : "var(--color-stone)",
              fontSize: "0.72rem", fontWeight: 500, fontFamily: "var(--font-sans)",
              letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            {fb.label}
            <span style={{
              fontSize: "0.62rem", fontWeight: 700,
              padding: "0.05rem 0.35rem", borderRadius: "100px",
              background: filter === fb.id ? "rgba(255,255,255,0.2)" : "rgba(196,181,160,0.2)",
            }}>
              {fb.count}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {Object.entries(grouped).map(([dateStr, groupEvents]) => (
          <div key={dateStr}>
            <p style={{
              margin: "0 0 0.75rem", fontSize: "0.68rem", fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--color-stone-light)",
            }}>
              {dateStr}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "2px solid rgba(196,181,160,0.2)", paddingLeft: "1.25rem", marginLeft: "0.5rem" }}>
              {groupEvents.map(ev => {
                const tc = typeColor(ev.type);
                return (
                  <Link
                    key={ev.id}
                    to={`/resume/${ev.resumeId}`}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.875rem",
                      padding: "0.875rem 1rem", borderRadius: "1rem",
                      background: "rgba(250,247,242,0.7)", border: "1px solid rgba(196,181,160,0.18)",
                      textDecoration: "none", transition: "all 0.2s ease", position: "relative",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(168,152,128,0.4)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,181,160,0.18)"; e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    {/* Timeline dot */}
                    <div style={{ position: "absolute", left: "-1.65rem", top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "100%", background: tc.color, border: "2px solid var(--color-parchment)" }} />

                    <div style={{
                      width: 32, height: 32, borderRadius: "0.625rem",
                      background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center",
                      color: tc.color, flexShrink: 0,
                    }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={ev.icon} />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 500, color: "var(--color-espresso)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ev.title}
                      </p>
                      <p style={{ margin: "0.1rem 0 0", fontSize: "0.7rem", color: "var(--color-stone-light)" }}>
                        {ev.subtitle} · {ev.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                    {ev.score != null && (
                      <span style={{
                        fontSize: "0.78rem", fontWeight: 700, color: tc.color,
                        padding: "0.15rem 0.5rem", borderRadius: "100px", background: tc.bg,
                      }}>
                        {ev.score}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
