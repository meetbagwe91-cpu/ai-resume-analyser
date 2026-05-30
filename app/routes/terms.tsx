import Navbar from "~/components/Navbar";

export const meta = () => ([
  { title: "Resuman — Terms of Service" },
  { name: "description", content: "Terms of Service for Resuman." },
]);

const TermsOfService = () => {
  return (
    <div className="page-shell">
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Terms of Service</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--color-stone)", marginBottom: "3rem" }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="card-elevated" style={{ padding: "3rem", fontSize: "0.95rem", lineHeight: 1.7, color: "var(--color-espresso)" }}>
          <h2 style={{ fontSize: "1.5rem", marginTop: 0 }}>1. Agreement to Terms</h2>
          <p>
            By viewing or using this website, you agree to be bound by all of these Terms of Service. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>2. Use License</h2>
          <p>
            Permission is granted to temporarily use the materials on Resuman's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>
          <p>
            Under this license you may not:
          </p>
          <ul>
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose;</li>
            <li>attempt to decompile or reverse engineer any software contained on Resuman's website;</li>
            <li>remove any copyright or other proprietary notations from the materials;</li>
          </ul>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>3. Disclaimer</h2>
          <p>
            The materials on Resuman's website are provided on an 'as is' basis. Resuman makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 style={{ fontSize: "1.5rem", marginTop: "2rem" }}>4. AI Content Generation</h2>
          <p>
            Resuman utilizes artificial intelligence to provide résumé feedback and rewrites. While we strive for high quality, you are ultimately responsible for the accuracy and truthfulness of the content submitted to potential employers. We do not guarantee employment or specific ATS scores.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
