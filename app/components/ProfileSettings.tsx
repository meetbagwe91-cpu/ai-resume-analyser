import { useState, useEffect, useCallback } from "react";

interface ProfileSettingsProps {
  userId: string;
}

const CAREER_FIELDS = [
  "Technology & Software",
  "Finance & Banking",
  "Healthcare & Medicine",
  "Marketing & Communications",
  "Data Science & AI",
  "Design & Creative",
  "Engineering",
  "Education & Academia",
  "Sales & Business Development",
  "Consulting & Strategy",
  "Legal",
  "Human Resources",
  "Operations & Logistics",
  "Product Management",
  "Other",
];

const EXPERIENCE_LEVELS: { id: "entry" | "mid" | "senior" | "executive"; label: string; years: string }[] = [
  { id: "entry", label: "Entry Level", years: "0–2 years" },
  { id: "mid", label: "Mid Level", years: "3–6 years" },
  { id: "senior", label: "Senior Level", years: "7–12 years" },
  { id: "executive", label: "Executive", years: "12+ years" },
];

const TONES: { id: "formal" | "modern" | "creative" | "minimal"; label: string; desc: string }[] = [
  { id: "formal", label: "Formal", desc: "Traditional, authoritative language" },
  { id: "modern", label: "Modern", desc: "Clean, professional, and direct" },
  { id: "creative", label: "Creative", desc: "Expressive, personality-forward" },
  { id: "minimal", label: "Minimal", desc: "Concise, no-fluff, data-driven" },
];

const RESUME_STYLES: { id: string; label: string; accent: string }[] = [
  { id: "modern", label: "Modern", accent: "#2B4C7E" },
  { id: "classic", label: "Classic", accent: "#1a1a1a" },
  { id: "minimalist", label: "Minimalist", accent: "#444444" },
  { id: "bold", label: "Bold", accent: "#8B2635" },
  { id: "creative", label: "Creative", accent: "#2E593A" },
  { id: "executive", label: "Executive", accent: "#1c3144" },
  { id: "sleek", label: "Sleek", accent: "#4A3575" },
  { id: "elegant", label: "Elegant", accent: "#8B7355" },
  { id: "tech", label: "Tech", accent: "#0D7377" },
  { id: "corporate", label: "Corporate", accent: "#1B365D" },
];

const ProfileSettings = ({ userId }: ProfileSettingsProps) => {
  const [prefs, setPrefs] = useState<UserPreferences>({ favoriteTemplates: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Load preferences
  useEffect(() => {
    const load = async () => {
      try {
        const { db } = await import("~/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "user_preferences", userId));
        if (snap.exists()) {
          setPrefs(snap.data() as UserPreferences);
        }
      } catch (e) {
        console.error("Failed to load preferences:", e);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  // Auto-save with debounce
  const savePrefs = useCallback(async (newPrefs: UserPreferences) => {
    setSaving(true);
    setSaved(false);
    try {
      const { db } = await import("~/lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "user_preferences", userId), {
        ...newPrefs,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save preferences:", e);
    }
    setSaving(false);
  }, [userId]);

  const update = (patch: Partial<UserPreferences>) => {
    const newPrefs = { ...prefs, ...patch };
    setPrefs(newPrefs);
    setDirty(true);
  };

  const handleSave = () => savePrefs(prefs);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: "100%", border: "2px solid var(--color-taupe-light)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      {/* Save bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.875rem 1.5rem", borderRadius: "1rem",
        background: "rgba(250,247,242,0.85)", border: "1px solid rgba(196,181,160,0.25)",
        position: "sticky", top: 70, zIndex: 10,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--color-olive)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--color-espresso)" }}>
            Profile Preferences
          </span>
          {saved && (
            <span style={{
              fontSize: "0.68rem", fontWeight: 600,
              color: "var(--color-sage)", background: "var(--color-sage-light)",
              padding: "0.15rem 0.6rem", borderRadius: "100px",
              animation: "fadeIn 0.3s ease",
            }}>
              ✓ Saved
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="btn-primary"
          style={{
            fontSize: "0.7rem", padding: "0.5rem 1.25rem",
            opacity: dirty ? 1 : 0.5,
          }}
        >
          {saving ? (
            <>
              <div style={{ width: 12, height: 12, borderRadius: "100%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.9s linear infinite" }} />
              Saving…
            </>
          ) : "Save Changes"}
        </button>
      </div>

      {/* ── Career Field ── */}
      <div>
        <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>Career Field</span>
        <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-brown-dark)" }}>
          Select your primary industry. This helps the AI tailor keywords and structure.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {CAREER_FIELDS.map(field => {
            const isSelected = prefs.careerField === field;
            return (
              <button
                key={field}
                onClick={() => update({ careerField: field })}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "100px",
                  border: "1px solid",
                  borderColor: isSelected ? "var(--color-olive)" : "rgba(196,181,160,0.35)",
                  background: isSelected ? "var(--color-olive)" : "transparent",
                  color: isSelected ? "#FAF7F2" : "var(--color-brown-mid)",
                  fontSize: "0.78rem",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.03em",
                }}
              >
                {field}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Experience Level ── */}
      <div>
        <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>Experience Level</span>
        <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-brown-dark)" }}>
          Your seniority determines the depth, format, and emphasis of the AI analysis.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {EXPERIENCE_LEVELS.map(level => {
            const isSelected = prefs.experienceLevel === level.id;
            return (
              <button
                key={level.id}
                onClick={() => update({ experienceLevel: level.id })}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  padding: "1.125rem 1.25rem", borderRadius: "1.125rem",
                  border: "1.5px solid",
                  borderColor: isSelected ? "var(--color-olive)" : "rgba(196,181,160,0.4)",
                  background: isSelected ? "rgba(74,69,53,0.06)" : "rgba(250,247,242,0.9)",
                  cursor: "pointer", transition: "all 0.2s ease",
                  textAlign: "left",
                  boxShadow: "0 2px 8px rgba(44,35,24,0.04)",
                }}
              >
                <span style={{
                  fontSize: "0.95rem", fontWeight: 600, color: "var(--color-espresso)",
                  fontFamily: "var(--font-serif)",
                }}>
                  {level.label}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-brown-mid)", marginTop: "0.2rem" }}>
                  {level.years}
                </span>
                {isSelected && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-olive)" stroke="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Target Role ── */}
      <div>
        <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>Target Role</span>
        <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-brown-dark)" }}>
          What position are you aiming for? This personalizes keyword optimization.
        </p>
        <input
          type="text"
          value={prefs.targetRole || ""}
          onChange={e => update({ targetRole: e.target.value })}
          placeholder="e.g. Senior Data Engineer, Product Manager, UX Designer…"
          style={{
            maxWidth: 480,
            padding: "0.875rem 1.25rem",
            borderRadius: "1rem",
            border: "1px solid rgba(196,181,160,0.4)",
            background: "var(--color-parchment)",
            fontSize: "0.9rem",
            fontFamily: "var(--font-sans)",
            color: "var(--color-espresso)",
            outline: "none",
            width: "100%",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--color-taupe-dark)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,152,128,0.15)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "rgba(196,181,160,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      {/* ── Tone ── */}
      <div>
        <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>Preferred Tone</span>
        <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-brown-dark)" }}>
          How should the AI frame your experience? This influences bullet style and language.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {TONES.map(tone => {
            const isSelected = prefs.tone === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => update({ tone: tone.id })}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  padding: "1.125rem 1.25rem", borderRadius: "1.125rem",
                  border: "1.5px solid",
                  borderColor: isSelected ? "var(--color-olive)" : "rgba(196,181,160,0.4)",
                  background: isSelected ? "rgba(74,69,53,0.06)" : "rgba(250,247,242,0.9)",
                  cursor: "pointer", transition: "all 0.2s ease",
                  textAlign: "left",
                  boxShadow: "0 2px 8px rgba(44,35,24,0.04)",
                }}
              >
                <span style={{
                  fontSize: "0.95rem", fontWeight: 600,
                  color: isSelected ? "var(--color-espresso)" : "var(--color-espresso)",
                  fontFamily: "var(--font-serif)",
                }}>
                  {tone.label}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-brown-mid)", marginTop: "0.2rem" }}>
                  {tone.desc}
                </span>
                {isSelected && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-olive)" stroke="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Resume Style ── */}
      <div>
        <span className="section-label" style={{ marginBottom: "0.75rem", color: "var(--color-espresso)", fontWeight: 600 }}>Default Résumé Style</span>
        <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-brown-dark)" }}>
          Your preferred template style for AI-generated résumés.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
          {RESUME_STYLES.map(style => {
            const isSelected = prefs.resumeStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => update({ resumeStyle: style.id as UserPreferences["resumeStyle"] })}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.55rem 1rem",
                  borderRadius: "100px",
                  border: "1.5px solid",
                  borderColor: isSelected ? style.accent : "rgba(196,181,160,0.5)",
                  background: isSelected ? `${style.accent}10` : "rgba(250,247,242,0.9)",
                  cursor: "pointer", transition: "all 0.2s ease",
                  fontSize: "0.85rem", fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                  color: isSelected ? style.accent : "var(--color-espresso)",
                  boxShadow: "0 2px 4px rgba(44,35,24,0.03)",
                }}
              >
                <span style={{
                  width: 10, height: 10, borderRadius: "100%",
                  background: style.accent,
                  border: isSelected ? "2px solid white" : "none",
                  boxShadow: isSelected ? `0 0 0 1px ${style.accent}` : "none",
                  flexShrink: 0,
                }} />
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Current Summary ── */}
      {(prefs.careerField || prefs.experienceLevel || prefs.targetRole || prefs.tone || prefs.resumeStyle) && (
        <div style={{
          padding: "1.5rem", borderRadius: "1.25rem",
          background: "rgba(250,247,242,0.85)",
          border: "1px solid rgba(196,181,160,0.2)",
        }}>
          <span className="section-label" style={{ marginBottom: "0.75rem" }}>Your Profile Summary</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {prefs.careerField && (
              <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.875rem", borderRadius: "100px", background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.3)", color: "var(--color-espresso)", fontWeight: 500 }}>
                🎯 {prefs.careerField}
              </span>
            )}
            {prefs.experienceLevel && (
              <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.875rem", borderRadius: "100px", background: "var(--color-sage-light)", border: "1px solid rgba(123,155,126,0.2)", color: "var(--color-sage)", fontWeight: 500 }}>
                📊 {EXPERIENCE_LEVELS.find(l => l.id === prefs.experienceLevel)?.label}
              </span>
            )}
            {prefs.targetRole && (
              <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.875rem", borderRadius: "100px", background: "var(--color-amber-light)", border: "1px solid rgba(184,137,42,0.2)", color: "var(--color-amber-warm)", fontWeight: 500 }}>
                💼 {prefs.targetRole}
              </span>
            )}
            {prefs.tone && (
              <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.875rem", borderRadius: "100px", background: "var(--color-cream-deep)", border: "1px solid rgba(196,181,160,0.3)", color: "var(--color-brown-mid)", fontWeight: 500 }}>
                ✍️ {TONES.find(t => t.id === prefs.tone)?.label} tone
              </span>
            )}
            {prefs.resumeStyle && (
              <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.875rem", borderRadius: "100px", background: "var(--color-clay-light)", border: "1px solid rgba(168,92,74,0.15)", color: "var(--color-clay)", fontWeight: 500 }}>
                📄 {RESUME_STYLES.find(s => s.id === prefs.resumeStyle)?.label} style
              </span>
            )}
          </div>
          {prefs.updatedAt && (
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.68rem", color: "var(--color-stone-light)" }}>
              Last updated {new Date(prefs.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
