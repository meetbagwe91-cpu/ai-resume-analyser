import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { useAppStore } from "~/lib/store";
import { useEffect, useRef } from "react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Outfit:wght@100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { initAuth } = useAppStore();
  const glowRef  = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initAuth();

    // Slow the video to 40% speed for a subtle ambient feel
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.4;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(196,181,160,0.07), transparent 40%)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [initAuth]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="Fc2W-XA0CPR6ppJ1OIk_g_eBmKDhx3MljjVrywzkLII" />
        <Meta />
        <Links />
      </head>
      <body style={{ background: "var(--color-cream)", color: "var(--color-espresso)" }}>

        {/* ── Video background ─────────────────────────────────────── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: -2,
          overflow: "hidden", pointerEvents: "none",
        }}>
          <video
            ref={videoRef}
            autoPlay muted loop playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          >
            <source src="/main.mp4" type="video/mp4" />
          </video>
        </div>

        {/* ── Warm cream tint — keeps text readable over the video ── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: -1,
          background: "rgba(247, 244, 239, 0.74)",
          pointerEvents: "none",
        }} />

        {/* ── Interactive cursor glow ───────────────────────────────── */}
        <div ref={glowRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-card max-w-2xl w-full p-10 flex flex-col items-center gap-6 animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1>{message}</h1>
        <p className="text-xl text-text-secondary">{details}</p>

        {stack && (
          <pre className="w-full p-4 overflow-x-auto bg-white/50 border border-white rounded-xl text-left text-sm text-text-secondary mt-4 shadow-inner">
            <code>{stack}</code>
          </pre>
        )}

        <a href="/" className="primary-button mt-4">
          Return to Dashboard
        </a>
      </div>
    </main>
  );
}
