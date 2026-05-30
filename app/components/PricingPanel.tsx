import { useState, useEffect } from "react";
import { initiatePayment } from "~/lib/payment";
import { useAppStore } from "~/lib/store";
import { checkPremiumStatus, type PremiumStatus } from "~/lib/premium";

const PricingPanel = () => {
  const { user } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<PremiumStatus | null>(null);

  useEffect(() => {
    checkPremiumStatus().then(setStatus);
  }, []);

  const handlePurchase = async (packageId: string) => {
    if (!user) return;
    setIsProcessing(true);
    
    try {
      await initiatePayment(
        import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        packageId,
        user.email || "",
        user.displayName || "",
        {
          onSuccess: async () => {
            alert("Payment successful! Credits added to your account.");
            const newStatus = await checkPremiumStatus();
            setStatus(newStatus);
            setIsProcessing(false);
          },
          onFailure: (err) => {
            alert(`Payment failed: ${err}`);
            setIsProcessing(false);
          },
          onDismiss: () => {
            setIsProcessing(false);
          }
        }
      );
    } catch (e: any) {
      alert(`Error: ${e.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span className="section-label">Credits & Plans</span>
        <h2 style={{ fontSize: "2.5rem", margin: "0.5rem 0 1rem" }}>Unlock AI Superpowers</h2>
        <p style={{ color: "var(--color-stone)", fontSize: "1.1rem" }}>
          You currently have <strong>{status?.optimizationCredits || 0}</strong> Auto-Optimize credits and <strong>{status?.buildCredits || 0}</strong> Build with AI credits.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {/* Package 1: Auto Optimize */}
        <div className="card-elevated" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", position: "relative" }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>Pro</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: 300, fontFamily: "var(--font-serif)", color: "var(--color-espresso)", marginBottom: "1rem" }}>
            ₹19
          </div>
          <p style={{ color: "var(--color-stone)", fontSize: "0.95rem", flex: 1 }}>
            Get 2 credits to automatically rewrite and optimize your existing résumés for specific job descriptions.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--color-sage-dark)" }}>✓</span> 2 Auto-Optimize Credits
            </li>
            <li style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--color-sage-dark)" }}>✓</span> FAANG-style Bullet Rewriting
            </li>
          </ul>
          <button 
            className="btn-secondary" 
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => handlePurchase("auto-optimize")}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Buy Pro"}
          </button>
        </div>

        {/* Package 2: Bundle */}
        <div className="card-elevated" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", position: "relative", border: "2px solid var(--color-olive)" }}>
          <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--color-olive)", color: "#fff", padding: "0.2rem 1rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Best Value
          </div>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>Pro + Build</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: 300, fontFamily: "var(--font-serif)", color: "var(--color-espresso)", marginBottom: "1rem" }}>
            ₹29
          </div>
          <p style={{ color: "var(--color-stone)", fontSize: "0.95rem", flex: 1 }}>
            Get the ultimate toolkit. 2 credits for Auto-Optimization AND 2 credits to Build from Scratch.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
              <span style={{ color: "var(--color-sage-dark)" }}>✓</span> 2 Auto-Optimize Credits
            </li>
            <li style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
              <span style={{ color: "var(--color-sage-dark)" }}>✓</span> 2 Build with AI Credits
            </li>
            <li style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--color-sage-dark)" }}>✓</span> Save ₹9
            </li>
          </ul>
          <button 
            className="btn-primary" 
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => handlePurchase("bundle")}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Unlock Pro + Build"}
          </button>
        </div>

        {/* Package 3: Build AI */}
        <div className="card-elevated" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", position: "relative" }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>Pro Build</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: 300, fontFamily: "var(--font-serif)", color: "var(--color-espresso)", marginBottom: "1rem" }}>
            ₹19
          </div>
          <p style={{ color: "var(--color-stone)", fontSize: "0.95rem", flex: 1 }}>
            Get 2 credits to generate a completely new, highly-optimized résumé from scratch using AI.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--color-sage-dark)" }}>✓</span> 2 Build with AI Credits
            </li>
            <li style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--color-sage-dark)" }}>✓</span> Professional Formatting
            </li>
          </ul>
          <button 
            className="btn-secondary" 
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => handlePurchase("build-ai")}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Buy Pro Build"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPanel;
