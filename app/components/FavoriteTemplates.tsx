import { useState, useEffect } from "react";
import { THEME_NAMES } from "./ResumeTemplate";

interface FavoriteTemplatesProps {
  userId: string;
}

// Theme metadata for display
const THEME_META: Record<string, { description: string; font: string; accent: string }> = {
  Modern:      { description: "Clean lines, sans-serif, subtle underlines", font: "Inter", accent: "#2B4C7E" },
  Classic:     { description: "Timeless serif, double-line borders", font: "Times New Roman", accent: "#1a1a1a" },
  Minimalist:  { description: "Lightweight, left-border accents", font: "Roboto", accent: "#444444" },
  Bold:        { description: "High-contrast headers, strong presence", font: "Arial", accent: "#8B2635" },
  Creative:    { description: "Earthy tones, grid-based skills", font: "Georgia", accent: "#2E593A" },
  Executive:   { description: "Refined serif, corporate elegance", font: "Palatino", accent: "#1c3144" },
  Sleek:       { description: "Modern sans-serif, bottom borders", font: "Segoe UI", accent: "#4A3575" },
  Elegant:     { description: "Graceful garamond, subtle warmth", font: "Garamond", accent: "#8B7355" },
  Tech:        { description: "Monospace, dashed borders, dev-focused", font: "Consolas", accent: "#0D7377" },
  Corporate:   { description: "Calibri, thick underlines, structured", font: "Calibri", accent: "#1B365D" },
};

const FavoriteTemplates = ({ userId }: FavoriteTemplatesProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Firestore
  useEffect(() => {
    const load = async () => {
      try {
        const { db } = await import("~/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "user_preferences", userId));
        if (snap.exists()) {
          setFavorites(snap.data()?.favoriteTemplates ?? []);
        }
      } catch (e) {
        console.error("Failed to load template preferences:", e);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const toggleFavorite = async (themeName: string) => {
    const newFavs = favorites.includes(themeName)
      ? favorites.filter(f => f !== themeName)
      : [...favorites, themeName];
    setFavorites(newFavs);

    // Persist
    try {
      const { db } = await import("~/lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "user_preferences", userId), { favoriteTemplates: newFavs }, { merge: true });
    } catch (e) {
      console.error("Failed to save template preference:", e);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: "100%", border: "2px solid var(--color-taupe-light)", borderTopColor: "var(--color-olive)", animation: "spin 0.9s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <span className="section-label" style={{ marginBottom: "0.25rem" }}>Template Preferences</span>
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--color-stone)" }}>
          Star your preferred résumé themes. These will be prioritized when optimizing.
          <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "var(--color-olive)" }}>
            {favorites.length} favorited
          </span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {THEME_NAMES.map((name, i) => {
          const meta = THEME_META[name] || { description: "", font: "", accent: "#666" };
          const isFav = favorites.includes(name);

          return (
            <div
              key={name}
              className="anim-fade-up"
              style={{
                animationDelay: `${i * 0.04}s`,
                padding: "1.25rem 1.5rem",
                borderRadius: "1.25rem",
                background: "rgba(250,247,242,0.85)",
                border: `1px solid ${isFav ? "rgba(184,137,42,0.35)" : "rgba(196,181,160,0.25)"}`,
                transition: "all 0.25s ease",
                position: "relative",
              }}
            >
              {/* Favorite toggle */}
              <button
                onClick={() => toggleFavorite(name)}
                style={{
                  position: "absolute", top: "0.875rem", right: "0.875rem",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "0.25rem", transition: "transform 0.2s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                title={isFav ? "Remove from favorites" : "Add to favorites"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill={isFav ? "var(--color-amber-warm)" : "none"}
                  stroke={isFav ? "var(--color-amber-warm)" : "var(--color-taupe)"}
                  strokeWidth={2}
                >
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>

              {/* Theme accent bar */}
              <div style={{ width: "100%", height: 4, borderRadius: "100px", background: meta.accent, marginBottom: "0.875rem", opacity: 0.7 }} />

              {/* Theme name */}
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--color-espresso)", fontFamily: "var(--font-serif)" }}>
                {name}
              </p>

              {/* Description */}
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "var(--color-stone)", lineHeight: 1.4 }}>
                {meta.description}
              </p>

              {/* Font */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
                <span style={{
                  fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "var(--color-stone-light)", padding: "0.2rem 0.5rem",
                  borderRadius: "100px", background: "rgba(196,181,160,0.15)",
                }}>
                  {meta.font}
                </span>
                <span style={{
                  width: 14, height: 14, borderRadius: "100%", background: meta.accent,
                  border: "2px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavoriteTemplates;
