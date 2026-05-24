import { prepareBuilderPrompt, getRandomStyleSeed } from "../../constants";
import { queryGroq } from "./groq";
import { generateUUID } from "./utils";

export type BuildStep =
  | "idle"
  | "generating"
  | "saving"
  | "done"
  | "error";

export interface BuildProgress {
  step: BuildStep;
  message: string;
}

function extractJSON(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return text;
}

export async function buildResumeFromScratch(
  userData: any,
  onProgress: (p: BuildProgress) => void
): Promise<ResumeOptimization> {
  onProgress({ step: "generating", message: "AI is crafting your elite résumé from scratch…" });

  // Format the user data nicely for the AI
  let rawUserData = `Name: ${userData.fullName}
Email: ${userData.email}
Phone: ${userData.phone}
Location: ${userData.location}
LinkedIn: ${userData.linkedin}

Target Job Title: ${userData.targetJob}
Target Job Description: ${userData.jobDescription}

Professional Summary Draft/Ideas:
${userData.summary}

Experience:
${userData.experience.map((e: any) => `- ${e.title} at ${e.company} (${e.duration})\n  Details: ${e.details}`).join("\n\n")}

Projects:
${userData.projects.map((p: any) => `- ${p.name}\n  Tech: ${p.technologies}\n  Details: ${p.details}`).join("\n\n")}

Education:
${userData.education.map((e: any) => `- ${e.degree} at ${e.institution} (${e.year})`).join("\n")}

Skills/Keywords:
${userData.skills}
`;

  const prompt = prepareBuilderPrompt({
    jobTitle: userData.targetJob,
    jobDescription: userData.jobDescription,
    userData: rawUserData,
    styleSeed: getRandomStyleSeed(),
  });

  let response = "";
  try {
    // Use the massive 70B model for highest quality writing
    response = await queryGroq(prompt, "Build my resume.", "llama-3.3-70b-versatile", 90000, 4096);
  } catch (e) {
    throw new Error("AI builder returned no response from Groq.");
  }

  let parsedData: any;
  try {
    const raw = extractJSON(response);
    parsedData = JSON.parse(raw);
  } catch {
    throw new Error("Could not parse AI builder response. Please try again.");
  }

  onProgress({ step: "saving", message: "Applying dynamic theme and saving…" });

  // The builder returns { parsed: ParsedResume }
  // We need to shape this into a standard ResumeOptimization so we can view it in the app
  const themes = ["Modern", "Classic", "Minimalist", "Bold", "Creative", "Executive", "Sleek", "Elegant", "Tech", "Corporate"];
  
  const optimized: OptimizedResume = {
    parsed: parsedData.parsed,
    theme: themes[Math.floor(Math.random() * themes.length)],
    changeLog: [{ section: "All", change: "Built from scratch", reason: "AI generated based on user input" }],
    suggestedAdditions: [],
    atsScoreEstimate: Math.floor(Math.random() * (99 - 90 + 1)) + 90, // Random 90-99
  };

  // Mock a diagnosis since we built it from scratch
  const dummyDiagnosis: DeepDiagnosis = {
    criticalIssues: [],
    missingKeywords: [],
    weakBullets: [],
    structureProblems: [],
    atsWarnings: [],
    roleAlignmentScore: 95,
    overallReadiness: "excellent"
  };

  const result: ResumeOptimization = {
    resumeId: generateUUID(),
    diagnosis: dummyDiagnosis,
    optimized,
    createdAt: new Date().toISOString(),
  };

  return result;
}
