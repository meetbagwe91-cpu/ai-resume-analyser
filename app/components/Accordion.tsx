import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";

interface AccordionContextType {
  activeItems: string[];
  toggleItem: (id: string) => void;
  isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);
const useAccordion = () => {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within an Accordion");
  return ctx;
};

interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ children, defaultOpen, allowMultiple = false, className = "" }) => {
  const [activeItems, setActiveItems] = useState<string[]>(defaultOpen ? [defaultOpen] : []);
  const toggleItem = (id: string) =>
    setActiveItems(prev => allowMultiple
      ? prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      : prev.includes(id) ? [] : [id]);
  const isItemActive = (id: string) => activeItems.includes(id);
  return (
    <AccordionContext.Provider value={{ activeItems, toggleItem, isItemActive }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps { id: string; children: ReactNode; className?: string; }
export const AccordionItem: React.FC<AccordionItemProps> = ({ id, children, className = "" }) => {
  const { isItemActive } = useAccordion();
  const active = isItemActive(id);
  return (
    <div className={className} style={{
      background: "var(--color-parchment)",
      borderRadius: "1.5rem",
      border: `1px solid ${active ? "rgba(168,152,128,0.4)" : "rgba(196,181,160,0.2)"}`,
      overflow: "hidden",
      transition: "border-color 0.3s, box-shadow 0.3s",
      boxShadow: active ? "0 4px 20px rgba(44,35,24,0.05)" : "none",
    }}>{children}</div>
  );
};

interface AccordionHeaderProps { itemId: string; children: ReactNode; className?: string; }
export const AccordionHeader: React.FC<AccordionHeaderProps> = ({ itemId, children, className = "" }) => {
  const { toggleItem, isItemActive } = useAccordion();
  const active = isItemActive(itemId);
  return (
    <button onClick={() => toggleItem(itemId)} className={className}
      style={{
        width: "100%", padding: "1.375rem 1.75rem", textAlign: "left", border: "none", cursor: "pointer",
        background: active ? "rgba(237,232,223,0.5)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
        transition: "background 0.25s",
      }}>
      <div style={{ flex: 1 }}>{children}</div>
      <div style={{
        width: 30, height: 30, borderRadius: "100%", flexShrink: 0,
        background: active ? "var(--color-olive)" : "var(--color-cream-warm)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.25s, transform 0.35s",
        transform: active ? "rotate(180deg)" : "rotate(0deg)",
        color: active ? "#FAF7F2" : "var(--color-stone)",
      }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
};

interface AccordionContentProps { itemId: string; children: ReactNode; className?: string; }
export const AccordionContent: React.FC<AccordionContentProps> = ({ itemId, children, className = "" }) => {
  const { isItemActive } = useAccordion();
  const active = isItemActive(itemId);
  return (
    <div className={`accordion-content-wrapper${active ? " open" : ""}`}>
      <div className="accordion-inner">
        <div style={{ padding: "0 1.75rem 1.75rem" }} className={className}>{children}</div>
      </div>
    </div>
  );
};
