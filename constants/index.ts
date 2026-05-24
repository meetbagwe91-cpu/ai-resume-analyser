export const resumes: Resume[] = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume-1.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      ATS: { score: 90, tips: [] },
      toneAndStyle: { score: 90, tips: [] },
      content: { score: 90, tips: [] },
      structure: { score: 90, tips: [] },
      skills: { score: 90, tips: [] },
    },
  },
  {
    id: "2",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume-2.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      ATS: { score: 90, tips: [] },
      toneAndStyle: { score: 90, tips: [] },
      content: { score: 90, tips: [] },
      structure: { score: 90, tips: [] },
      skills: { score: 90, tips: [] },
    },
  },
  {
    id: "3",
    companyName: "Apple",
    jobTitle: "iOS Developer",
    imagePath: "/images/resume-3.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 75,
      ATS: { score: 90, tips: [] },
      toneAndStyle: { score: 90, tips: [] },
      content: { score: 90, tips: [] },
      structure: { score: 90, tips: [] },
      skills: { score: 90, tips: [] },
    },
  },
];

/* ============================================
   EXISTING — ATS Analysis Prompt
   ============================================ */

/**
 * A concrete example output — much more reliable than abstract schemas.
 * Models follow example JSON far more accurately than pseudo-type notation.
 */
export const AIResponseFormat = `{
  "overallScore": 72,
  "ATS": {
    "score": 68,
    "tips": [
      { "type": "improve", "tip": "Add more industry keywords" },
      { "type": "good",    "tip": "Clean single-column layout" },
      { "type": "improve", "tip": "Use standard section headers" }
    ]
  },
  "toneAndStyle": {
    "score": 75,
    "tips": [
      { "type": "improve", "tip": "Weak action verbs",         "explanation": "Replace passive phrases like 'was responsible for' with strong verbs like 'Led' or 'Delivered'." },
      { "type": "good",    "tip": "Consistent tense",          "explanation": "Past tense is used correctly for previous roles throughout." },
      { "type": "improve", "tip": "Reduce personal pronouns",  "explanation": "Resumes should not use 'I' or 'my'; remove them for a professional tone." }
    ]
  },
  "content": {
    "score": 70,
    "tips": [
      { "type": "improve", "tip": "No quantified achievements",   "explanation": "Add numbers or percentages to bullets, e.g. 'Reduced load time by 40%'." },
      { "type": "good",    "tip": "Relevant experience shown",     "explanation": "Experience sections align well with the target role requirements." },
      { "type": "improve", "tip": "Summary is too generic",        "explanation": "Tailor the summary to the specific role and company instead of using a generic objective statement." }
    ]
  },
  "structure": {
    "score": 80,
    "tips": [
      { "type": "good",    "tip": "Logical section order",          "explanation": "Experience before education is the correct order for experienced candidates." },
      { "type": "improve", "tip": "Skills section lacks grouping",  "explanation": "Group skills by category (Languages, Frameworks, Tools) for faster ATS parsing." },
      { "type": "improve", "tip": "No projects section",           "explanation": "Adding a Projects section significantly boosts ATS keyword density for technical roles." }
    ]
  },
  "skills": {
    "score": 65,
    "tips": [
      { "type": "improve", "tip": "Missing role-critical keywords", "explanation": "The job description mentions Docker and Kubernetes but neither appears in the resume." },
      { "type": "good",    "tip": "Core stack is well represented", "explanation": "React, Node.js and TypeScript are all present and match the JD requirements." },
      { "type": "improve", "tip": "Soft skills not demonstrated",  "explanation": "Mention collaboration and communication through achievement bullets rather than listing them as skills." }
    ]
  }
}`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
  AIResponseFormat,
}: {
  jobTitle: string;
  jobDescription: string;
  AIResponseFormat: string;
}) => {
  const jd = jobDescription
    ? `Job description (first 600 chars): ${jobDescription.slice(0, 600)}`
    : "No job description provided — analyze for the role generally.";

  return `You are a professional resume analyst and ATS expert.

Analyze the resume below for this role: ${jobTitle}
${jd}

INSTRUCTIONS:
- Score each section honestly from 0 to 100. Low scores are fine if deserved.
- Give exactly 3 tips per section (mix of "good" and "improve").
- Keep explanations to 1-2 clear sentences.
- Use the EXACT same JSON structure as the example below.
- Return ONLY the JSON object. No extra text, no markdown, no backticks.

EXACT OUTPUT FORMAT TO FOLLOW:
${AIResponseFormat}`;
};


/* ============================================
   AUTO-OPTIMIZE — Deep Diagnosis Prompt (Phase 1)
   ============================================ */
export const DiagnosisResponseFormat = `{
  "criticalIssues": [
    { "category": "ATS|Content|Structure|Skills|Keywords|Alignment", "issue": "string", "impact": "string", "priority": "high|medium|low" }
  ],
  "missingKeywords": ["string"],
  "weakBullets": [
    { "original": "the exact weak bullet text", "reason": "why it is weak" }
  ],
  "structureProblems": ["string"],
  "atsWarnings": ["string"],
  "roleAlignmentScore": 0-100,
  "overallReadiness": "poor|fair|good|excellent"
}`;

export const prepareDeepDiagnosisPrompt = ({
  jobTitle,
  jobDescription,
  existingFeedback,
}: {
  jobTitle: string;
  jobDescription: string;
  existingFeedback: string;
}) =>
  `You are a world-class professional résumé auditor and ATS expert.

TASK: Perform a DEEP DIAGNOSIS of this résumé. Go far beyond surface-level feedback.

TARGET ROLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription || "Not provided — analyze for the target role generally."}

PREVIOUS BASIC ANALYSIS (for context): ${existingFeedback}

ANALYZE EVERY ASPECT:
1. ATS COMPATIBILITY: Will this résumé pass automated screening? Check section headers, formatting, keyword density, file structure.
2. KEYWORD GAPS: What role-critical keywords are missing? Compare against the job description.
3. WEAK BULLET POINTS: Find every bullet that is vague, lacks metrics, uses passive voice, or doesn't show impact. Quote each one exactly.
4. STRUCTURE: Is the section order optimal? Are headers ATS-standard? Is there wasted space?
5. CONTENT: Is the summary too generic? Are skills relevant? Are achievements quantified?
6. ROLE ALIGNMENT: How well does this résumé target the specific role?
7. MISSING SECTIONS: Is anything critical missing (summary, skills, projects)?

Be brutally honest. The user is paying for this analysis to improve.

OUTPUT FORMAT: Return ONLY valid JSON matching this schema:
${DiagnosisResponseFormat}

Return the analysis as a JSON object, without any other text and without backticks.
Do not include any other text or comments.`;


/* ============================================
   AUTO-OPTIMIZE — Résumé Rewriting Prompt (Phase 2)
   ============================================ */
export const OptimizationResponseFormat = `{
  "parsed": {
    "fullName": "string",
    "contactInfo": { "email": "string", "phone": "string", "linkedin": "string", "location": "string", "portfolio": "string" },
    "summary": "A powerful, role-specific professional summary (2-3 sentences)",
    "skills": ["skill1", "skill2"],
    "experience": [
      { "title": "Job Title", "company": "Company Name", "duration": "Month Year – Month Year", "bullets": ["Impact-driven bullet with metrics"] }
    ],
    "projects": [
      { "name": "Project Name", "description": "Brief description", "technologies": ["tech1"], "bullets": ["What you built and its impact"] }
    ],
    "education": [
      { "degree": "Degree Name", "institution": "University", "year": "Year", "details": "Optional honors/GPA" }
    ],
    "certifications": ["Cert name"],
    "achievements": ["Achievement"],
    "additionalInfo": "Optional"
  },
  "changeLog": [
    { "section": "Summary|Experience|Skills|etc", "change": "What was changed", "reason": "Why it improves the résumé" }
  ],
  "suggestedAdditions": [
    { "section": "Skills|Projects|etc", "suggestion": "What to add", "note": "Add this only if accurate" }
  ],
  "atsScoreEstimate": 0-100
}`;

export const prepareOptimizationPrompt = ({
  jobTitle,
  jobDescription,
  diagnosis,
  styleSeed,
}: {
  jobTitle: string;
  jobDescription: string;
  diagnosis: string;
  styleSeed: string;
}) =>
  `You are a world-class professional résumé writer and career strategist.

TASK: Read the résumé in the attached file, then REWRITE it into a stronger, ATS-optimized version.

TARGET ROLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription || "Not provided — optimize for the target role generally."}

DEEP DIAGNOSIS OF CURRENT RÉSUMÉ: ${diagnosis}

WRITING STYLE DIRECTIVE:
${styleSeed}

REWRITING RULES — FOLLOW STRICTLY:
1. RADICAL TRANSFORMATION: Do NOT just lightly edit the original text. You must radically rewrite it to sound like a top 1% FAANG candidate. Elevate the language, structure, and perceived impact heavily.
2. PRESERVE TRUTH: Keep the user's FULL NAME exactly as it appears. Keep all real companies, job titles, dates, degrees, institutions, and certifications exactly as they appear. NEVER invent experience.
3. ELITE BULLETS (XYZ FORMULA): Rewrite ALL weak bullets using the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]". 
   - BAD: "Worked on the database to make it faster."
   - ELITE: "Architected and optimized PostgreSQL indexing strategy for the core analytics engine, reducing query latency by 40% and accelerating dashboard load times by 2.5s."
4. HARVARD BUSINESS TONE: Use a highly professional, aggressive, active-voice tone. Remove all personal pronouns, filler words, and weak phrasing (e.g., "helped with", "responsible for").
5. METRICS & IMPACT: Always highlight quantifiable impact and business value. If exact numbers aren't provided, use extremely powerful impact phrasing like "driving substantial efficiency gains", "scaling infrastructure", or "streamlining operations" to convey high value without hallucinating specific numbers.
6. STRENGTHEN SUMMARY: Write a concise, powerful 2-sentence professional summary tailored to the target role that acts as a compelling, high-impact executive pitch.
7. OPTIMIZE KEYWORDS: Aggressively weave in the missing keywords identified in the diagnosis to ensure it dominates ATS filters for the target role.
8. FIX STRUCTURE: Use standard ATS-friendly section headers (Professional Summary, Experience, Education, Skills, Projects, Certifications).
9. IMPROVE SKILLS: Group skills logically. Remove irrelevant or basic skills (e.g., "Microsoft Word"). Add role-critical ones only if clearly implied by the experience.
10. POWER VERBS ONLY: Start EVERY bullet with a high-impact action verb (e.g., Spearheaded, Engineered, Orchestrated, Overhauled, Conceptualized).
11. SUGGESTED ADDITIONS: If the résumé is extremely sparse, put strong suggestions in suggestedAdditions with a note like "Add this specific metric if accurate".
12. CHANGELOG: Document every significant change you make and WHY.
13. CREATIVE VARIANCE: You MUST use high entropy and extreme creativity when rewriting the bullets. Do not use the same formulaic phrasing for every resume. Vary the verbs, the structure of the accomplishments, and the storytelling for maximum uniqueness!

OUTPUT FORMAT: Return ONLY valid JSON matching this schema:
${OptimizationResponseFormat}

Return the optimized résumé as a JSON object, without any other text and without backticks.
Do not include any other text or comments.`;


/* ============================================
   STYLE SEEDS (For forcing unique outputs)
   ============================================ */
export const WRITING_STYLE_SEEDS = [
  "Use a highly aggressive, impact-obsessed writing style. Focus on massive scale and financial impact.",
  "Write with a narrative, storytelling approach. Emphasize the 'why' behind the accomplishments and the challenges overcome.",
  "Be ultra-concise and technical. Strip out all fluff and focus heavily on architecture, technologies, and precise metrics.",
  "Adopt a persuasive, executive tone. Focus on leadership, cross-functional collaboration, and strategic vision.",
  "Use a creative and dynamic tone. Focus on innovation, out-of-the-box thinking, and pushing boundaries.",
  "Write with a highly structured, logical flow. Every bullet should clearly define a problem, action, and result.",
];

export const getRandomStyleSeed = () => WRITING_STYLE_SEEDS[Math.floor(Math.random() * WRITING_STYLE_SEEDS.length)];


/* ============================================
   AUTO-BUILDER (Create from scratch)
   ============================================ */
export const BuilderResponseFormat = `{
  "parsed": {
    "fullName": "string",
    "contactInfo": { "email": "string", "phone": "string", "linkedin": "string", "location": "string", "portfolio": "string" },
    "summary": "A powerful, role-specific professional summary (2-3 sentences)",
    "skills": ["skill1", "skill2"],
    "experience": [
      { "title": "Job Title", "company": "Company Name", "duration": "Month Year – Month Year", "bullets": ["Impact-driven bullet with metrics"] }
    ],
    "projects": [
      { "name": "Project Name", "description": "Brief description", "technologies": ["tech1"], "bullets": ["What you built and its impact"] }
    ],
    "education": [
      { "degree": "Degree Name", "institution": "University", "year": "Year", "details": "Optional honors/GPA" }
    ],
    "certifications": ["Cert name"],
    "achievements": ["Achievement"],
    "additionalInfo": "Optional"
  }
}`;

export const prepareBuilderPrompt = ({
  jobTitle,
  jobDescription,
  userData,
  styleSeed,
}: {
  jobTitle: string;
  jobDescription: string;
  userData: string;
  styleSeed: string;
}) =>
  `You are a world-class professional résumé writer and career strategist.

TASK: The user has provided their raw career details. You must build a complete, ATS-optimized, highly compelling résumé from scratch.

TARGET ROLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription || "Not provided — optimize for the target role generally."}

USER DATA:
${userData}

WRITING STYLE DIRECTIVE:
${styleSeed}

REWRITING RULES — FOLLOW STRICTLY:
1. MAXIMIZE IMPACT: Transform the raw user data into elite, FAANG-level bullets. 
2. PRESERVE TRUTH: Keep all real companies, job titles, dates, degrees, institutions, and certifications exactly as provided. Do not hallucinate entire jobs.
3. ELITE BULLETS (XYZ FORMULA): Use the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]". 
4. METRICS: If the user didn't provide exact numbers, use powerful qualitative impact phrasing like "driving substantial efficiency gains" or "scaling infrastructure".
5. SUMMARY: Write a concise, powerful 2-sentence professional summary tailored to the target role.
6. KEYWORDS: Aggressively weave in keywords relevant to the Target Role and Job Description.
7. SKILLS: Extract and group skills logically based on the user's data.

OUTPUT FORMAT: Return ONLY valid JSON matching this schema:
${BuilderResponseFormat}

Return the JSON object, without any other text and without backticks.`;
