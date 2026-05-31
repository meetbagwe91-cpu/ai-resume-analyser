interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  resumeCount: number;
  userName?: string | null;
}

const TABS = [
  { id: "overview",     label: "Dashboard" },
  { id: "resumes",      label: "Resume" },
  { id: "job-matching", label: "Jobs" },
  { id: "profile",      label: "Profile" },
  { id: "performance",  label: "Performance" },
  { id: "history",      label: "History" },
  { id: "templates",    label: "Templates" },
  { id: "plans",        label: "Credits & Plans" },
  { id: "security",     label: "Security" },
];

const DashboardTabs = ({ activeTab, onTabChange, resumeCount, userName }: DashboardTabsProps) => {
  return (
    <div style={{
      display: "flex",
      gap: "0.25rem",
      overflowX: "auto",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      padding: "0.5rem 0",
      borderBottom: "1px solid rgba(184,168,152,0.2)",
    }}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        const displayLabel = tab.id === "overview" && userName ? `${userName}'s Dashboard` : tab.label;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.6rem 1.125rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontFamily: "var(--font-sans)",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--color-espresso)" : "var(--color-stone)",
              background: isActive ? "var(--color-ivory-warm)" : "transparent",
              transition: "color 0.2s ease, background 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.color = "var(--color-espresso)";
                e.currentTarget.style.background = "rgba(240, 235, 225, 0.4)";
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.color = "var(--color-stone)";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {displayLabel}
            {tab.id === "resumes" && resumeCount > 0 && (
              <span style={{
                background: isActive ? "var(--color-espresso)" : "rgba(184,168,152,0.3)",
                color: isActive ? "var(--color-ivory)" : "var(--color-stone)",
                borderRadius: "100px",
                padding: "0 0.4rem",
                fontSize: "0.65rem",
                fontWeight: 600,
                lineHeight: "1.5",
              }}>
                {resumeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default DashboardTabs;
