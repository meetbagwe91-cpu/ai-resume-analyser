import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

const Tooltip = ({ content, children, position = "top", delay = 300 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      timeoutRef.current = setTimeout(() => setShowTooltip(true), delay);
    } else {
      setShowTooltip(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible, delay]);

  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return { bottom: "100%", left: "50%", transform: "translateX(-50%) translateY(-8px)" };
      case "bottom":
        return { top: "100%", left: "50%", transform: "translateX(-50%) translateY(8px)" };
      case "left":
        return { right: "100%", top: "50%", transform: "translateY(-50%) translateX(-8px)" };
      case "right":
        return { left: "100%", top: "50%", transform: "translateY(-50%) translateX(8px)" };
    }
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block", cursor: "help" }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      aria-describedby="tooltip"
    >
      {children}
      {showTooltip && (
        <div
          role="tooltip"
          id="tooltip"
          className="anim-fade-up"
          style={{
            position: "absolute",
            zIndex: 1000,
            width: "max-content",
            maxWidth: 250,
            padding: "0.5rem 0.875rem",
            background: "var(--color-espresso)",
            color: "var(--color-cream)",
            fontSize: "0.75rem",
            fontWeight: 500,
            lineHeight: 1.4,
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(44,35,24,0.15)",
            pointerEvents: "none",
            textAlign: "center",
            ...getPositionStyles(),
          }}
        >
          {content}
          {/* Optional: Add an arrow if desired using pseudo-elements in CSS, but inline styles are tricky for pseudo-elements so we omit it for simplicity or handle it via a div */}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
