import Navbar from "~/components/Navbar";

export const meta = () => ([
  { title: "Resumate — Privacy Policy" },
  { name: "description", content: "Privacy Policy for Resumate." },
]);

const PrivacyPolicy = () => {
  return (
    <div className="page-shell">
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Privacy Policy</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--color-stone)", marginBottom: "3rem" }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="card-elevated" style={{ padding: "3rem", fontSize: "0.95rem", lineHeight: 1.7, color: "var(--color-espresso)" }}>
          <h2 style={{ fontSize: "1.5rem", marginTop: 0 }}>1. Introduction</h2>
          <p>
            Welcome to Resumate. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
          </p>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>2. Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you:
          </p>
          <ul>
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Document Data:</strong> includes résumés, job descriptions, and related professional materials you upload.</li>
          </ul>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., analyzing your résumé).</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>4. Data Security & Retention</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. 
          </p>
          <p>
            <strong>Data Retention:</strong> We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for. You can request immediate deletion of your account and all associated files from your account dashboard at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
