import Navbar from "~/components/Navbar";

export const meta = () => ([
  { title: "Resuman — Help Center" },
  { name: "description", content: "Frequently asked questions and support for Resuman." },
]);

const HelpCenter = () => {
  const faqs = [
    {
      q: "How does the ATS scoring work?",
      a: "We analyze your résumé against thousands of successful industry examples. Our algorithm checks for keyword density, formatting readability, action verbs, and structural components that Applicant Tracking Systems look for."
    },
    {
      q: "Is my data safe?",
      a: "Yes. All uploaded files are encrypted. Your data is stored securely in Firebase, and we do not use your personal information to train public AI models. You can delete your account and all associated files at any time from your Account Settings."
    },
    {
      q: "Can I cancel my premium subscription?",
      a: "Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your current billing cycle."
    },
    {
      q: "Why is my PDF failing to parse?",
      a: "Make sure your PDF contains selectable text. Scanned images or image-only PDFs cannot be read by our text extractor. Standard exports from Word, Google Docs, or Canva usually work best."
    }
  ];

  return (
    <div className="page-shell">
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Help Center & FAQ</h1>
        <p style={{ fontSize: "1.1rem", color: "var(--color-stone)", marginBottom: "3rem" }}>
          Everything you need to know about getting the most out of Resuman.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {faqs.map((faq, i) => (
            <div key={i} className="card-elevated" style={{ padding: "1.5rem 2rem" }}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", color: "var(--color-espresso)" }}>{faq.q}</h3>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-stone)", lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "4rem", padding: "2rem", background: "rgba(250,247,242,0.5)", borderRadius: "1.5rem", border: "1px solid rgba(196,181,160,0.3)", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem" }}>Still need help?</h3>
          <p style={{ margin: "0 0 1.5rem", fontSize: "0.95rem", color: "var(--color-stone)" }}>
            Our support team is always ready to assist you.
          </p>
          <a href="mailto:support@resuman.com" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
