import {
  prepareDeepDiagnosisPrompt,
  prepareOptimizationPrompt,
  getRandomStyleSeed
} from "../../constants";

export type OptimizeStep =
  | "idle"
  | "diagnosis"
  | "optimizing"
  | "saving"
  | "done"
  | "error";

export interface OptimizeProgress {
  step: OptimizeStep;
  message: string;
}

function extractJSON(raw: string): string {
  let text = raw.trim();
  // Strip markdown code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return text;
}

function parseAIResponse(response: any): string {
  const content = response?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c: any) => (typeof c === "string" ? c : c?.text ?? ""))
      .join("");
  }
  return JSON.stringify(content);
}

/**
 * Two-phase AI optimization orchestrator.
 * Phase 1: Deep diagnosis of résumé weaknesses.
 * Phase 2: Full rewrite of the résumé content.
 */
import { queryGroq } from "./groq";

export async function runOptimization(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  existingFeedback: Feedback,
  onProgress: (p: OptimizeProgress) => void
): Promise<ResumeOptimization> {
  /* ── PHASE 1: Deep Diagnosis ── */
  onProgress({ step: "diagnosis", message: "Performing deep résumé diagnosis…" });

  const diagnosisPrompt = prepareDeepDiagnosisPrompt({
    jobTitle,
    jobDescription,
    existingFeedback: JSON.stringify(existingFeedback),
  });

  const userMessage1 = `Here is my parsed résumé text:\n\n${resumeText}`;
  let diagnosisResponse = "";
  try {
    diagnosisResponse = await queryGroq(diagnosisPrompt, userMessage1, "llama-3.3-70b-versatile", 90000, 2048);
  } catch (e) {
    throw new Error("AI diagnosis returned no response from Groq.");
  }

  let diagnosis: DeepDiagnosis;
  try {
    const raw = extractJSON(diagnosisResponse);
    diagnosis = JSON.parse(raw);
  } catch {
    throw new Error("Could not parse AI diagnosis response. Please try again.");
  }

  /* ── PHASE 2: Optimization / Rewrite ── */
  onProgress({ step: "optimizing", message: "Rewriting and optimizing your résumé…" });

  const optimizationPrompt = prepareOptimizationPrompt({
    jobTitle,
    jobDescription,
    diagnosis: JSON.stringify(diagnosis),
    styleSeed: getRandomStyleSeed(),
  });

  const userMessage2 = `Here is my parsed résumé text:\n\n${resumeText}`;
  let optimizationResponse = "";
  try {
    optimizationResponse = await queryGroq(optimizationPrompt, userMessage2, "llama-3.3-70b-versatile", 90000, 4096);
  } catch (e) {
    throw new Error("AI optimization returned no response from Groq.");
  }

  let optimized: OptimizedResume;
  try {
    const raw = extractJSON(optimizationResponse);
    optimized = JSON.parse(raw);
    
    // Assign a random visual theme
    const themes = ["Modern", "Classic", "Minimalist", "Bold", "Creative", "Executive"];
    optimized.theme = themes[Math.floor(Math.random() * themes.length)];
  } catch {
    throw new Error("Could not parse AI optimization response. Please try again.");
  }

  onProgress({ step: "saving", message: "Saving your optimized résumé…" });

  const result: ResumeOptimization = {
    resumeId: "",
    diagnosis,
    optimized,
    createdAt: new Date().toISOString(),
  };

  return result;
}
