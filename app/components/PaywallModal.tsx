import { useState } from "react";
import { initiatePayment, PRICING } from "~/lib/payment";

interface PaywallModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userName?: string;
  userEmail?: string;
}

// TODO: Replace with your actual Razorpay key_id
const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY";

const BENEFITS = [
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI Deep Diagnosis",
    desc: "Uncovers every ATS flaw, keyword gap, and weak bullet in your résumé.",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    title: "Full AI Rewrite",
    desc: "Gets your résumé rewritten by AI with stronger bullets, better keywords, and improved structure.",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Before/After Comparison",
    desc: "See exactly what changed and why — with a full change log from the AI.",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: "Download Optimized PDF",
    desc: "Export your polished, ATS-ready résumé as a clean downloadable PDF.",
  },
];

const PaywallModal = ({ onClose, onSuccess, userName = "", userEmail = "" }: PaywallModalProps) => {
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePay = () => {
    setStatus("processing");
    setErrorMsg("");
    initiatePayment(RAZORPAY_KEY_ID, userEmail, userName, {
      onSuccess: () => {
        setStatus("idle");
        onSuccess();
      },
      onFailure: (reason) => {
        setStatus("error");
        setErrorMsg(reason);
      },
      onDismiss: () => setStatus("idle"),
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1.5rem",
      background: "rgba(44, 35, 24, 0.55)",
      backdropFilter: "blur(8px)",
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card-elevated anim-scale-in" style={{ width: "100%", maxWidth: 520, padding: 0, overflow: "hidden" }}>

        {/* Header strip */}
        <div style={{
          background: "var(--color-olive)",
          padding: "1.75rem 2.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start"
        }}>
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", margin: "0 0 0.375rem" }}>Premium Feature</p>
            <h3 style={{ fontFamily: "var(--font-serif)", color: "#FAF7F2", margin: 0, fontSize: "1.8rem", fontWeight: 400 }}>Auto-Optimize My Résumé</h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "100%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", flexShrink: 0 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "2rem 2.5rem" }}>
          <p style={{ color: "var(--color-brown-mid)", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
            Let AI take your résumé from <em>analyzed</em> to <strong style={{ color: "var(--color-espresso)" }}>optimized</strong> — automatically.
          </p>

          {/* Benefits list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "0.75rem", flexShrink: 0,
                  background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-olive)"
                }}>{b.icon}</div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--color-espresso)", margin: "0 0 0.2rem", fontSize: "0.9rem" }}>{b.title}</p>
                  <p style={{ color: "var(--color-stone)", fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          {/* Price + CTA */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginTop: "1.75rem" }}>
            <div>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-stone)", margin: "0 0 0.2rem" }}>One-time unlock</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", fontWeight: 600, color: "var(--color-espresso)", lineHeight: 1 }}>
                  ₹{PRICING.amount / 100}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-stone)" }}>forever</span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={status === "processing"}
              className="btn-primary"
              style={{ fontSize: "0.82rem", opacity: status === "processing" ? 0.7 : 1, gap: "0.75rem" }}
            >
              {status === "processing" ? (
                <>
                  <div style={{ width: 15, height: 15, borderRadius: "100%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.9s linear infinite" }} />
                  Processing…
                </>
              ) : (
                <>
                  Unlock Now — ₹{PRICING.amount / 100}
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </div>

          {status === "error" && (
            <p style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--color-clay)", background: "var(--color-clay-light)", padding: "0.625rem 1rem", borderRadius: "0.75rem" }}>
              {errorMsg}
            </p>
          )}

          <p style={{ fontSize: "0.72rem", color: "var(--color-stone-light)", textAlign: "center", marginTop: "1.25rem" }}>
            🔒 Secure checkout via Razorpay · Your data is never sold
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
