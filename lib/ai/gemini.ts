import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { StructuredJobData, MatchScoreResult } from "@/lib/jobApplicationTypes";

// Model configuration
export const GEMINI_MODEL = "gemini-3.6-flash";
export const GEMINI_SDK_VERSION = "^2.19.0";
export const GEMINI_API_METHOD = "ai.interactions.create";

/**
 * Zod Schema to strictly validate extracted job data from Gemini
 */
export const JobDataSchema = z.object({
  company_name: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  experience_required: z.string().nullable().optional(),
  employment_type: z.string().nullable().optional(),
  work_mode: z.string().nullable().optional(),
  salary: z.string().nullable().optional(),
  required_skills: z.array(z.string()).default([]),
  preferred_skills: z.array(z.string()).default([]),
  education: z.string().nullable().optional(),
  recruiter_name: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  application_methods: z.array(z.string()).default([]),
});

/**
 * Zod Schema for match scoring
 */
export const MatchScoreSchema = z.object({
  score: z.number().min(0).max(100),
  matched_skills: z.array(z.string()).default([]),
  missing_skills: z.array(z.string()).default([]),
  recommendation: z.string().default("Moderate Match"),
});

/**
 * Server-side GoogleGenAI client singleton
 * Never exposes the API key to the client/browser
 */
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your free Gemini API key to your environment variables (.env.local)."
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Unified error handler adhering to free-tier requirements
 */
function handleGeminiError(error: unknown, context: string): never {
  const errStr = String(error);
  const errMsg = error instanceof Error ? error.message : errStr;

  // 429 / Quota / Rate Limit handling
  if (
    errStr.includes("429") ||
    errStr.includes("RESOURCE_EXHAUSTED") ||
    errStr.includes("quota") ||
    errStr.includes("QuotaExceeded") ||
    errStr.includes("rate limit")
  ) {
    console.warn(`[Gemini Free Quota] Rate limit in ${context}: ${errMsg}`);
    throw new Error("AI usage limit reached. Please try again later.");
  }

  // 404 Model / Endpoint handling: Log server-side details without exposing sensitive info
  if (errStr.includes("404") || errStr.includes("Not Found")) {
    console.error(`[Gemini 404 Error] in ${context}:`, {
      model: GEMINI_MODEL,
      apiMethod: GEMINI_API_METHOD,
      sdkVersion: GEMINI_SDK_VERSION,
      errorSnippet: errMsg.slice(0, 200),
    });
    throw new Error(
      `The AI model '${GEMINI_MODEL}' could not be reached. Please check your Gemini configuration.`
    );
  }

  // 401 / 403 Authentication handling
  if (errStr.includes("401") || errStr.includes("403") || errStr.includes("API key not valid")) {
    console.error(`[Gemini Auth Error] in ${context}: Invalid or unauthorized GEMINI_API_KEY`);
    throw new Error(
      "Invalid GEMINI_API_KEY. Please verify your free API key in .env.local."
    );
  }

  console.error(`[Gemini Error] in ${context}:`, errMsg);
  throw new Error(errMsg || "An unexpected error occurred during AI processing.");
}

/**
 * Clean and parse raw JSON text from Gemini Interactions API output
 */
function parseJsonFromOutput<T>(outputText: string, schema?: z.ZodType<T>): T {
  if (!outputText || !outputText.trim()) {
    throw new Error("Empty AI response received.");
  }

  // Strip possible markdown wrapping (```json ... ``` or ``` ... ```)
  const cleanJson = outputText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (parseErr) {
    console.error("[Gemini JSON Parse Error] Raw output:", outputText);
    throw new Error("Failed to parse structured JSON from AI output.");
  }

  if (schema) {
    return schema.parse(parsed);
  }

  return parsed as T;
}

/**
 * 1. Analyze Job Post (Text or Multimodal Image)
 * Uses ai.interactions.create with gemini-3.6-flash
 */
export async function analyzeJobPost(params: {
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<StructuredJobData> {
  const promptInstruction = `
You are a job advertisement analysis assistant.

Analyze only the information provided.

Never invent information.

Extract:
- company name
- job title
- location
- experience
- employment type
- work mode
- salary
- required skills
- preferred skills
- education
- recruiter name
- deadline
- application methods

If information is unavailable, return null.

Return structured JSON only.

Do not invent recruiter names,
companies,
skills,
salary,
experience,
technologies,
certifications,
or application methods.

Strict JSON format:
{
  "company_name": string or null,
  "job_title": string or null,
  "location": string or null,
  "experience_required": string or null,
  "employment_type": string or null,
  "work_mode": string or null,
  "salary": string or null,
  "required_skills": string[],
  "preferred_skills": string[],
  "education": string or null,
  "recruiter_name": string or null,
  "deadline": string or null,
  "application_methods": string[]
}
`;

  try {
    const ai = getGenAIClient();
    let interactionResult: { output_text?: string };

    if (params.imageBase64 && params.imageMimeType) {
      // Multimodal image understanding for PNG, JPG, JPEG, WEBP
      const userPrompt = params.text
        ? `${promptInstruction}\n\nAdditional text context provided with this image:\n${params.text}`
        : `${promptInstruction}\n\nExtract all job post information from this image:`;

      interactionResult = await ai.interactions.create({
        model: GEMINI_MODEL,
        input: [
          {
            type: "image",
            mime_type: params.imageMimeType,
            data: params.imageBase64,
          },
          {
            type: "text",
            text: userPrompt,
          },
        ],
      });
    } else {
      // Text or server-side parsed PDF text
      const fullPrompt = `${promptInstruction}\n\nJob Post Content:\n${params.text || ""}`;
      interactionResult = await ai.interactions.create({
        model: GEMINI_MODEL,
        input: fullPrompt,
      });
    }

    const outputText = interactionResult.output_text || "";
    const validated = parseJsonFromOutput(outputText, JobDataSchema);

    return {
      company_name: validated.company_name ?? null,
      job_title: validated.job_title ?? null,
      location: validated.location ?? null,
      experience_required: validated.experience_required ?? null,
      employment_type: validated.employment_type ?? null,
      work_mode: validated.work_mode ?? null,
      salary: validated.salary ?? null,
      required_skills: Array.isArray(validated.required_skills) ? validated.required_skills : [],
      preferred_skills: Array.isArray(validated.preferred_skills) ? validated.preferred_skills : [],
      education: validated.education ?? null,
      recruiter_name: validated.recruiter_name ?? null,
      deadline: validated.deadline ?? null,
      application_methods: Array.isArray(validated.application_methods) ? validated.application_methods : [],
    };
  } catch (error) {
    handleGeminiError(error, "analyzeJobPost");
  }
}

/**
 * 2. Generate Personalized Application Message
 * Uses ai.interactions.create with gemini-3.6-flash
 */
export async function generateApplicationMessage(params: {
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
  const isWhatsApp = params.platform === "whatsapp";

  const prompt = `
Generate a professional, concise, recruiter-friendly, and natural job application outreach message for ${
    isWhatsApp ? "WhatsApp" : "Email"
  }.

Candidate Profile:
- Name: ${params.candidateName}
- Current Role: ${params.candidateRole}
- Skills: ${(params.candidateSkills || []).join(", ") || "Java, Spring Boot, REST APIs, SQL"}
- Experience: ${params.candidateExperience || "Experienced Software Developer"}

Target Job:
- Position: ${params.jobTitle}
- Company: ${params.companyName}
- Required Skills: ${params.requiredSkills.join(", ")}
- Recruiter: ${params.recruiterName || "Hiring Team"}

Strict Rules:
1. Professional, concise, recruiter-friendly, and personalized.
2. NO fake claims, NO invented experience, NO invented technologies, NO invented projects, NO invented certifications.
3. If recruiter name is unavailable, address to "Hiring Team".
4. If WhatsApp, keep it short and mobile-friendly (1-2 paragraphs max).
5. Always remind the recruiter that the resume is attached.
6. Return structured JSON only.

Return JSON schema:
{
  "subject": ${isWhatsApp ? "null" : "string"},
  "message": "string"
}
`;

  try {
    const ai = getGenAIClient();
    const res = await ai.interactions.create({
      model: GEMINI_MODEL,
      input: prompt,
    });

    const outputText = res.output_text || "";
    const parsed = parseJsonFromOutput<{ subject?: string | null; message: string }>(outputText);

    return {
      subject: isWhatsApp
        ? undefined
        : parsed.subject || `Application for ${params.jobTitle} – ${params.candidateName}`,
      message: parsed.message,
    };
  } catch (error) {
    handleGeminiError(error, "generateApplicationMessage");
  }
}

/**
 * 3. Calculate AI-Assisted Job Match
 * Uses ai.interactions.create with gemini-3.6-flash
 */
export async function calculateJobMatch(params: {
  candidateSkills: string[];
  candidateExperience?: string | null;
  candidateRole?: string;
  jobTitle: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceRequired?: string | null;
}): Promise<{
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendation: string;
}> {
  const prompt = `
Compare the candidate's skills and experience with the job requirements and calculate an estimated match score.
This is an AI-assisted estimate.

Candidate:
- Role: ${params.candidateRole || "Software Developer"}
- Skills: ${params.candidateSkills.join(", ")}
- Experience: ${params.candidateExperience || "Experienced"}

Job:
- Title: ${params.jobTitle}
- Required Skills: ${params.requiredSkills.join(", ")}
- Preferred Skills: ${(params.preferredSkills || []).join(", ") || "None specified"}
- Experience Required: ${params.experienceRequired || "Not specified"}

Strict Rules:
1. Compare only provided skills.
2. Return a score from 0 to 100 based on overlap.
3. Recommendation must be one of: "Strong Match", "Moderate Match", or "Low Match".
4. Return structured JSON only.

Return JSON schema:
{
  "score": number,
  "matched_skills": string[],
  "missing_skills": string[],
  "recommendation": "Strong Match" | "Moderate Match" | "Low Match"
}
`;

  try {
    const ai = getGenAIClient();
    const res = await ai.interactions.create({
      model: GEMINI_MODEL,
      input: prompt,
    });

    const outputText = res.output_text || "";
    const validated = parseJsonFromOutput(outputText, MatchScoreSchema);

    return {
      score: validated.score,
      matched_skills: validated.matched_skills,
      missing_skills: validated.missing_skills,
      recommendation: validated.recommendation,
    };
  } catch (error) {
    handleGeminiError(error, "calculateJobMatch");
  }
}
