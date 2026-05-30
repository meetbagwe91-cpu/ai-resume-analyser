import { useState } from "react";
import { useAppStore } from "~/lib/store";

const SupportWidget = () => {
  const { user } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("general");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setIsSending(true);
    try {
      const { db } = await import("~/lib/firebase");
      const { collection, addDoc } = await import("firebase/firestore");
      
      await addDoc(collection(db, "support_tickets"), {
        userId: user.uid,
        email: user.email,
        name: user.displayName,
        subject,
        message,
        status: "open",
        createdAt: new Date().toISOString(),
      });
      
      setIsSent(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSent(false);
        setMessage("");
      }, 3000);
    } catch (e) {
      console.error("Failed to send support message:", e);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return null; // Only show for logged in users

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary support-widget-btn"
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 99,
          borderRadius: "100px",
          padding: "0.875rem 1.25rem",
          boxShadow: "0 8px 24px rgba(44,35,24,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {isOpen ? (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span style={{ fontSize: "0.85rem" }}>Support</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="card-elevated anim-scale-in" style={{
          position: "fixed",
          bottom: "5.5rem",
          right: "2rem",
          zIndex: 98,
          width: "340px",
          padding: "1.5rem",
          borderRadius: "1.25rem",
          background: "rgba(250,247,242,0.98)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 12px 40px rgba(44,35,24,0.15)",
        }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>How can we help?</h3>
          <p style={{ margin: "0 0 1.25rem", fontSize: "0.8rem", color: "var(--color-stone)" }}>
            Send us a message and we'll get back to you via email shortly.
          </p>

          {isSent ? (
            <div style={{
              padding: "1rem", borderRadius: "0.75rem", background: "var(--color-sage-light)",
              border: "1px solid rgba(123,155,126,0.3)", color: "var(--color-sage)",
              textAlign: "center", fontSize: "0.85rem", fontWeight: 500,
            }}>
              ✓ Message sent! We'll be in touch.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-stone)", marginBottom: "0.4rem" }}>
                  Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: "100%", padding: "0.7rem", borderRadius: "0.5rem",
                    border: "1px solid rgba(196,181,160,0.5)", background: "#fff",
                    fontSize: "0.85rem", color: "var(--color-espresso)", outline: "none",
                  }}
                >
                  <option value="general">General Question</option>
                  <option value="billing">Billing & Premium</option>
                  <option value="bug">Report a Bug</option>
                  <option value="feedback">Feature Request</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-stone)", marginBottom: "0.4rem" }}>
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue..."
                  rows={4}
                  required
                  style={{
                    width: "100%", padding: "0.7rem", borderRadius: "0.5rem",
                    border: "1px solid rgba(196,181,160,0.5)", background: "#fff",
                    fontSize: "0.85rem", color: "var(--color-espresso)", outline: "none",
                    resize: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="btn-primary"
                style={{ justifyContent: "center", padding: "0.75rem", fontSize: "0.8rem", opacity: isSending || !message.trim() ? 0.6 : 1 }}
              >
                {isSending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default SupportWidget;
