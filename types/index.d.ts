interface FSItem {
  id: string;
  uid: string;
  name: string;
  path: string;
  is_dir: boolean;
  parent_id: string;
  parent_uid: string;
  created: number;
  modified: number;
  accessed: number;
  size: number | null;
  writable: boolean;
}

interface PuterUser {
  uuid: string;
  username: string;
}

interface KVItem {
  key: string;
  value: string;
}

interface ChatMessageContent {
  type: "file" | "text";
  puter_path?: string;
  text?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | ChatMessageContent[];
}

interface PuterChatOptions {
  model?: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  tools?: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: { type: string; properties: {} };
    }[];
  };
}

interface AIResponse {
  index: number;
  message: {
    role: string;
    content: string | any[];
    refusal: null | string;
    annotations: any[];
  };
  logprobs: null | any;
  finish_reason: string;
  usage: {
    type: string;
    model: string;
    amount: number;
    cost: number;
  }[];
  via_ai_chat_service: boolean;
}

interface Job {
  title: string;
  description: string;
  location: string;
  requiredSkills: string[];
}

interface ResumeVersion {
  versionId: string;
  createdAt: string;
  atsScore: number;
  changesSummary: string;
  optimizationData?: OptimizedResume;
}

interface DownloadRecord {
  downloadedAt: string;
  format: "pdf";
  filename: string;
}

interface UserPreferences {
  favoriteTemplates: string[];
  careerField?: string;
  experienceLevel?: "entry" | "mid" | "senior" | "executive";
  targetRole?: string;
  resumeStyle?: "modern" | "classic" | "minimalist" | "bold" | "creative" | "executive" | "sleek" | "elegant" | "tech" | "corporate";
  tone?: "formal" | "modern" | "creative" | "minimal";
  updatedAt?: string;
}

interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
  optimization?: ResumeOptimization;
  createdAt?: string;
  isFavorite?: boolean;
  versions?: ResumeVersion[];
  downloads?: DownloadRecord[];
}

interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
    }[];
  };
  toneAndStyle: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  content: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  structure: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  skills: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
}

/* ============================================
   AUTO-OPTIMIZE FEATURE TYPES
   ============================================ */

/** Structured résumé data extracted by AI */
interface ParsedResume {
  fullName: string;
  contactInfo: {
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
    portfolio?: string;
  };
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    bullets: string[];
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
    details?: string;
  }[];
  certifications: string[];
  achievements: string[];
  additionalInfo?: string;
}

/** Deep diagnosis output from Phase 1 */
interface DeepDiagnosis {
  criticalIssues: {
    category: string;
    issue: string;
    impact: string;
    priority: "high" | "medium" | "low";
  }[];
  missingKeywords: string[];
  foundKeywords?: string[];
  weakBullets: {
    original: string;
    reason: string;
  }[];
  structureProblems: string[];
  atsWarnings: string[];
  roleAlignmentScore: number;
  overallReadiness: "poor" | "fair" | "good" | "excellent";
  suggestedJobTitles?: string[];
}

/** Optimized résumé output from Phase 2 */
interface OptimizedResume {
  parsed: ParsedResume;
  theme?: string;
  changeLog: {
    section: string;
    change: string;
    reason: string;
  }[];
  suggestedAdditions: {
    section: string;
    suggestion: string;
    note: string;
  }[];
  atsScoreEstimate: number;
}

/** Stored optimization result */
interface ResumeOptimization {
  resumeId: string;
  diagnosis: DeepDiagnosis;
  optimized: OptimizedResume;
  createdAt: string;
}

/** Premium status */
interface PremiumStatus {
  isPremium: boolean;
  paymentId?: string;
  activatedAt?: string;
  plan?: string;
}
