"use client";

import React, { useState } from "react";
import {
  Building2,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  UserCheck,
  RotateCcw,
  Save,
  Send,
  Plus,
  X,
  Laptop,
} from "lucide-react";
import { StructuredJobData } from "@/lib/jobApplicationTypes";
import { ContactInformation } from "./ContactInformation";

interface AnalysisResultProps {
  initialData: StructuredJobData;
  onSaveDraft: (data: StructuredJobData) => void;
  onReanalyze: () => void;
  onProceedToApply: (data: StructuredJobData, method: "email" | "whatsapp") => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  initialData,
  onSaveDraft,
  onReanalyze,
  onProceedToApply,
}) => {
  const [formData, setFormData] = useState<StructuredJobData>(initialData);
  const [newSkillInput, setNewSkillInput] = useState("");

  const updateField = <K extends keyof StructuredJobData>(
    field: K,
    value: StructuredJobData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !formData.required_skills.includes(trimmed)) {
      updateField("required_skills", [...formData.required_skills, trimmed]);
      setNewSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateField(
      "required_skills",
      formData.required_skills.filter((s) => s !== skillToRemove)
    );
  };

  return (
    <div className="glass-card p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary flex items-center gap-2">
            <Briefcase size={18} className="text-brand-primary" /> Extracted Job Details
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Review and adjust AI-extracted parameters. All fields are fully editable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReanalyze}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary border border-white/10 transition-all"
          >
            <RotateCcw size={13} />
            <span>Re-analyze</span>
          </button>
          <button
            type="button"
            onClick={() => onSaveDraft(formData)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-text-primary border border-white/15 transition-all"
          >
            <Save size={13} />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Editable Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <Building2 size={13} className="text-brand-primary" /> Company Name
          </label>
          <input
            type="text"
            value={formData.company_name || ""}
            onChange={(e) => updateField("company_name", e.target.value)}
            placeholder="e.g. ABC Technologies"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Job Title / Role */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <Briefcase size={13} className="text-brand-primary" /> Job Title / Position
          </label>
          <input
            type="text"
            value={formData.job_title || ""}
            onChange={(e) => updateField("job_title", e.target.value)}
            placeholder="e.g. Java Backend Developer"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary font-medium"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <MapPin size={13} className="text-brand-primary" /> Location
          </label>
          <input
            type="text"
            value={formData.location || ""}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="e.g. Pune, India / Remote"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Experience Required */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <Clock size={13} className="text-brand-primary" /> Experience Required
          </label>
          <input
            type="text"
            value={formData.experience_required || ""}
            onChange={(e) => updateField("experience_required", e.target.value)}
            placeholder="e.g. 2–4 Years"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Work Mode */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <Laptop size={13} className="text-brand-primary" /> Work Mode
          </label>
          <select
            value={formData.work_mode || "Hybrid"}
            onChange={(e) => updateField("work_mode", e.target.value)}
            className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        {/* Salary */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <DollarSign size={13} className="text-brand-primary" /> Salary / Compensation
          </label>
          <input
            type="text"
            value={formData.salary || ""}
            onChange={(e) => updateField("salary", e.target.value)}
            placeholder="e.g. ₹12 - ₹18 LPA or Competitive"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Recruiter Name */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <UserCheck size={13} className="text-brand-primary" /> Recruiter / Contact Name
          </label>
          <input
            type="text"
            value={formData.recruiter_name || ""}
            onChange={(e) => updateField("recruiter_name", e.target.value)}
            placeholder="e.g. Ananya Sharma (or leave blank for Hiring Team)"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Education */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Education / Degrees
          </label>
          <input
            type="text"
            value={formData.education || ""}
            onChange={(e) => updateField("education", e.target.value)}
            placeholder="e.g. B.Tech / M.Tech in Computer Science or equivalent"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Required Skills Management */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-text-secondary">
          Required Technical Skills ({formData.required_skills.length})
        </label>

        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-bg-secondary border border-white/10 min-h-[50px]">
          {formData.required_skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-primary/15 border border-brand-primary/30 text-brand-primary text-xs font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-status-danger transition-colors ml-0.5"
                title={`Remove ${skill}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {formData.required_skills.length === 0 && (
            <span className="text-xs text-text-muted">No skills listed yet. Add skills below.</span>
          )}
        </div>

        <div className="flex items-center gap-2 max-w-sm">
          <input
            type="text"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add skill (e.g. Spring Boot)..."
            className="flex-1 bg-bg-secondary border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          />
          <button
            type="button"
            onClick={addSkill}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-primary border border-white/10 transition-all"
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Contact Section */}
      <ContactInformation
        email={formData.email || ""}
        phone={formData.phone || ""}
        whatsapp={formData.whatsapp || ""}
        onEmailChange={(v) => updateField("email", v)}
        onPhoneChange={(v) => updateField("phone", v)}
        onWhatsAppChange={(v) => updateField("whatsapp", v)}
        onSelectApplyMethod={(method) => onProceedToApply(formData, method)}
      />

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <span className="text-xs text-text-muted">
          Ready to apply? Click an Apply action above or proceed to template & resume review.
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onProceedToApply(formData, formData.whatsapp ? "whatsapp" : "email")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
          >
            <Send size={14} />
            <span>Prepare Application & Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};
