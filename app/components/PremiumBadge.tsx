const PremiumBadge = () => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: "0.375rem",
    padding: "0.3rem 0.875rem",
    background: "var(--color-olive)",
    color: "#FAF7F2",
    borderRadius: "100px",
    fontSize: "0.65rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  }}>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
    Premium
  </div>
);

export default PremiumBadge;
