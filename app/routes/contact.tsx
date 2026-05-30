import Navbar from "~/components/Navbar";

export const meta = () => ([
  { title: "Resumate — Contact Us" },
  { name: "description", content: "Get in touch with the Resumate team." },
]);

const Contact = () => {
  return (
    <div className="page-shell">
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="section-label">Get in Touch</span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "0.5rem 0 1rem" }}>Contact Us</h1>
          <p style={{ fontSize: "1.1rem", color: "var(--color-stone)" }}>
            We're here to help you build the perfect résumé. Reach out to us through any of the channels below.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          
          {/* Customer Support */}
          <div className="card-elevated" style={{ padding: "2.5rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: "100%", background: "rgba(123,155,126,0.1)", color: "var(--color-olive)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.3rem", margin: "0 0 0.5rem" }}>Customer Support</h3>
            <p style={{ color: "var(--color-stone)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              Have questions about your credits, billing, or the AI analysis? Our support team typically responds within 24 hours.
            </p>
            <a href="mailto:support@resumate.com" style={{ fontWeight: 600, color: "var(--color-espresso)", textDecoration: "none" }}>
              support@resumate.com
            </a>
          </div>

          {/* Business Address */}
          <div className="card-elevated" style={{ padding: "2.5rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: "100%", background: "rgba(196,181,160,0.15)", color: "var(--color-brown-mid)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.3rem", margin: "0 0 0.5rem" }}>Registered Office</h3>
            <p style={{ color: "var(--color-stone)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              Resumate Technologies<br />
              Innovation Park, Tech Hub<br />
              Mumbai, Maharashtra 400001<br />
              India
            </p>
            <span style={{ fontSize: "0.85rem", color: "var(--color-stone-light)" }}>* Meetings by appointment only</span>
          </div>

        </div>

        <div className="card-elevated" style={{ marginTop: "3rem", padding: "3rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", margin: "0 0 1rem" }}>Frequently Asked Questions</h2>
          <p style={{ color: "var(--color-stone)", fontSize: "1rem", marginBottom: "2rem" }}>
            You might find the answer you're looking for in our Help Center.
          </p>
          <a href="/help" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none", padding: "0.8rem 2rem" }}>
            Visit Help Center
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(196,181,160,0.2)", padding: "3rem 2rem", textAlign: "center" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-stone-light)" }}>Resumate</span>
      </footer>
    </div>
  );
};

export default Contact;
