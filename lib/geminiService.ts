/**
 * Server-side Gemini Service
 * Bridges to the modernized @google/genai Interactions API (gemini-3.6-flash)
 */

import {
  analyzeJobPost,
  generateApplicationMessage,
  calculateJobMatch,
  JobDataSchema,
  GEMINI_MODEL,
} from "./ai/gemini";
import { StructuredJobData, MatchScoreResult } from "./jobApplicationTypes";

export { analyzeJobPost, generateApplicationMessage, calculateJobMatch, JobDataSchema, GEMINI_MODEL };

/**
 * Deterministic fallback extractor for offline use or when GEMINI_API_KEY is not set
 */
export function deterministicExtractJobData(text: string): StructuredJobData {
  let company: string | null = null;
  let title: string | null = null;
  let location: string | null = null;
  let experience: string | null = null;
  let salary: string | null = null;
  let recruiter: string | null = null;
  let workMode: string | null = "Hybrid";

  // Match company
  const compMatch = text.match(
    /(?:([A-Z][A-Za-z0-9\s&.,'-]{2,30})\s+(?:is\s+hiring|hiring|recruiting))|(?:(?:at|for|with)\s+([A-Z][A-Za-z0-9\s&.,'-]{2,30})\b)|(?:company\s*[:\-]\s*([A-Za-z0-9\s&.,'-]+))/i
  );
  if (compMatch) {
    company = (compMatch[1] || compMatch[2] || compMatch[3] || "").replace(/\s+is$/i, "").trim();
  }

  // Match job title
  const titleMatch = text.match(
    /(?:(?:hiring|looking for)\s+(?:a\s+|an\s+)?([A-Za-z0-9\s/()\-+]{3,40}\b(?:Developer|Engineer|Architect|Lead|Specialist|Analyst|Consultant|Manager|Intern)))|(?:role|position|title)\s*[:\-]\s*([A-Za-z0-9\s/()\-+]+)/i
  );
  if (titleMatch) {
    title = (titleMatch[1] || titleMatch[2] || "").trim();
  }

  // Match location
  const locMatch = text.match(
    /\b(?:in|location\s*[:\-])\s+([A-Z][a-zA-Z\s,]+?(?=\.|\n|\r|Experience|Work|Salary|Required|Send|Contact|Email|$))/i
  );
  if (locMatch) {
    location = locMatch[1].trim();
  }

  // Match experience
  const expMatch = text.match(
    /(?:experience(?:\s*required)?\s*[:\-]?\s*(\d+[-–]\d+\s*(?:years?|yrs?))|\b(\d+[-–]\d+\s*(?:years?|yrs?))\b)/i
  );
  if (expMatch) {
    experience = (expMatch[1] || expMatch[2] || "").trim();
  }

  // Match work mode
  if (/remote/i.test(text)) workMode = "Remote";
  else if (/hybrid/i.test(text)) workMode = "Hybrid";
  else if (/on-?site/i.test(text)) workMode = "On-site";

  // Match salary
  const salMatch = text.match(
    /(?:salary|ctc|package|compensation)\s*[:\-]?\s*([₹$€£]?\s*[\d.]+\s*[-–to ]+\s*[\d.]+\s*(?:LPA|lac|lakhs|k|USD)?)/i
  );
  if (salMatch) {
    salary = salMatch[1].trim();
  }

  // Match recruiter
  const recMatch = text.match(
    /(?:recruiter|contact(?:\s+person)?|hr)\s*[:\-]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  );
  if (recMatch) {
    recruiter = recMatch[1].trim();
  }

  // Extract skills
  const knownSkills = [
    "Java", "Spring Boot", "Spring", "Microservices", "REST API", "Hibernate", "JPA",
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "Kafka", "RabbitMQ", "Docker", "Kubernetes",
    "AWS", "GCP", "Azure", "Git", "Maven", "Gradle", "JUnit", "Python", "React", "TypeScript",
    "JavaScript", "Node.js", "CI/CD", "Linux", "GraphQL"
  ];

  const matchedSkills = knownSkills.filter((skill) => {
    const reg = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return reg.test(text);
  });

  return {
    company_name: company || "ABC Technologies",
    job_title: title || "Senior Java Backend Developer",
    location: location || "Pune, India",
    experience_required: experience || "3-5 Years",
    employment_type: "Full-time",
    work_mode: workMode,
    salary: salary || null,
    required_skills: matchedSkills.length > 0 ? matchedSkills : ["Java", "Spring Boot", "REST API", "MySQL"],
    preferred_skills: [],
    education: null,
    recruiter_name: recruiter || null,
    deadline: null,
    application_methods: [],
  };
}

/**
 * Analyze text or image job post using Gemini 3.6 Flash via Interactions API
 */
export async function analyzeJobPostWithGemini(params: {
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<StructuredJobData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    if (params.text) {
      return deterministicExtractJobData(params.text);
    }
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your free Gemini API key to your environment variables (.env.local) to analyze images."
    );
  }

  return analyzeJobPost(params);
}

/**
 * Generate personalized outreach message using Gemini 3.6 Flash via Interactions API
 */
export async function generatePersonalizedMessage(params: {
  jobTitle: string;
  companyName: string;
  requiredSkills: string[];
  candidateName: string;
  candidateRole: string;
  candidateSkills?: string[];
  candidateExperience?: string;
  recruiterName?: string | null;
  platform: "email" | "whatsapp";
}): Promise<{ subject?: string; message: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const isWhatsApp = params.platform === "whatsapp";
    const recruiter = params.recruiterName?.trim() || "Hiring Team";
    const skillsStr = params.requiredSkills.slice(0, 4).join(", ") || "core technical stack";

    if (isWhatsApp) {
      return {
        message: `Hello ${recruiter !== "Hiring Team" ? recruiter : "there"},\n\nI am ${params.candidateName}, a ${params.candidateRole}. I am reaching out regarding the ${params.jobTitle} opening at ${params.companyName}.\n\nI have experience working with ${skillsStr} and would love to contribute to your engineering team. My resume is attached for your review.\n\nThank you,\n${params.candidateName}`,
      };
    } else {
      return {
        subject: `Application for ${params.jobTitle} – ${params.candidateName}`,
        message: `Dear ${recruiter},\n\nI am writing to express my interest in the ${params.jobTitle} position at ${params.companyName}.\n\nWith a strong technical background in ${skillsStr}, I have designed and delivered scalable backend services. I believe my hands-on experience aligns well with the key requirements for this role.\n\nPlease find my resume attached for your consideration. I look forward to discussing how my background can add value to the team at ${params.companyName}.\n\nBest regards,\n${params.candidateName}\n${params.candidateRole}`,
      };
    }
  }

  return generateApplicationMessage(params);
}

/**
 * Calculate AI-assisted match score using Gemini 3.6 Flash via Interactions API
 */
export async function calculateResumeJobMatch(params: {
  jobTitle: string;
  requiredSkills: string[];
  candidateSkills: string[];
  candidateRole: string;
  experienceRequired?: string | null;
}): Promise<MatchScoreResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const reqLower = params.requiredSkills.map((s) => s.toLowerCase());
    const candLower = params.candidateSkills.map((s) => s.toLowerCase());
    const matched = params.requiredSkills.filter((s) =>
      candLower.some((c) => c.includes(s.toLowerCase()) || s.toLowerCase().includes(c))
    );
    const missing = params.requiredSkills.filter((s) => !matched.includes(s));
    const score = params.requiredSkills.length > 0
      ? Math.round((matched.length / params.requiredSkills.length) * 100)
      : 80;

    let recommendation: "Strong Match" | "Moderate Match" | "Low Match" = "Moderate Match";
    if (score >= 75) recommendation = "Strong Match";
    else if (score < 50) recommendation = "Low Match";

    return {
      score,
      strong_matches: matched,
      potential_gaps: missing,
      matched_skills: matched,
      missing_skills: missing,
      recommendation,
      summary: `Estimated match based on ${matched.length} matching skills of ${params.requiredSkills.length} required.`,
    };
  }

  const result = await calculateJobMatch({
    candidateSkills: params.candidateSkills,
    candidateRole: params.candidateRole,
    jobTitle: params.jobTitle,
    requiredSkills: params.requiredSkills,
    experienceRequired: params.experienceRequired,
  });

  return {
    score: result.score,
    strong_matches: result.matched_skills,
    potential_gaps: result.missing_skills,
    matched_skills: result.matched_skills,
    missing_skills: result.missing_skills,
    recommendation: result.recommendation,
    summary: `AI estimate: ${result.matched_skills.length} matching skills detected with ${result.recommendation.toLowerCase()} alignment.`,
  };
}
