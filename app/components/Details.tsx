import ScoreBadge from "./ScoreBadge";
import { Accordion, AccordionContent, AccordionHeader, AccordionItem } from "./Accordion";

type Tip = { type: "good" | "improve"; tip: string; explanation: string };

const TipCard = ({ tip }: { tip: Tip }) => (
  <div style={{
    display: "flex", gap: "0.875rem", alignItems: "flex-start",
    padding: "1rem 1.25rem",
    background: tip.type === "good" ? "var(--color-sage-light)" : "var(--color-amber-light)",
    borderRadius: "1rem",
    border: `1px solid ${tip.type === "good" ? "rgba(123,155,126,0.18)" : "rgba(184,137,42,0.15)"}`,
    transition: "transform 0.2s",
  }}
    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <div style={{
      width: 22, height: 22, borderRadius: "100%", flexShrink: 0, marginTop: "0.125rem",
      background: tip.type === "good" ? "var(--color-sage)" : "var(--color-amber-warm)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      {tip.type === "good" ? (
        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" /></svg>
      )}
    </div>
    <div>
      <p style={{ margin: 0, fontWeight: 600, color: "var(--color-espresso)", fontSize: "0.92rem", lineHeight: 1.4 }}>{tip.tip}</p>
      <p style={{ margin: "0.375rem 0 0", color: "var(--color-brown-mid)", fontSize: "0.86rem", lineHeight: 1.6 }}>{tip.explanation}</p>
    </div>
  </div>
);

const CategoryHeader = ({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
    <div style={{
      width: 36, height: 36, borderRadius: "0.75rem",
      background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brown-mid)"
    }}>{icon}</div>
    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-espresso)", fontSize: "1rem", flex: 1 }}>{title}</span>
    <ScoreBadge score={score} />
    <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: "1.3rem", color: "var(--color-espresso)" }}>{score}</span>
  </div>
);

const si = { fill: "none", stroke: "currentColor", strokeWidth: 1.5 } as React.SVGProps<SVGSVGElement>;

const Details = ({ feedback }: { feedback: Feedback }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <span className="section-label">Actionable Insights</span>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Accordion className="">
        {([
        { id: "tone", title: "Tone & Style", score: feedback.toneAndStyle.score, tips: feedback.toneAndStyle.tips, icon: <svg width={18} height={18} viewBox="0 0 24 24" {...si}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
        { id: "content", title: "Content Strength", score: feedback.content.score, tips: feedback.content.tips, icon: <svg width={18} height={18} viewBox="0 0 24 24" {...si}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: "structure", title: "Structure & Format", score: feedback.structure.score, tips: feedback.structure.tips, icon: <svg width={18} height={18} viewBox="0 0 24 24" {...si}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
        { id: "skills", title: "Skills Matching", score: feedback.skills.score, tips: feedback.skills.tips, icon: <svg width={18} height={18} viewBox="0 0 24 24" {...si}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
      ] as const).map(cat => (
        <AccordionItem key={cat.id} id={cat.id}>
          <AccordionHeader itemId={cat.id}>
            <CategoryHeader title={cat.title} score={cat.score} icon={cat.icon} />
          </AccordionHeader>
          <AccordionContent itemId={cat.id}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", paddingTop: "0.25rem" }}>
              {(cat.tips as Tip[]).map((tip, i) => <TipCard key={i} tip={tip} />)}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
      </Accordion>
    </div>
  </div>
);

export default Details;
