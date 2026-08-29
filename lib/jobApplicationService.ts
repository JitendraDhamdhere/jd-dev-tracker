import { supabase } from "./supabase";
import {
  JobApplicationRecord,
  ApplicationTemplate,
  ResumeItem,
  ApplicationStats,
} from "./jobApplicationTypes";
import { normalizePhoneNumber } from "./contactExtractor";

const STORAGE_KEYS = {
  APPLICATIONS: "devtrack_job_applications_v2",
  TEMPLATES: "devtrack_application_templates",
  RESUMES: "devtrack_resumes_v2",
};

// Default Email Template
export const defaultEmailTemplate: ApplicationTemplate = {
  id: "tpl_default_email",
  user_id: "default_user",
  name: "Standard Application Email",
  type: "email",
  subject: "Application for {job_title} – {candidate_name}",
  body: `Dear {recruiter_name},

I am writing to express my interest in the {job_title} position at {company_name}.

I have experience in {skills} and believe my background aligns well with the requirements of this role.

Please find my resume attached for your consideration.

I would appreciate the opportunity to discuss the position further.

Regards,
{candidate_name}
{phone}
{candidate_email}`,
  is_default: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Default WhatsApp Template
export const defaultWhatsAppTemplate: ApplicationTemplate = {
  id: "tpl_default_whatsapp",
  user_id: "default_user",
  name: "Concise WhatsApp Outreach",
  type: "whatsapp",
  body: `Hello,

I am {candidate_name}.

I am interested in the {job_title} opportunity at {company_name}.

I have experience in {skills} and would like to apply for this position.

Please find my resume attached.

Thank you.`,
  is_default: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Initial Seed Templates
export const initialTemplates: ApplicationTemplate[] = [
  defaultEmailTemplate,
  defaultWhatsAppTemplate,
  {
    id: "tpl_referred_email",
    user_id: "default_user",
    name: "Referral / Warm Outreach Email",
    type: "email",
    subject: "Application for {job_title} | {candidate_name}",
    body: `Dear {recruiter_name},

I hope this email finds you well. I am reaching out regarding the {job_title} opening at {company_name}.

With hands-on experience in {skills}, I have built resilient systems and backend services. I would love to bring my engineering background to the team in {location}.

My resume is attached for review. Looking forward to speaking with you.

Best regards,
{candidate_name}
{phone}
{candidate_email}`,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initial Seed Resumes
export const initialResumes: ResumeItem[] = [
  {
    id: "res_java_backend",
    user_id: "default_user",
    name: "Java Backend Developer Resume.pdf",
    file_path: "resumes/default_user/Java_Backend_Developer_Resume.pdf",
    file_type: "application/pdf",
    file_size: 145200,
    is_default: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "res_fullstack_spring",
    user_id: "default_user",
    name: "Java Spring Boot Resume.pdf",
    file_path: "resumes/default_user/Java_Spring_Boot_Resume.pdf",
    file_type: "application/pdf",
    file_size: 162400,
    is_default: false,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

/**
 * Replace all template variables with candidate & job values
 * Ensures never leaving raw variables and cleanly substitutes recruiter names
 */
export function interpolateTemplateVariables(
  template: string,
  variables: {
    candidate_name?: string;
    candidate_email?: string;
    phone?: string;
    job_title?: string;
    company_name?: string;
    location?: string;
    recruiter_name?: string | null;
    skills?: string | string[];
    experience?: string;
  }
): string {
  if (!template) return "";

  let result = template;

  const recruiter = variables.recruiter_name?.trim();
  const recruiterGreeting = recruiter && recruiter !== "null" ? recruiter : "Hiring Team";

  // Specific recruiter greeting replacement
  result = result.replace(/\{recruiter_name\}/gi, recruiterGreeting);

  // Format skills string
  let skillsStr = "software development";
  if (Array.isArray(variables.skills) && variables.skills.length > 0) {
    skillsStr = variables.skills.slice(0, 5).join(", ");
  } else if (typeof variables.skills === "string" && variables.skills.trim()) {
    skillsStr = variables.skills;
  }

  const map: Record<string, string> = {
    candidate_name: variables.candidate_name || "Software Developer",
    candidate_email: variables.candidate_email || "developer@example.com",
    phone: variables.phone || "+91 9876543210",
    job_title: variables.job_title || "Software Engineer",
    company_name: variables.company_name || "Company",
    location: variables.location || "Remote",
    skills: skillsStr,
    experience: variables.experience || "2+ years",
  };

  Object.entries(map).forEach(([key, val]) => {
    const reg = new RegExp(`\\{${key}\\}`, "gi");
    result = result.replace(reg, val);
  });

  // Clean any remaining unmapped {variable_name} tags
  result = result.replace(/\{[a-zA-Z0-9_-]+\}/g, "");

  return result;
}

/**
 * Generate a WhatsApp deep link with normalized phone number and URL-encoded text
 */
export function generateWhatsAppDeepLink(phone: string, message: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return "";
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a standard mailto link
 */
export function generateMailtoDeepLink(email: string, subject: string, body: string): string {
  if (!email) return "";
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Check if a similar application exists to avoid accidental duplicates
 */
export function findDuplicateApplication(
  existingApplications: JobApplicationRecord[],
  companyName: string,
  jobTitle: string,
  email?: string | null
): JobApplicationRecord | null {
  const normComp = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normTitle = jobTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanEmail = email ? email.toLowerCase().trim() : null;

  return (
    existingApplications.find((app) => {
      const c = app.company_name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const t = app.job_title.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchComp = c === normComp || (c.length > 3 && normComp.length > 3 && (c.includes(normComp) || normComp.includes(c)));
      const matchTitle = t === normTitle || (t.length > 3 && normTitle.length > 3 && (t.includes(normTitle) || normTitle.includes(t)));
      const matchEmail = cleanEmail && app.email ? app.email.toLowerCase().trim() === cleanEmail : false;
      return (matchComp && matchTitle) || (matchComp && matchEmail);
    }) || null
  );
}

/**
 * Calculate application dashboard statistics
 */
export function computeApplicationStats(applications: JobApplicationRecord[]): ApplicationStats {
  const total = applications.length;
  let emailCount = 0;
  let whatsappCount = 0;
  let interviews = 0;
  let rejected = 0;
  let selected = 0;
  let pending = 0;

  applications.forEach((app) => {
    if (app.application_methods?.includes("email") || (app.email && !app.whatsapp)) {
      emailCount++;
    }
    if (app.application_methods?.includes("whatsapp") || app.whatsapp) {
      whatsappCount++;
    }

    if (app.status === "Interview") interviews++;
    else if (app.status === "Rejected") rejected++;
    else if (app.status === "Selected") selected++;
    else pending++;
  });

  return {
    total,
    emailCount,
    whatsappCount,
    interviews,
    rejected,
    selected,
    pending,
  };
}

/**
 * Data Access Layer for Job Application Send:
 * Relational tables with fallback to devtrack_kv / localStorage
 */
export const JobApplicationDataService = {
  // -------------------------------------------------------------
  // Applications
  // -------------------------------------------------------------
  async getApplications(): Promise<JobApplicationRecord[]> {
    try {
      // 1. Try relational table first
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as JobApplicationRecord[];
      }

      // 2. Fallback to devtrack_kv
      const { data: kvData } = await supabase
        .from("devtrack_kv")
        .select("value")
        .eq("key", STORAGE_KEYS.APPLICATIONS)
        .single();

      if (kvData?.value && Array.isArray(kvData.value)) {
        return kvData.value as JobApplicationRecord[];
      }

      // 3. Fallback to localStorage
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
        if (cached) return JSON.parse(cached);
      }
      return [];
    } catch (e) {
      console.warn("Failed to fetch applications, reading from local cache", e);
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            return [];
          }
        }
      }
      return [];
    }
  },

  async saveApplication(app: JobApplicationRecord): Promise<boolean> {
    try {
      // Update local storage cache optimistically
      if (typeof window !== "undefined") {
        const list = await this.getApplications();
        const existingIdx = list.findIndex((a) => a.id === app.id);
        const updatedList =
          existingIdx >= 0
            ? list.map((a) => (a.id === app.id ? app : a))
            : [app, ...list];
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updatedList));
      }

      // Try relational table upsert
      const { error: relError } = await supabase.from("job_applications").upsert(app);

      if (relError) {
        // Fallback to devtrack_kv
        const list = await this.getApplications();
        const existingIdx = list.findIndex((a) => a.id === app.id);
        const updatedList =
          existingIdx >= 0
            ? list.map((a) => (a.id === app.id ? app : a))
            : [app, ...list];

        await supabase.from("devtrack_kv").upsert({
          key: STORAGE_KEYS.APPLICATIONS,
          value: updatedList,
          updated_at: new Date().toISOString(),
        });
      }
      return true;
    } catch (e) {
      console.error("Failed to save application", e);
      return false;
    }
  },

  async deleteApplication(id: string): Promise<boolean> {
    try {
      if (typeof window !== "undefined") {
        const list = await this.getApplications();
        const filtered = list.filter((a) => a.id !== id);
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(filtered));
      }

      const { error: relError } = await supabase.from("job_applications").delete().eq("id", id);
      if (relError) {
        const list = await this.getApplications();
        const filtered = list.filter((a) => a.id !== id);
        await supabase.from("devtrack_kv").upsert({
          key: STORAGE_KEYS.APPLICATIONS,
          value: filtered,
          updated_at: new Date().toISOString(),
        });
      }
      return true;
    } catch (e) {
      console.error("Failed to delete application", e);
      return false;
    }
  },

  // -------------------------------------------------------------
  // Templates
  // -------------------------------------------------------------
  async getTemplates(): Promise<ApplicationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from("application_templates")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as ApplicationTemplate[];
      }

      const { data: kvData } = await supabase
        .from("devtrack_kv")
        .select("value")
        .eq("key", STORAGE_KEYS.TEMPLATES)
        .single();

      if (kvData?.value && Array.isArray(kvData.value) && kvData.value.length > 0) {
        return kvData.value as ApplicationTemplate[];
      }

      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
        if (cached) return JSON.parse(cached);
      }
      return initialTemplates;
    } catch (e) {
      console.warn("Failed to get templates", e);
      return initialTemplates;
    }
  },

  async saveTemplate(template: ApplicationTemplate): Promise<boolean> {
    try {
      if (typeof window !== "undefined") {
        const list = await this.getTemplates();
        const idx = list.findIndex((t) => t.id === template.id);
        const updatedList = idx >= 0 ? list.map((t) => (t.id === template.id ? template : t)) : [...list, template];
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updatedList));
      }

      const { error } = await supabase.from("application_templates").upsert(template);
      if (error) {
        const list = await this.getTemplates();
        const idx = list.findIndex((t) => t.id === template.id);
        const updatedList = idx >= 0 ? list.map((t) => (t.id === template.id ? template : t)) : [...list, template];
        await supabase.from("devtrack_kv").upsert({
          key: STORAGE_KEYS.TEMPLATES,
          value: updatedList,
          updated_at: new Date().toISOString(),
        });
      }
      return true;
    } catch (e) {
      console.error("Failed to save template", e);
      return false;
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const list = await this.getTemplates();
      const filtered = list.filter((t) => t.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
      }

      const { error } = await supabase.from("application_templates").delete().eq("id", id);
      if (error) {
        await supabase.from("devtrack_kv").upsert({
          key: STORAGE_KEYS.TEMPLATES,
          value: filtered,
          updated_at: new Date().toISOString(),
        });
      }
      return true;
    } catch (e) {
      console.error("Failed to delete template", e);
      return false;
    }
  },

  // -------------------------------------------------------------
  // Resumes
  // -------------------------------------------------------------
  async getResumes(): Promise<ResumeItem[]> {
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ResumeItem[];
      }

      const { data: kvData } = await supabase
        .from("devtrack_kv")
        .select("value")
        .eq("key", STORAGE_KEYS.RESUMES)
        .single();

      if (kvData?.value && Array.isArray(kvData.value) && kvData.value.length > 0) {
        return kvData.value as ResumeItem[];
      }

      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(STORAGE_KEYS.RESUMES);
        if (cached) return JSON.parse(cached);
      }
      return initialResumes;
    } catch (e) {
      console.warn("Failed to get resumes", e);
      return initialResumes;
    }
  },

  async saveResume(resume: ResumeItem): Promise<boolean> {
    try {
      if (typeof window !== "undefined") {
        const list = await this.getResumes();
        const idx = list.findIndex((r) => r.id === resume.id);
        const updatedList = idx >= 0 ? list.map((r) => (r.id === resume.id ? resume : r)) : [resume, ...list];
        localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(updatedList));
      }

      const { error } = await supabase.from("resumes").upsert(resume);
      if (error) {
        const list = await this.getResumes();
        const idx = list.findIndex((r) => r.id === resume.id);
        const updatedList = idx >= 0 ? list.map((r) => (r.id === resume.id ? resume : r)) : [resume, ...list];
        await supabase.from("devtrack_kv").upsert({
          key: STORAGE_KEYS.RESUMES,
          value: updatedList,
          updated_at: new Date().toISOString(),
        });
      }
      return true;
    } catch (e) {
      console.error("Failed to save resume", e);
      return false;
    }
  },

  async deleteResume(id: string): Promise<boolean> {
    try {
      const list = await this.getResumes();
      const filtered = list.filter((r) => r.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(filtered));
      }

      const { error } = await supabase.from("resumes").delete().eq("id", id);
      if (error) {
        await supabase.from("devtrack_kv").upsert({
          key: STORAGE_KEYS.RESUMES,
          value: filtered,
          updated_at: new Date().toISOString(),
        });
      }
      return true;
    } catch (e) {
      console.error("Failed to delete resume", e);
      return false;
    }
  },

  /**
   * Upload resume PDF to Supabase Storage private bucket 'resumes'
   */
  async uploadResumeFile(
    userId: string,
    file: File
  ): Promise<{ path: string; error?: string }> {
    try {
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const filePath = `resumes/${userId}/${cleanFileName}`;

      const { error } = await supabase.storage.from("resumes").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        console.warn("Supabase Storage upload warning (fallback to path metadata):", error.message);
        // Even if storage bucket isn't yet created by admin in console, we keep path metadata
        return { path: filePath };
      }

      return { path: filePath };
    } catch (e) {
      console.warn("Storage upload exception:", e);
      return { path: `resumes/${userId}/${file.name}` };
    }
  },
};
