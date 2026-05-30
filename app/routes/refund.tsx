import Navbar from "~/components/Navbar";

export const meta = () => ([
  { title: "Resumate — Refund Policy" },
  { name: "description", content: "Refund and cancellation policy for Resumate." },
]);

const RefundPolicy = () => {
  return (
    <div className="page-shell">
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Refund & Cancellation Policy</h1>
        <p style={{ fontSize: "1.1rem", color: "var(--color-stone)", marginBottom: "3rem" }}>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="card-elevated" style={{ padding: "3rem", fontSize: "0.95rem", lineHeight: 1.7, color: "var(--color-espresso)" }}>
          <h2 style={{ fontSize: "1.5rem", marginTop: 0 }}>1. Digital Goods & Services</h2>
          <p>
            Resumate provides AI-powered résumé analysis and building services. Because our products are digital and delivered immediately upon purchase in the form of "Credits", we generally do not offer refunds once a purchase has been completed.
          </p>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>2. Exception Policy</h2>
          <p>
            Refunds may be issued at our sole discretion under the following exceptional circumstances:
          </p>
          <ul>
            <li>If you were charged multiple times for the same transaction due to a technical error.</li>
            <li>If the AI service completely fails to deliver the promised output and our technical team is unable to resolve the issue within 5 business days.</li>
          </ul>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>3. Used Credits</h2>
          <p>
            Under no circumstances will a refund be issued for credits that have already been partially or fully consumed. The use of a credit constitutes full acceptance of the digital delivery.
          </p>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>4. Requesting a Refund</h2>
          <p>
            If you believe you are eligible for a refund under our exception policy, please contact our support team within 7 days of your purchase. You must include your receipt and a detailed explanation of the issue.
          </p>
          <p>
            To submit a request, visit our <a href="/contact" style={{ color: "var(--color-olive)", textDecoration: "none", fontWeight: 500 }}>Contact Us</a> page or email us at support@resumate.com.
          </p>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>5. Processing Time</h2>
          <p>
            If your refund is approved, it will be processed and automatically applied to your original method of payment within 5-7 business days, depending on your bank or credit card issuer.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(196,181,160,0.2)", padding: "3rem 2rem", textAlign: "center" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-stone-light)" }}>Resumate</span>
      </footer>
    </div>
  );
};

export default RefundPolicy;
