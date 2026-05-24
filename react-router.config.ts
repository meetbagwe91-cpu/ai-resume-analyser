import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode — all data fetching is client-side (Firebase + Groq)
  // This lets Netlify host the app as a pure static site (no server function needed)
  ssr: false,
} satisfies Config;
