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
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumate — AI Résumé Analyzer" },
    { name: "description", content: "Get intelligent, actionable feedback on your résumé with AI. Optimize your resume for ATS and land your dream job." },
    { name: "keywords", content: "resume analyzer, AI resume, ATS checker, resume feedback, resume builder" },
    { property: "og:title", content: "Resumate — AI Résumé Analyzer" },
    { property: "og:description", content: "Get intelligent, actionable feedback on your résumé with AI. Optimize your resume for ATS and land your dream job." },
    { property: "og:type", content: "website" },
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:title", content: "Resumate — AI Résumé Analyzer" },
    { property: "twitter:description", content: "Get intelligent, actionable feedback on your résumé with AI." },
  ];
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { initAuth } = useAppStore();

  useEffect(() => {
    initAuth();
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
      <body style={{ background: "var(--color-ivory)", color: "var(--color-espresso)" }}>
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
    <div style={{
      minHeight: "100vh",
      background: "var(--color-ivory)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <div className="card-elevated anim-scale-in" style={{
        maxWidth: 520,
        width: "100%",
        padding: "3rem",
        textAlign: "center",
      }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56,
          borderRadius: "100%",
          background: "var(--color-clay-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--color-clay)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{message}</h1>
        <p style={{ color: "var(--color-stone)", marginBottom: "2rem" }}>{details}</p>

        {stack && (
          <pre style={{
            background: "var(--color-ivory-warm)",
            border: "1px solid rgba(184,168,152,0.3)",
            borderRadius: "0.75rem",
            padding: "1rem",
            overflowX: "auto",
            textAlign: "left",
            fontSize: "0.75rem",
            color: "var(--color-stone)",
            marginBottom: "2rem",
          }}>
            <code>{stack}</code>
          </pre>
        )}

        <a href="/" className="btn-primary" style={{ textDecoration: "none" }}>
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
