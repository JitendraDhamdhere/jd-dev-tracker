export type ApplicationStatus =
  | "Saved"
  | "Analyzed"
  | "Applied"
  | "Interview"
  | "Rejected"
  | "Selected"
  | "Withdrawn";

export type TemplateType = "email" | "whatsapp";

export interface StructuredJobData {
  company_name: string | null;
  job_title: string | null;
  location: string | null;
  experience_required: string | null;
  employment_type: string | null;
  work_mode: string | null;
  salary: string | null;
  required_skills: string[];
  preferred_skills: string[];
  education: string | null;
  recruiter_name: string | null;
  deadline: string | null;
  application_methods: string[];
  // Contact details extracted deterministically / verified
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  source_url?: string | null;
}

export interface JobApplicationRecord {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  location?: string;
  job_description?: string;
  source?: string;
  source_url?: string;
  experience_required?: string;
  employment_type?: string;
  work_mode?: string;
  salary?: string;
  required_skills: string[];
  preferred_skills: string[];
  education?: string;
  recruiter_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  deadline?: string;
  application_methods: string[];
  selected_resume_id?: string;
  selected_template_id?: string;
  generated_subject?: string;
  generated_message?: string;
  status: ApplicationStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  applied_at?: string;
}

export interface ApplicationTemplate {
  id: string;
  user_id: string;
  name: string;
  type: TemplateType;
  subject?: string;
  body: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeItem {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
  // Local fallback base64 or object URL preview if storage bucket is private or offline
  preview_url?: string;
}

export interface MatchScoreResult {
  score: number; // percentage 0-100
  strong_matches: string[];
  potential_gaps: string[];
  recommendation: string; // e.g. "Strong Match — Apply", "Moderate Match", "Reach Opportunity"
  summary: string;
  matched_skills?: string[];
  missing_skills?: string[];
}

export interface ApplicationStats {
  total: number;
  emailCount: number;
  whatsappCount: number;
  interviews: number;
  rejected: number;
  selected: number;
  pending: number;
}
