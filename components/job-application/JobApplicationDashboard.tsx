"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  Sparkles,
  FileCode,
  FileText,
  History,
  Mail,
  MessageSquare,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import {
  StructuredJobData,
  JobApplicationRecord,
  ApplicationTemplate,
  ResumeItem,
  ApplicationStatus,
  TemplateType,
  MatchScoreResult,
} from "@/lib/jobApplicationTypes";
import {
  JobApplicationDataService,
  computeApplicationStats,
  findDuplicateApplication,
  interpolateTemplateVariables,
  initialResumes,
  initialTemplates,
} from "@/lib/jobApplicationService";
import { Profile } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { JobPostInput } from "./JobPostInput";
import { AnalysisResult } from "./AnalysisResult";
import { ResumeSelector } from "./ResumeSelector";
import { TemplateSelector } from "./TemplateSelector";
import { ResumeMatchCard } from "./ResumeMatchCard";
import { MessageGenerator } from "./MessageGenerator";
import { ApplicationPreview } from "./ApplicationPreview";
import { DuplicateWarningModal } from "./DuplicateWarningModal";
import { ApplicationHistory } from "./ApplicationHistory";

interface JobApplicationDashboardProps {
  profile: Profile;
}

type ActiveViewMode = "analyze" | "prepare" | "preview" | "templates" | "resumes" | "history";

export const JobApplicationDashboard: React.FC<JobApplicationDashboardProps> = ({
  profile,
}) => {
  const { showToast } = useToast();

  // Core collections
  const [applications, setApplications] = useState<JobApplicationRecord[]>([]);
  const [templates, setTemplates] = useState<ApplicationTemplate[]>(initialTemplates);
  const [resumes, setResumes] = useState<ResumeItem[]>(initialResumes);

  // Active navigation view
  const [viewMode, setViewMode] = useState<ActiveViewMode>("analyze");

  // Analysis workflow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<StructuredJobData | null>(null);

  // Application preparation state
  const [applyMethod, setApplyMethod] = useState<TemplateType>("email");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [generatedSubject, setGeneratedSubject] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [matchScore, setMatchScore] = useState<MatchScoreResult | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

  // Duplicate detection state
  const [duplicateApp, setDuplicateApp] = useState<JobApplicationRecord | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [pendingApply, setPendingApply] = useState<{
    data: StructuredJobData;
    method: "email" | "whatsapp";
  } | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [apps, tpls, res] = await Promise.all([
        JobApplicationDataService.getApplications(),
        JobApplicationDataService.getTemplates(),
        JobApplicationDataService.getResumes(),
      ]);
      setApplications(apps);
      setTemplates(tpls);
      setResumes(res);

      // Set default resume & template if available
      const defRes = res.find((r) => r.is_default) || res[0];
      if (defRes) setSelectedResumeId(defRes.id);

      const defTpl = tpls.find((t) => t.is_default && t.type === applyMethod) || tpls[0];
      if (defTpl) setSelectedTemplateId(defTpl.id);
    } catch (e) {
      console.warn("Error loading Job Application data", e);
    }
  }, [applyMethod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync template subject/message when template or extracted data changes
  const applyTemplateToDraft = useCallback(
    (tpl: ApplicationTemplate, jobData: StructuredJobData) => {
      const interpolatedBody = interpolateTemplateVariables(tpl.body, {
        candidate_name: profile.name,
        candidate_email: "developer@example.com",
        phone: "+91 9876543210",
        job_title: jobData.job_title || undefined,
        company_name: jobData.company_name || undefined,
        location: jobData.location || undefined,
        recruiter_name: jobData.recruiter_name,
        skills: jobData.required_skills,
      });

      const interpolatedSubject = tpl.subject
        ? interpolateTemplateVariables(tpl.subject, {
            candidate_name: profile.name,
            job_title: jobData.job_title || undefined,
            company_name: jobData.company_name || undefined,
          })
        : `Application for ${jobData.job_title || "Software Developer"} – ${profile.name}`;

      setGeneratedSubject(interpolatedSubject);
      setGeneratedMessage(interpolatedBody);
    },
    [profile.name]
  );

  // -------------------------------------------------------------
  // Workflow: Step 1 - Analyze Job Post
  // -------------------------------------------------------------
  const handleAnalyzeJob = async (payload: { text?: string; file?: File }) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      let res: Response;

      if (payload.file) {
        const fd = new FormData();
        fd.append("file", payload.file);
        if (payload.text) fd.append("text", payload.text);

        res = await fetch("/api/job-application/analyze", {
          method: "POST",
          body: fd,
        });
      } else {
        res = await fetch("/api/job-application/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: payload.text }),
        });
      }

      const result = await res.json();

      if (!res.ok || !result.success) {
        const errorMsg =
          result.error ||
          (res.status === 429
            ? "AI quota has been reached. Please try again later."
            : "Failed to analyze the job posting.");
        setAnalysisError(errorMsg);
        showToast("Analysis Error", errorMsg, "danger");
        return;
      }

      const structured: StructuredJobData = result.data;
      setExtractedData(structured);

      // Check for duplicate application
      if (structured.company_name && structured.job_title) {
        const dup = findDuplicateApplication(
          applications,
          structured.company_name,
          structured.job_title,
          structured.email
        );
        if (dup) {
          setDuplicateApp(dup);
          setIsDuplicateModalOpen(true);
        }
      }

      showToast("Job Post Analyzed", "Details extracted successfully.", "success");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error connecting to analysis service.";
      setAnalysisError(errMsg);
      showToast("Analysis Failed", errMsg, "danger");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // -------------------------------------------------------------
  // Workflow: Step 2 - Proceed to Prepare (Resume & Message)
  // -------------------------------------------------------------
  const handleProceedToApply = async (
    data: StructuredJobData,
    method: "email" | "whatsapp",
    bypassDuplicate = false
  ) => {
    // Check for duplicate application
    if (!bypassDuplicate) {
      const dup = findDuplicateApplication(
        applications,
        data.company_name || "",
        data.job_title || ""
      );
      if (dup) {
        setDuplicateApp(dup);
        setIsDuplicateModalOpen(true);
        setPendingApply({ data, method });
        return;
      }
    }

    setExtractedData(data);
    setApplyMethod(method);
    setViewMode("prepare");

    // Pick active template for this method
    const targetTpl =
      templates.find((t) => t.type === method && t.is_default) ||
      templates.find((t) => t.type === method) ||
      templates[0];

    if (targetTpl) {
      setSelectedTemplateId(targetTpl.id);
      applyTemplateToDraft(targetTpl, data);
    }

    // Trigger AI Match Score calculation in background
    if (data.required_skills.length > 0) {
      setIsMatching(true);
      try {
        const matchRes = await fetch("/api/job-application/match-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobTitle: data.job_title,
            requiredSkills: data.required_skills,
            candidateSkills: ["Java", "Spring Boot", "REST API", "Hibernate", "MySQL", "PostgreSQL"],
            candidateRole: profile.role,
            experienceRequired: data.experience_required,
          }),
        });
        const matchData = await matchRes.json();
        if (matchData.success) {
          setMatchScore(matchData.data);
        }
      } catch (e) {
        console.warn("Failed to fetch match score", e);
      } finally {
        setIsMatching(false);
      }
    }
  };

  // -------------------------------------------------------------
  // Workflow: AI Message Generation Trigger
  // -------------------------------------------------------------
  const handleGenerateAiMessage = async () => {
    if (!extractedData) return;
    setIsGeneratingMessage(true);

    try {
      const res = await fetch("/api/job-application/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: extractedData.job_title || "Software Developer",
          companyName: extractedData.company_name || "Company",
          requiredSkills: extractedData.required_skills,
          candidateName: profile.name,
          candidateRole: profile.role,
          candidateSkills: ["Java", "Spring Boot", "REST API", "Hibernate", "MySQL"],
          candidateExperience: extractedData.experience_required || undefined,
          recruiterName: extractedData.recruiter_name || null,
          platform: applyMethod,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.subject) setGeneratedSubject(json.data.subject);
        if (json.data.message) setGeneratedMessage(json.data.message);
        showToast("Message Generated", "Personalized with Gemini 2.5 Flash.", "success");
      } else {
        const msg = json.error || "Could not generate message.";
        showToast("Generation Notice", msg, "warning");
      }
    } catch {
      showToast("Generation Failed", "Please check your network and try again.", "danger");
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  // -------------------------------------------------------------
  // Workflow: Step 3 - Confirm Applied & Persist
  // -------------------------------------------------------------
  const handleConfirmApplied = async () => {
    if (!extractedData) return;

    const newRecord: JobApplicationRecord = {
      id: `app_${Date.now()}`,
      user_id: "default_user",
      company_name: extractedData.company_name || "Untitled Company",
      job_title: extractedData.job_title || "Software Developer",
      location: extractedData.location || undefined,
      experience_required: extractedData.experience_required || undefined,
      employment_type: extractedData.employment_type || undefined,
      work_mode: extractedData.work_mode || undefined,
      salary: extractedData.salary || undefined,
      required_skills: extractedData.required_skills,
      preferred_skills: extractedData.preferred_skills,
      recruiter_name: extractedData.recruiter_name || undefined,
      email: extractedData.email || undefined,
      phone: extractedData.phone || undefined,
      whatsapp: extractedData.whatsapp || undefined,
      application_methods: [applyMethod],
      selected_resume_id: selectedResumeId || undefined,
      selected_template_id: selectedTemplateId || undefined,
      generated_subject: generatedSubject || undefined,
      generated_message: generatedMessage,
      status: "Applied",
      notes: `Applied via ${applyMethod === "whatsapp" ? "WhatsApp" : "Email"} on ${new Date().toLocaleDateString()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      applied_at: new Date().toISOString(),
    };

    const success = await JobApplicationDataService.saveApplication(newRecord);
    if (success) {
      setApplications((prev) => [newRecord, ...prev]);
      showToast(
        "Application Logged",
        `Marked as Applied for ${newRecord.company_name}.`,
        "success"
      );
      setViewMode("history");
      setExtractedData(null);
    } else {
      showToast("Error", "Could not save to history.", "danger");
    }
  };

  // Save as draft
  const handleSaveDraft = async (data: StructuredJobData) => {
    const draftRecord: JobApplicationRecord = {
      id: `draft_${Date.now()}`,
      user_id: "default_user",
      company_name: data.company_name || "Draft Company",
      job_title: data.job_title || "Software Developer",
      location: data.location || undefined,
      experience_required: data.experience_required || undefined,
      salary: data.salary || undefined,
      required_skills: data.required_skills,
      preferred_skills: data.preferred_skills,
      email: data.email || undefined,
      phone: data.phone || undefined,
      whatsapp: data.whatsapp || undefined,
      application_methods: [data.whatsapp ? "whatsapp" : "email"],
      status: "Saved",
      notes: "Saved as draft from analysis.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await JobApplicationDataService.saveApplication(draftRecord);
    setApplications((prev) => [draftRecord, ...prev]);
    showToast("Draft Saved", `Saved ${draftRecord.company_name} to your pipeline.`, "success");
  };

  // Update Status
  const handleUpdateStatus = async (
    id: string,
    newStatus: ApplicationStatus,
    notes?: string
  ) => {
    const app = applications.find((a) => a.id === id);
    if (!app) return;

    const updated: JobApplicationRecord = {
      ...app,
      status: newStatus,
      notes: notes !== undefined ? notes : app.notes,
      updated_at: new Date().toISOString(),
    };

    await JobApplicationDataService.saveApplication(updated);
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    showToast("Status Updated", `${app.company_name} is now ${newStatus}.`, "info");
  };

  // Delete Application
  const handleDeleteApplication = async (id: string) => {
    await JobApplicationDataService.deleteApplication(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
    showToast("Application Removed", "Deleted from your pipeline.", "info");
  };

  // Resumes CRUD
  const handleUploadResume = async (file: File, name: string) => {
    const uploadRes = await JobApplicationDataService.uploadResumeFile("default_user", file);
    const newResume: ResumeItem = {
      id: `res_${Date.now()}`,
      user_id: "default_user",
      name: name || file.name,
      file_path: uploadRes.path,
      file_type: file.type || "application/pdf",
      file_size: file.size,
      is_default: resumes.length === 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const ok = await JobApplicationDataService.saveResume(newResume);
    if (ok) {
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResumeId(newResume.id);
      showToast("Resume Uploaded", `${newResume.name} is ready.`, "success");
      return true;
    }
    return false;
  };

  const handleDeleteResume = async (id: string) => {
    await JobApplicationDataService.deleteResume(id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
    if (selectedResumeId === id) {
      setSelectedResumeId(resumes[0]?.id || "");
    }
    showToast("Resume Removed", "Resume version deleted.", "info");
  };

  const handleSetDefaultResume = async (id: string) => {
    const updated = resumes.map((r) => ({ ...r, is_default: r.id === id }));
    for (const r of updated) {
      await JobApplicationDataService.saveResume(r);
    }
    setResumes(updated);
    showToast("Default Resume Updated", "Preferred resume saved.", "success");
  };

  // Templates CRUD
  const handleSaveTemplate = async (template: ApplicationTemplate) => {
    await JobApplicationDataService.saveTemplate(template);
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === template.id);
      if (idx >= 0) return prev.map((t) => (t.id === template.id ? template : t));
      return [...prev, template];
    });
    showToast("Template Saved", `Template "${template.name}" updated.`, "success");
  };

  const handleDeleteTemplate = async (id: string) => {
    await JobApplicationDataService.deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast("Template Deleted", "Template removed.", "info");
  };

  // Stats calculation
  const stats = computeApplicationStats(applications);
  const activeResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-text-primary flex items-center gap-2.5">
            <Send size={24} className="text-brand-primary" /> Job Application Send
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Analyze a job post, prepare your application, send it through WhatsApp or Email, and track it.
          </p>
        </div>

        {/* Main Action Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setViewMode("analyze")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "analyze" || viewMode === "prepare" || viewMode === "preview"
                ? "bg-brand-primary text-white shadow-glow"
                : "bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10"
            }`}
          >
            <Sparkles size={14} />
            <span>Analyze Job</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("templates")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "templates"
                ? "bg-brand-primary text-white shadow-glow"
                : "bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10"
            }`}
          >
            <FileCode size={14} />
            <span>My Templates</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("resumes")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "resumes"
                ? "bg-brand-primary text-white shadow-glow"
                : "bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10"
            }`}
          >
            <FileText size={14} />
            <span>My Resumes</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("history")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "history"
                ? "bg-brand-primary text-white shadow-glow"
                : "bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10"
            }`}
          >
            <History size={14} />
            <span>Application History</span>
          </button>
        </div>
      </div>

      {/* Application Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="glass-card p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">
            Total
          </span>
          <span className="text-xl font-heading font-extrabold text-brand-primary mt-0.5 block">
            {stats.total}
          </span>
        </div>

        <div className="glass-card p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center justify-center gap-1">
            <Mail size={11} className="text-brand-primary" /> Email
          </span>
          <span className="text-xl font-heading font-extrabold text-brand-primary mt-0.5 block">
            {stats.emailCount}
          </span>
        </div>

        <div className="glass-card p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center justify-center gap-1">
            <MessageSquare size={11} className="text-status-success" /> WhatsApp
          </span>
          <span className="text-xl font-heading font-extrabold text-status-success mt-0.5 block">
            {stats.whatsappCount}
          </span>
        </div>

        <div className="glass-card p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">
            Interviews
          </span>
          <span className="text-xl font-heading font-extrabold text-brand-secondary mt-0.5 block">
            {stats.interviews}
          </span>
        </div>

        <div className="glass-card p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">
            Selected
          </span>
          <span className="text-xl font-heading font-extrabold text-status-success mt-0.5 block">
            {stats.selected}
          </span>
        </div>

        <div className="glass-card p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">
            Rejected
          </span>
          <span className="text-xl font-heading font-extrabold text-status-danger mt-0.5 block">
            {stats.rejected}
          </span>
        </div>

        <div className="glass-card p-3.5 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">
            Pending
          </span>
          <span className="text-xl font-heading font-extrabold text-status-warning mt-0.5 block">
            {stats.pending}
          </span>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "analyze" && (
        <div className="space-y-6">
          {/* Analyze Input */}
          <JobPostInput
            onAnalyze={handleAnalyzeJob}
            isLoading={isAnalyzing}
            errorMessage={analysisError}
          />

          {/* Extracted Data Form */}
          {extractedData && (
            <AnalysisResult
              initialData={extractedData}
              onSaveDraft={handleSaveDraft}
              onReanalyze={() => {
                setExtractedData(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onProceedToApply={(data, method) => handleProceedToApply(data, method)}
            />
          )}

          {/* Quick Recent Applications Section if not analyzing */}
          {!extractedData && applications.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-bold text-text-primary flex items-center gap-2">
                  <History size={16} className="text-brand-primary" /> Recent Applications
                </h3>
                <button
                  type="button"
                  onClick={() => setViewMode("history")}
                  className="text-xs text-brand-primary hover:underline font-semibold"
                >
                  View All ({applications.length})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {applications.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setViewMode("history")}
                    className="glass-card p-4 hover:border-white/20 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">
                          {app.company_name}
                        </p>
                        <p className="text-[11px] text-text-secondary truncate mt-0.5">
                          {app.job_title}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-primary/15 text-brand-primary border border-brand-primary/25">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prepare Application View */}
      {viewMode === "prepare" && extractedData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-lg font-heading font-bold text-text-primary">
                Prepare Application: {extractedData.company_name}
              </h3>
              <p className="text-xs text-text-secondary">
                {extractedData.job_title} • Applying via{" "}
                <span className="capitalize font-semibold text-brand-primary">
                  {applyMethod}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("analyze")}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              Back to Job Details
            </button>
          </div>

          {/* Resume Match Card */}
          <ResumeMatchCard matchResult={matchScore} isLoading={isMatching} />

          {/* Target Resume Selector */}
          <ResumeSelector
            resumes={resumes}
            selectedResumeId={selectedResumeId}
            onSelectResume={(id) => setSelectedResumeId(id)}
            onUploadResume={handleUploadResume}
            onDeleteResume={handleDeleteResume}
            onSetDefaultResume={handleSetDefaultResume}
          />

          {/* Template Selector */}
          <TemplateSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            activeType={applyMethod}
            onSelectTemplate={(id) => {
              setSelectedTemplateId(id);
              const tpl = templates.find((t) => t.id === id);
              if (tpl && extractedData) {
                applyTemplateToDraft(tpl, extractedData);
              }
            }}
            onTypeChange={(newType) => {
              setApplyMethod(newType);
              const targetTpl =
                templates.find((t) => t.type === newType && t.is_default) ||
                templates.find((t) => t.type === newType) ||
                templates[0];
              if (targetTpl && extractedData) {
                setSelectedTemplateId(targetTpl.id);
                applyTemplateToDraft(targetTpl, extractedData);
              }
            }}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />

          {/* Message Generator & Live Editor */}
          <MessageGenerator
            platform={applyMethod}
            subject={generatedSubject}
            message={generatedMessage}
            onSubjectChange={setGeneratedSubject}
            onMessageChange={setGeneratedMessage}
            onGenerateAiMessage={handleGenerateAiMessage}
            isGenerating={isGeneratingMessage}
          />

          {/* Proceed to Preview Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setViewMode("analyze")}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all"
            >
              Back
            </button>

            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
            >
              <span>Preview & Send Application</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Preview View */}
      {viewMode === "preview" && extractedData && (
        <ApplicationPreview
          platform={applyMethod}
          recipient={
            applyMethod === "whatsapp"
              ? extractedData.whatsapp || extractedData.phone || ""
              : extractedData.email || ""
          }
          subject={generatedSubject}
          message={generatedMessage}
          selectedResume={activeResume}
          onBack={() => setViewMode("prepare")}
          onConfirmApplied={handleConfirmApplied}
        />
      )}

      {/* Standalone Templates View */}
      {viewMode === "templates" && (
        <div className="glass-card p-6">
          <TemplateSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            activeType={applyMethod}
            onSelectTemplate={setSelectedTemplateId}
            onTypeChange={setApplyMethod}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        </div>
      )}

      {/* Standalone Resumes View */}
      {viewMode === "resumes" && (
        <div className="glass-card p-6">
          <ResumeSelector
            resumes={resumes}
            selectedResumeId={selectedResumeId}
            onSelectResume={setSelectedResumeId}
            onUploadResume={handleUploadResume}
            onDeleteResume={handleDeleteResume}
            onSetDefaultResume={handleSetDefaultResume}
          />
        </div>
      )}

      {/* Application History View */}
      {viewMode === "history" && (
        <ApplicationHistory
          applications={applications}
          onUpdateStatus={handleUpdateStatus}
          onDeleteApplication={handleDeleteApplication}
          onApplyAgain={(app) => {
            setExtractedData({
              company_name: app.company_name,
              job_title: app.job_title,
              location: app.location || null,
              experience_required: app.experience_required || null,
              employment_type: app.employment_type || null,
              work_mode: app.work_mode || null,
              salary: app.salary || null,
              required_skills: app.required_skills || [],
              preferred_skills: app.preferred_skills || [],
              education: app.education || null,
              recruiter_name: app.recruiter_name || null,
              deadline: app.deadline || null,
              application_methods: app.application_methods || [],
              email: app.email || null,
              phone: app.phone || null,
              whatsapp: app.whatsapp || null,
            });
            setViewMode("prepare");
          }}
        />
      )}

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={isDuplicateModalOpen}
        duplicateApp={duplicateApp}
        onCancel={() => {
          setIsDuplicateModalOpen(false);
          setPendingApply(null);
        }}
        onContinueAnyway={() => {
          setIsDuplicateModalOpen(false);
          if (pendingApply) {
            handleProceedToApply(pendingApply.data, pendingApply.method, true);
            setPendingApply(null);
          }
        }}
        onViewExisting={() => {
          setIsDuplicateModalOpen(false);
          setPendingApply(null);
          setViewMode("history");
        }}
      />
    </div>
  );
};
