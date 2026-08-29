"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  Plus,
  Trash2,
  Star,
  Download,
  AlertCircle,
} from "lucide-react";
import { ResumeItem } from "@/lib/jobApplicationTypes";
import { Modal } from "@/components/ui/Modal";

interface ResumeSelectorProps {
  resumes: ResumeItem[];
  selectedResumeId?: string;
  onSelectResume: (resumeId: string) => void;
  onUploadResume: (file: File, customName: string) => Promise<boolean>;
  onDeleteResume: (resumeId: string) => Promise<void>;
  onSetDefaultResume: (resumeId: string) => Promise<void>;
}

export const ResumeSelector: React.FC<ResumeSelectorProps> = ({
  resumes,
  selectedResumeId,
  onSelectResume,
  onUploadResume,
  onDeleteResume,
  onSetDefaultResume,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Please upload a PDF document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("PDF size exceeds 10 MB limit.");
      return;
    }

    setUploadError(null);
    setNewResumeFile(file);
    if (!customName) {
      setCustomName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeFile) {
      setUploadError("Please choose a PDF file.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const success = await onUploadResume(newResumeFile, customName || newResumeFile.name);
      if (success) {
        setIsUploadModalOpen(false);
        setNewResumeFile(null);
        setCustomName("");
      } else {
        setUploadError("Failed to save resume. Please try again.");
      }
    } catch {
      setUploadError("An error occurred while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "PDF";
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatDate = (dateStr: string) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <FileText size={14} className="text-brand-primary" /> Target Resume
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            Select the tailored resume you will attach when applying
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-primary border border-white/10 transition-all"
        >
          <Plus size={13} />
          <span>Upload PDF Resume</span>
        </button>
      </div>

      {/* Resume Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resumes.map((resume) => {
          const isSelected = selectedResumeId === resume.id;
          return (
            <div
              key={resume.id}
              onClick={() => onSelectResume(resume.id)}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "bg-brand-primary/10 border-brand-primary shadow-glow"
                  : "bg-bg-secondary/70 hover:bg-bg-secondary border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-brand-primary text-white"
                        : "bg-white/5 text-text-secondary"
                    }`}
                  >
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {resume.name}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Updated {formatDate(resume.updated_at)} • {formatFileSize(resume.file_size)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {resume.is_default && (
                    <span
                      title="Default Resume"
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
                    >
                      Default
                    </span>
                  )}
                  {isSelected && (
                    <CheckCircle2 size={16} className="text-brand-primary ml-1" />
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5 text-[11px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectResume(resume.id);
                  }}
                  className={`font-semibold ${
                    isSelected ? "text-brand-primary" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {isSelected ? "Active for Application" : "Use This Resume"}
                </button>

                <div className="flex items-center gap-2 text-text-muted">
                  {!resume.is_default && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetDefaultResume(resume.id);
                      }}
                      className="hover:text-text-primary"
                      title="Set as Default"
                    >
                      <Star size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete resume "${resume.name}"?`)) {
                        onDeleteResume(resume.id);
                      }
                    }}
                    className="hover:text-status-danger"
                    title="Delete Resume"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {resumes.length === 0 && (
          <div className="sm:col-span-2 p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-text-muted">
            No resumes saved yet. Click &quot;Upload PDF Resume&quot; to add your first version.
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload New Resume Version"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{uploadError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Resume Name / Target Role
            </label>
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Java Backend Developer Resume 2026"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              PDF Document
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              required
              onChange={handleFileChange}
              className="w-full text-xs text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-hover cursor-pointer"
            />
            <p className="text-[10px] text-text-muted mt-1">
              Max file size: 10 MB. Stored securely in your private Supabase Storage bucket.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
            >
              <Upload size={14} />
              <span>{isUploading ? "Uploading..." : "Save Resume"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
