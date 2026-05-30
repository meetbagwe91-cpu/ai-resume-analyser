import { useState } from "react";
import { queryGroq } from "~/lib/groq";

interface SectionRewriterProps {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
}

const SECTIONS = [
  { id: "summary", label: "Professional Summary", icon: "M4 6h16M4 12h16M4 18h7" },
  { id: "experience", label: "Work Experience", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id: "skills", label: "Skills Section", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { id: "projects", label: "Projects", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
  { id: "education", label: "Education", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
  { id: "bullets", label: "Bullet Points Only", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
];

const SectionRewriter = ({ resumeText, jobTitle, jobDescription }: SectionRewriterProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRewrite = async (sectionId: string) => {
    setSelected(sectionId);
    setRewriting(true);
    setResult(null);
    setError(null);

    const sectionLabel = SECTIONS.find(s => s.id === sectionId)?.label ?? sectionId;

    const prompt = `You are a world-class professional résumé writer. 

TASK: Rewrite ONLY the "${sectionLabel}" section of this résumé. Leave nothing else — focus exclusively on this section.

TARGET ROLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription || "Not provided — optimize for the role generally."}

RULES:
1. Use the XYZ formula for bullets: "Accomplished [X] as measured by [Y], by doing [Z]"
2. Start every bullet with a power verb (Spearheaded, Engineered, Orchestrated, etc.)
3. Use Harvard Business tone — no personal pronouns, no filler
4. Weave in role-critical keywords from the job description
5. Be aggressive with impact language but don't hallucinate numbers
6. If rewriting "Bullet Points Only", rewrite ALL bullet points across ALL sections

OUTPUT FORMAT: Return the rewritten section as clean, formatted text. Use markdown formatting:
- Use **bold** for headings
- Use bullet points (-)
- Keep it clean and ready to copy-paste

Do NOT return JSON. Return formatted text only.`;

    try {
      const rawResult = await queryGroq(
        prompt,
        `Here is my résumé text:\n\n${resumeText}`,
        "llama-3.3-70b-versatile",
        90000,
        2048
      );
      setResult(rawResult);
    } catch (e: any) {
      setError(e?.message || "Failed to rewrite section. Please try again.");
    }
    setRewriting(false);
  };

  return (
    <div className="card-elevated" style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <span className="section-label">Section-by-Section Rewrite</span>
        <h3 style={{ margin: "0.5rem 0 0.25rem", fontSize: "1.5rem" }}>Targeted AI Rewrite</h3>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-stone)" }}>
          Select a specific section to get a focused, high-impact rewrite tailored to your target role.
        </p>
      </div>

      {/* Section buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
        {SECTIONS.map(section => {
          const isActive = selected === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleRewrite(section.id)}
              disabled={rewriting}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1.125rem", borderRadius: "100px",
                border: "1.5px solid",
                borderColor: isActive ? "var(--color-olive)" : "rgba(196,181,160,0.4)",
                background: isActive ? "var(--color-olive)" : "rgba(250,247,242,0.9)",
                color: isActive ? "#FAF7F2" : "var(--color-espresso)",
                fontSize: "0.8rem", fontWeight: 500, fontFamily: "var(--font-sans)",
                cursor: rewriting ? "wait" : "pointer",
                transition: "all 0.2s ease",
                opacity: rewriting && !isActive ? 0.5 : 1,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
              </svg>
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Rewriting indicator */}
      {rewriting && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.875rem",
          padding: "1.25rem 1.5rem", borderRadius: "1rem",
          background: "var(--color-sage-light)", border: "1px solid rgba(123,155,126,0.2)",
        }}>
          <div style={{ width: 18, height: 18, borderRadius: "100%", border: "2px solid rgba(123,155,126,0.3)", borderTopColor: "var(--color-sage)", animation: "spin 0.9s linear infinite", flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 500, color: "var(--color-sage)" }}>
              Rewriting {SECTIONS.find(s => s.id === selected)?.label}…
            </p>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--color-stone)" }}>
              Usually takes 10–15 seconds
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: "1rem 1.25rem", borderRadius: "1rem",
          background: "var(--color-clay-light)", border: "1px solid rgba(168,92,74,0.2)",
          color: "var(--color-clay)", fontSize: "0.85rem",
        }}>
          {error}
          <button
            onClick={() => { setError(null); if (selected) handleRewrite(selected); }}
            style={{
              display: "block", marginTop: "0.5rem",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--color-clay)", fontWeight: 600, fontSize: "0.78rem",
              textDecoration: "underline", textUnderlineOffset: "2px",
              fontFamily: "var(--font-sans)",
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Result */}
      {result && !rewriting && (
        <div style={{ marginTop: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{
              fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
              background: "var(--color-sage-light)", color: "var(--color-sage)",
              padding: "0.25rem 0.7rem", borderRadius: "100px",
            }}>
              ✓ Rewritten — {SECTIONS.find(s => s.id === selected)?.label}
            </span>
            <button
              onClick={() => { navigator.clipboard.writeText(result); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                background: "none", border: "1px solid rgba(196,181,160,0.4)",
                padding: "0.4rem 0.875rem", borderRadius: "100px",
                fontSize: "0.72rem", fontWeight: 500, cursor: "pointer",
                color: "var(--color-espresso)", fontFamily: "var(--font-sans)",
              }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
          <div style={{
            padding: "clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 1.75rem)", borderRadius: "1.25rem",
            background: "rgba(250,247,242,0.9)", border: "1px solid rgba(196,181,160,0.25)",
            fontSize: "0.92rem", color: "var(--color-espresso)", lineHeight: 1.7,
            whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)",
          }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionRewriter;
