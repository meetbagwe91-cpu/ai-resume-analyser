import { useState } from "react";
import { checkPremiumStatus, type PremiumStatus } from "~/lib/premium";
import { initiatePayment } from "~/lib/payment";
import { useAppStore } from "~/lib/store";
import { useEffect } from "react";

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
          },
        }
      );
    } catch (e: any) {
      alert(`Error: ${e.message}`);
      setIsProcessing(false);
    }
  };

  const packages = [
    {
      id: "auto-optimize",
      name: "Pro",
      price: "₹19",
      tagline: "Optimize existing résumés",
      description: "Get 2 credits to automatically rewrite and optimize your résumés for specific job descriptions.",
      features: ["2 Auto-Optimize Credits", "FAANG-style Bullet Rewriting", "ATS Keyword Optimization"],
      featured: false,
      cta: "Buy Pro",
    },
    {
      id: "bundle",
      name: "Pro + Build",
      price: "₹29",
      tagline: "Complete AI toolkit",
      description: "Get the ultimate toolkit: 2 credits for Auto-Optimization AND 2 credits to Build from Scratch.",
      features: ["2 Auto-Optimize Credits", "2 Build with AI Credits", "Save ₹9 vs separate purchase"],
      featured: true,
      cta: "Unlock Pro + Build",
    },
    {
      id: "build-ai",
      name: "Pro Build",
      price: "₹19",
      tagline: "Build from scratch",
      description: "Get 2 credits to generate a completely new, highly-optimized résumé from scratch using AI.",
      features: ["2 Build with AI Credits", "Professional Formatting", "Role-specific Customization"],
      featured: false,
      cta: "Buy Pro Build",
    },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span className="section-label">Credits & Plans</span>
        <h2 style={{ marginTop: "0.5rem", marginBottom: "0.875rem" }}>Unlock AI Superpowers</h2>
        <p style={{ fontSize: "1rem" }}>
          You currently have{" "}
          <strong style={{ color: "var(--color-espresso)" }}>{status?.optimizationCredits ?? 0}</strong>
          {" "}Auto-Optimize credits and{" "}
          <strong style={{ color: "var(--color-espresso)" }}>{status?.buildCredits ?? 0}</strong>
          {" "}Build with AI credits.
        </p>
      </div>

      {/* Pricing cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.5rem",
      }}>
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className={pkg.featured ? "card-elevated pricing-card-featured" : "card-elevated"}
            style={{
              padding: "2.5rem",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Best value badge */}
            {pkg.featured && (
              <div style={{
                position: "absolute",
                top: "-13px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--color-espresso)",
                color: "var(--color-ivory)",
                padding: "0.25rem 1rem",
                borderRadius: "100px",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                Best Value
              </div>
            )}

            {/* Plan name */}
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{pkg.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--color-stone)", marginBottom: "1.25rem" }}>
              {pkg.tagline}
            </p>

            {/* Price */}
            <div style={{ marginBottom: "1.25rem" }}>
              <span style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.8rem",
                fontWeight: 400,
                color: "var(--color-espresso)",
                lineHeight: 1,
              }}>
                {pkg.price}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--color-stone)", marginLeft: "0.25rem" }}>
                one-time
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "1.5rem", flex: 1 }}>
              {pkg.description}
            </p>

            {/* Divider */}
            <div className="divider-solid" style={{ marginBottom: "1.5rem" }} />

            {/* Features */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {pkg.features.map((feat, i) => (
                <li key={i} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", fontSize: "0.88rem" }}>
                  <div style={{
                    width: 18, height: 18,
                    borderRadius: "100%",
                    background: "var(--color-sage-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: "1px",
                  }}>
                    <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="var(--color-sage-dark)" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span style={{ color: "var(--color-espresso)" }}>{feat}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              className={pkg.featured ? "btn-primary" : "btn-secondary"}
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => handlePurchase(pkg.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className={`spinner ${pkg.featured ? "spinner-light" : ""}`} style={{ width: 14, height: 14 }} />
                  Processing…
                </>
              ) : pkg.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Money-back note */}
      <p style={{
        textAlign: "center",
        marginTop: "2rem",
        fontSize: "0.78rem",
        color: "var(--color-stone-light)",
      }}>
        Secure payment via Razorpay · Credits added instantly · All prices in INR
      </p>
    </div>
  );
};

export default PricingPanel;
