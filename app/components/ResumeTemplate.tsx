import { forwardRef } from "react";

interface ResumeTemplateProps {
  data: ParsedResume;
  theme?: string;
  editable?: boolean;
}

interface ThemeConfig {
  primary: string;
  secondary: string;
  font: string;
  nameAlign: "left" | "center";
  nameSize: string;
  nameWeight: number;
  nameBorder: string;
  contactSeparator: string;
  headerStyle: "underline" | "border-left" | "solid" | "double-line" | "dashed" | "thick-underline" | "bottom-border";
  skillsStyle: "dots" | "comma" | "pills" | "inline" | "grid";
}

const THEMES: Record<string, ThemeConfig> = {
  Modern: {
    primary: "#2B4C7E", secondary: "#5B7BA5",
    font: "'Inter', 'Helvetica Neue', sans-serif",
    nameAlign: "center", nameSize: "20pt", nameWeight: 700,
    nameBorder: "none",
    contactSeparator: " · ",
    headerStyle: "underline",
    skillsStyle: "dots",
  },
  Classic: {
    primary: "#1a1a1a", secondary: "#555",
    font: "'Times New Roman', 'Georgia', serif",
    nameAlign: "center", nameSize: "22pt", nameWeight: 700,
    nameBorder: "2px double #1a1a1a",
    contactSeparator: " | ",
    headerStyle: "double-line",
    skillsStyle: "comma",
  },
  Minimalist: {
    primary: "#444444", secondary: "#888",
    font: "'Roboto', 'Segoe UI', sans-serif",
    nameAlign: "left", nameSize: "18pt", nameWeight: 300,
    nameBorder: "none",
    contactSeparator: "  •  ",
    headerStyle: "border-left",
    skillsStyle: "pills",
  },
  Bold: {
    primary: "#8B2635", secondary: "#C4525F",
    font: "'Arial', 'Helvetica', sans-serif",
    nameAlign: "center", nameSize: "24pt", nameWeight: 900,
    nameBorder: "none",
    contactSeparator: " — ",
    headerStyle: "solid",
    skillsStyle: "inline",
  },
  Creative: {
    primary: "#2E593A", secondary: "#5A8F68",
    font: "'Georgia', serif",
    nameAlign: "center", nameSize: "20pt", nameWeight: 700,
    nameBorder: "none",
    contactSeparator: " / ",
    headerStyle: "solid",
    skillsStyle: "grid",
  },
  Executive: {
    primary: "#1c3144", secondary: "#4A6B8A",
    font: "'Palatino Linotype', 'Palatino', serif",
    nameAlign: "center", nameSize: "21pt", nameWeight: 700,
    nameBorder: "1px solid #1c3144",
    contactSeparator: " · ",
    headerStyle: "underline",
    skillsStyle: "dots",
  },
  Sleek: {
    primary: "#4A3575", secondary: "#7B6BA5",
    font: "'Segoe UI', 'Trebuchet MS', sans-serif",
    nameAlign: "left", nameSize: "22pt", nameWeight: 600,
    nameBorder: "none",
    contactSeparator: " | ",
    headerStyle: "bottom-border",
    skillsStyle: "inline",
  },
  Elegant: {
    primary: "#8B7355", secondary: "#B8A88A",
    font: "'Garamond', 'Georgia', serif",
    nameAlign: "center", nameSize: "22pt", nameWeight: 400,
    nameBorder: "none",
    contactSeparator: "  ✦  ",
    headerStyle: "underline",
    skillsStyle: "comma",
  },
  Tech: {
    primary: "#0D7377", secondary: "#14A3A8",
    font: "'Consolas', 'Courier New', monospace",
    nameAlign: "left", nameSize: "18pt", nameWeight: 700,
    nameBorder: "none",
    contactSeparator: " // ",
    headerStyle: "dashed",
    skillsStyle: "pills",
  },
  Corporate: {
    primary: "#1B365D", secondary: "#3A5A8C",
    font: "'Calibri', 'Segoe UI', sans-serif",
    nameAlign: "center", nameSize: "20pt", nameWeight: 700,
    nameBorder: "3px solid #1B365D",
    contactSeparator: " | ",
    headerStyle: "thick-underline",
    skillsStyle: "dots",
  },
};

export const THEME_NAMES = Object.keys(THEMES);

/* ── Section Header ── */
const SectionHeader = ({ children, t }: { children: React.ReactNode; t: ThemeConfig }) => {
  const base: React.CSSProperties = {
    fontSize: "11pt", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.1em", margin: 0, color: t.primary, lineHeight: 1.3,
  };

  let wrapper: React.CSSProperties = { marginBottom: "10px", marginTop: "14px" };
  let extra: React.CSSProperties = {};
  let after: React.ReactNode = null;

  switch (t.headerStyle) {
    case "underline":
      extra = { borderBottom: `2px solid ${t.primary}`, paddingBottom: "3px" };
      break;
    case "double-line":
      extra = { borderTop: `1px solid ${t.primary}`, borderBottom: `1px solid ${t.primary}`, padding: "3px 0" };
      break;
    case "border-left":
      extra = { borderLeft: `4px solid ${t.primary}`, paddingLeft: "8px" };
      break;
    case "solid":
      extra = { background: t.primary, color: "#fff", padding: "4px 10px" };
      break;
    case "dashed":
      extra = { borderBottom: `2px dashed ${t.secondary}`, paddingBottom: "3px" };
      break;
    case "thick-underline":
      after = <div style={{ width: "100%", height: "4px", background: t.primary, marginTop: "3px", borderRadius: "2px" }} />;
      break;
    case "bottom-border":
      extra = { borderBottom: `2px solid ${t.secondary}`, paddingBottom: "4px" };
      break;
  }

  return (
    <div style={wrapper}>
      <h2 style={{ ...base, ...extra }}>{children}</h2>
      {after}
    </div>
  );
};

/* ── Skills Renderer ── */
const SkillsDisplay = ({ skills, t, editProps }: { skills: string[]; t: ThemeConfig; editProps: object }) => {
  switch (t.skillsStyle) {
    case "pills":
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {skills.map((s, i) => (
            <span key={i} {...editProps} style={{
              fontSize: "9pt", padding: "2px 10px", borderRadius: "100px",
              border: `1px solid ${t.secondary}`, color: t.primary, background: "transparent",
            }}>{s}</span>
          ))}
        </div>
      );
    case "grid":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 12px" }}>
          {skills.map((s, i) => (
            <span key={i} {...editProps} style={{ fontSize: "10pt", color: "#2a2a2a" }}>• {s}</span>
          ))}
        </div>
      );
    case "comma":
      return <p {...editProps} style={{ margin: 0, fontSize: "10.5pt" }}>{skills.join(", ")}</p>;
    case "inline":
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          {skills.map((s, i) => (
            <span key={i} {...editProps} style={{ fontSize: "10pt", fontWeight: 600, color: t.primary }}>{s}</span>
          ))}
        </div>
      );
    case "dots":
    default:
      return <p {...editProps} style={{ margin: 0, fontSize: "10.5pt" }}>{skills.join(" · ")}</p>;
  }
};

/* ── Main Template ── */
const ResumeTemplate = forwardRef<HTMLDivElement, ResumeTemplateProps>(
  ({ data, theme = "Modern", editable = false }, ref) => {
    const editProps = editable
      ? { contentEditable: true, suppressContentEditableWarning: true }
      : {};

    const t = THEMES[theme] || THEMES.Modern;

    /* Name block styles per theme */
    const nameBlockStyle: React.CSSProperties = {
      textAlign: t.nameAlign,
      marginBottom: "8px",
      paddingBottom: "8px",
      borderBottom: t.nameBorder !== "none" ? t.nameBorder : undefined,
    };

    const contactItems = [
      data.contactInfo?.email,
      data.contactInfo?.phone,
      data.contactInfo?.linkedin,
      data.contactInfo?.location,
      data.contactInfo?.portfolio,
    ].filter(Boolean);

    return (
      <div
        ref={ref}
        id="resume-template"
        style={{
          fontFamily: t.font,
          fontSize: "11pt",
          lineHeight: 1.45,
          color: "#1a1a1a",
          background: "#ffffff",
          padding: "18mm 16mm",
          maxWidth: "210mm",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* ── NAME ── */}
        <div style={nameBlockStyle}>
          <h1
            {...editProps}
            style={{
              fontSize: t.nameSize, fontWeight: t.nameWeight, margin: 0,
              letterSpacing: "0.04em", textTransform: "uppercase", color: t.primary,
            }}
          >
            {data.fullName || "Your Name"}
          </h1>
          <div style={{
            marginTop: "4px", fontSize: "9.5pt", color: "#555",
            display: "flex", flexWrap: "wrap",
            justifyContent: t.nameAlign === "center" ? "center" : "flex-start",
            gap: "0",
          }}>
            {contactItems.map((item, i) => (
              <span key={i}>
                <span {...editProps}>{item}</span>
                {i < contactItems.length - 1 && (
                  <span style={{ color: t.secondary }}>{t.contactSeparator}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* ── PROFESSIONAL SUMMARY ── */}
        {data.summary && (
          <section style={{ marginBottom: "8px" }}>
            <SectionHeader t={t}>Professional Summary</SectionHeader>
            <p {...editProps} style={{ margin: 0, fontSize: "10.5pt", color: "#2a2a2a" }}>
              {data.summary}
            </p>
          </section>
        )}

        {/* ── SKILLS ── */}
        {data.skills?.length > 0 && (
          <section style={{ marginBottom: "8px" }}>
            <SectionHeader t={t}>Skills</SectionHeader>
            <SkillsDisplay skills={data.skills} t={t} editProps={editProps} />
          </section>
        )}

        {/* ── EXPERIENCE ── */}
        {data.experience?.length > 0 && (
          <section style={{ marginBottom: "8px" }}>
            <SectionHeader t={t}>Experience</SectionHeader>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span {...editProps} style={{ fontWeight: 700, fontSize: "10.5pt" }}>{exp.title}</span>
                  <span {...editProps} style={{ fontSize: "9.5pt", color: "#555" }}>{exp.duration}</span>
                </div>
                <div {...editProps} style={{ fontStyle: "italic", fontSize: "10pt", color: "#444", marginBottom: "3px" }}>{exp.company}</div>
                {exp.bullets?.length > 0 && (
                  <ul style={{ margin: "2px 0 0 14px", padding: 0 }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} {...editProps} style={{ fontSize: "10pt", marginBottom: "2px" }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── PROJECTS ── */}
        {data.projects?.length > 0 && (
          <section style={{ marginBottom: "8px" }}>
            <SectionHeader t={t}>Projects</SectionHeader>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span {...editProps} style={{ fontWeight: 700, fontSize: "10.5pt" }}>{proj.name}</span>
                  {proj.technologies?.length > 0 && (
                    <span {...editProps} style={{ fontSize: "9pt", color: t.secondary }}>{proj.technologies.join(", ")}</span>
                  )}
                </div>
                {proj.description && <p {...editProps} style={{ margin: "2px 0 3px", fontSize: "10pt", color: "#444", fontStyle: "italic" }}>{proj.description}</p>}
                {proj.bullets?.length > 0 && (
                  <ul style={{ margin: "2px 0 0 14px", padding: 0 }}>
                    {proj.bullets.map((b, j) => (
                      <li key={j} {...editProps} style={{ fontSize: "10pt", marginBottom: "2px" }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── EDUCATION ── */}
        {data.education?.length > 0 && (
          <section style={{ marginBottom: "8px" }}>
            <SectionHeader t={t}>Education</SectionHeader>
            {data.education.map((edu, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <div>
                  <span {...editProps} style={{ fontWeight: 700, fontSize: "10.5pt" }}>{edu.degree}</span>
                  {edu.details && <span {...editProps} style={{ fontSize: "9.5pt", color: "#555" }}> · {edu.details}</span>}
                  <div {...editProps} style={{ fontStyle: "italic", fontSize: "10pt", color: "#444" }}>{edu.institution}</div>
                </div>
                <span {...editProps} style={{ fontSize: "9.5pt", color: "#555", whiteSpace: "nowrap" }}>{edu.year}</span>
              </div>
            ))}
          </section>
        )}

        {/* ── CERTIFICATIONS ── */}
        {data.certifications?.length > 0 && (
          <section style={{ marginBottom: "8px" }}>
            <SectionHeader t={t}>Certifications</SectionHeader>
            <ul style={{ margin: 0, paddingLeft: "14px" }}>
              {data.certifications.map((c, i) => (
                <li key={i} {...editProps} style={{ fontSize: "10pt", marginBottom: "2px" }}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ── ACHIEVEMENTS ── */}
        {data.achievements?.length > 0 && (
          <section style={{ marginBottom: "8px" }}>
            <SectionHeader t={t}>Achievements</SectionHeader>
            <ul style={{ margin: 0, paddingLeft: "14px" }}>
              {data.achievements.map((a, i) => (
                <li key={i} {...editProps} style={{ fontSize: "10pt", marginBottom: "2px" }}>{a}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ── ADDITIONAL INFO ── */}
        {data.additionalInfo && (
          <section>
            <SectionHeader t={t}>Additional Information</SectionHeader>
            <p {...editProps} style={{ margin: 0, fontSize: "10pt" }}>{data.additionalInfo}</p>
          </section>
        )}
      </div>
    );
  }
);

ResumeTemplate.displayName = "ResumeTemplate";

export default ResumeTemplate;
