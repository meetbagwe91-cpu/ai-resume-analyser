import { useState } from "react";
import { initiatePayment } from "~/lib/payment";

interface PaywallModalProps {
  onClose: () => void;
  onSuccess: () => void;
  feature: "auto-optimize" | "build-ai";
  userName?: string;
  userEmail?: string;
}

// Use the environment variable configured in .env
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

const PaywallModal = ({ onClose, onSuccess, feature, userName = "", userEmail = "" }: PaywallModalProps) => {
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>(feature);

  const title = feature === "auto-optimize" ? "Auto-Optimize My Résumé" : "Build Résumé with AI";
  const desc = feature === "auto-optimize" 
    ? "Get 2 credits to automatically rewrite and optimize your existing résumés for specific job descriptions."
    : "Get 2 credits to generate completely new, highly-optimized résumés from scratch using AI.";
  
  const handlePay = () => {
    setStatus("processing");
    setErrorMsg("");
    initiatePayment(RAZORPAY_KEY_ID, selectedPackage, userEmail, userName, {
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
      <div className="card-elevated anim-scale-in" style={{ width: "100%", maxWidth: 520, padding: 0 }}>

        {/* Header strip */}
        <div style={{
          background: "var(--color-espresso)",
          padding: "2rem 2.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          borderTopLeftRadius: "1.25rem",
          borderTopRightRadius: "1.25rem"
        }}>
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", margin: "0 0 0.5rem" }}>Premium Feature</p>
            <h3 style={{ fontFamily: "var(--font-serif)", color: "#FAF7F2", margin: 0, fontSize: "1.8rem", fontWeight: 400 }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "100%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", flexShrink: 0 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "2.5rem" }}>
          <p style={{ color: "var(--color-brown-mid)", fontSize: "0.95rem", marginBottom: "2rem" }}>
            {desc}
          </p>

          {/* Selectable Packages */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            <button 
              onClick={() => setSelectedPackage(feature)}
              style={{ 
                border: selectedPackage === feature ? "1.5px solid var(--color-espresso)" : "1px solid rgba(196,181,160,0.4)", 
                background: selectedPackage === feature ? "rgba(92, 74, 56, 0.04)" : "transparent",
                borderRadius: "1rem", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", transition: "all 0.2s ease", textAlign: "left", width: "100%"
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 22, height: 22, borderRadius: "100%", border: selectedPackage === feature ? "7px solid var(--color-espresso)" : "1.5px solid rgba(196,181,160,0.6)" }} />
                <div>
                  <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "var(--color-espresso)", fontSize: "1.05rem" }}>{feature === "auto-optimize" ? "Pro" : "Pro Build"}</p>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-stone)" }}>For {title} (2 Credits)</span>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--color-espresso)" }}>₹19</div>
            </button>

            <button 
              onClick={() => setSelectedPackage("bundle")}
              style={{ 
                border: selectedPackage === "bundle" ? "1.5px solid var(--color-espresso)" : "1px solid rgba(196,181,160,0.4)", 
                background: selectedPackage === "bundle" ? "rgba(92, 74, 56, 0.04)" : "transparent",
                borderRadius: "1rem", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative",
                cursor: "pointer", transition: "all 0.2s ease", textAlign: "left", width: "100%"
              }}>
              <div style={{ position: "absolute", top: "-10px", left: "1.5rem", background: "var(--color-espresso)", color: "#fff", padding: "0.2rem 0.75rem", borderRadius: "100px", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Best Value</div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 22, height: 22, borderRadius: "100%", border: selectedPackage === "bundle" ? "7px solid var(--color-espresso)" : "1.5px solid rgba(196,181,160,0.6)" }} />
                <div>
                  <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "var(--color-espresso)", fontSize: "1.05rem" }}>Pro + Build</p>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-stone)" }}>Bundle (4 Credits total)</span>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--color-espresso)" }}>₹29</div>
            </button>
            
          </div>

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handlePay}
              disabled={status === "processing"}
              className="btn-primary"
              style={{ fontSize: "0.9rem", padding: "0.875rem 2rem", opacity: status === "processing" ? 0.7 : 1, width: "100%", justifyContent: "center" }}
            >
              {status === "processing" ? "Processing..." : `Checkout — ₹${selectedPackage === "bundle" ? "29" : "19"}`}
            </button>
          </div>

          {status === "error" && (
            <p style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--color-clay)", background: "var(--color-clay-light)", padding: "0.625rem 1rem", borderRadius: "0.75rem" }}>
              {errorMsg}
            </p>
          )}

          <p style={{ fontSize: "0.72rem", color: "var(--color-stone-light)", textAlign: "center", marginTop: "1.5rem" }}>
            🔒 Secure checkout via Razorpay · Your data is never sold
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
