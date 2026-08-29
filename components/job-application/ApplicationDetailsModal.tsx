"use client";

import React, { useState } from "react";
import {
  Building2,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  Trash2,
  Edit2,
  ExternalLink,
  Save,
  Send,
} from "lucide-react";
import { JobApplicationRecord, ApplicationStatus } from "@/lib/jobApplicationTypes";
import { Modal } from "@/components/ui/Modal";

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  application: JobApplicationRecord | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus, notes?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onApplyAgain: (app: JobApplicationRecord) => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  "Saved",
  "Analyzed",
  "Applied",
  "Interview",
  "Rejected",
  "Selected",
  "Withdrawn",
];

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  application,
  onClose,
  onUpdateStatus,
  onDelete,
  onApplyAgain,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(application?.notes || "");
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(
    application?.status || "Applied"
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !application) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleSaveStatusAndNotes = async () => {
    setIsSaving(true);
    await onUpdateStatus(application.id, selectedStatus, notesText);
    setIsSaving(false);
    setIsEditingNotes(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${application.company_name} — ${application.job_title}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-bg-secondary border border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary text-sm">
                {application.company_name}
              </span>
              {application.location && (
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <MapPin size={12} /> {application.location}
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">{application.job_title}</p>
          </div>

          {/* Status Picker */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-text-muted">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
              className="bg-bg-primary border border-white/10 rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-brand-primary font-semibold"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveStatusAndNotes}
              className="px-3 py-1 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-sm"
            >
              {isSaving ? "Saving..." : "Update"}
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
            <span className="text-text-muted flex items-center gap-1">
              <Mail size={12} className="text-brand-primary" /> Recruiter Email
            </span>
            <p className="font-semibold text-text-primary truncate">
              {application.email || "None listed"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
            <span className="text-text-muted flex items-center gap-1">
              <MessageSquare size={12} className="text-status-success" /> WhatsApp Contact
            </span>
            <p className="font-semibold text-text-primary truncate">
              {application.whatsapp || application.phone || "None listed"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
            <span className="text-text-muted flex items-center gap-1">
              <Calendar size={12} /> Applied / Created Date
            </span>
            <p className="font-semibold text-text-primary truncate">
              {formatDate(application.applied_at || application.created_at)}
            </p>
          </div>
        </div>

        {/* Skills Requirements */}
        {application.required_skills && application.required_skills.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-text-secondary">
              Required Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {application.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-brand-primary/15 text-brand-primary border border-brand-primary/25 text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prepared Application Message */}
        {application.generated_message && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                Sent / Generated Message
              </span>
              {application.generated_subject && (
                <span className="text-[11px] text-text-muted truncate max-w-sm">
                  Subject: {application.generated_subject}
                </span>
              )}
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-text-primary whitespace-pre-wrap font-mono max-h-48 overflow-y-auto leading-relaxed">
              {application.generated_message}
            </div>
          </div>
        )}

        {/* Notes & Interview Reflections */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary">
              Application Notes & Next Steps
            </label>
            <button
              type="button"
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              className="text-[11px] text-brand-primary hover:underline flex items-center gap-1"
            >
              <Edit2 size={11} />
              <span>{isEditingNotes ? "Done Editing" : "Edit Notes"}</span>
            </button>
          </div>

          {isEditingNotes ? (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Add notes about recruiter phone screenings, salary discussions, interview stages..."
                className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={handleSaveStatusAndNotes}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-sm"
              >
                <Save size={12} />
                <span>Save Notes</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-text-secondary p-3 rounded-xl bg-bg-secondary border border-white/5 min-h-[40px] whitespace-pre-wrap">
              {notesText || "No notes recorded yet. Click Edit Notes to log updates."}
            </p>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete application to ${application.company_name}?`)) {
                onDelete(application.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-status-danger hover:bg-status-danger/10 text-xs font-semibold transition-all"
          >
            <Trash2 size={13} />
            <span>Delete Application</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onApplyAgain(application);
                onClose();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
            >
              <Send size={13} />
              <span>Apply / Prepare Again</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
