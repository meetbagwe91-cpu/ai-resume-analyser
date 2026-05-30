import { useState } from "react";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  resumeCount: number;
}

const TABS = [
  { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "resumes", label: "All Résumés", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "job-matching", label: "Job Match", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id: "performance", label: "Performance", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "history", label: "History", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "templates", label: "Templates", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { id: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "security", label: "Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
];

const DashboardTabs = ({ activeTab, onTabChange, resumeCount }: DashboardTabsProps) => {
  return (
    <div style={{ width: "100%", overflowX: "auto", paddingBottom: "0.5rem", WebkitOverflowScrolling: "touch" }}>
      <div style={{
        display: "flex",
        gap: "0.25rem",
        background: "rgba(196,181,160,0.12)",
        borderRadius: "1rem",
        padding: "0.3rem",
        width: "max-content",
        margin: "0 auto",
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.3rem",
                borderRadius: "0.75rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontFamily: "var(--font-sans)",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#FAF7F2" : "var(--color-espresso)",
                background: isActive ? "var(--color-olive)" : "transparent",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.opacity = "0.7";
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.opacity = "1";
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
              
              {tab.id === "resumes" && resumeCount > 0 && (
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isActive ? "rgba(250,247,242,0.2)" : "rgba(196,181,160,0.4)",
                  color: isActive ? "#FAF7F2" : "var(--color-espresso)",
                  borderRadius: "100%",
                  width: "1.35rem",
                  height: "1.35rem",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  marginLeft: "0.25rem"
                }}>
                  {resumeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardTabs;
