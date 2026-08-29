"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Sparkles, AlertCircle, X } from "lucide-react";

interface JobPostInputProps {
  onAnalyze: (payload: { text?: string; file?: File }) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const JobPostInput: React.FC<JobPostInputProps> = ({
  onAnalyze,
  isLoading,
  errorMessage,
}) => {
  const [jobText, setJobText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (file: File) => {
    setLocalError(null);
    const validExtensions = ["png", "jpg", "jpeg", "webp", "pdf"];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!ext || !validExtensions.includes(ext)) {
      setLocalError("Unsupported file type. Please upload PNG, JPG, WEBP or PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setLocalError("File size exceeds 10 MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!jobText.trim() && !selectedFile) {
      setLocalError("Please paste a job description or upload a job post.");
      return;
    }

    await onAnalyze({
      text: jobText.trim() || undefined,
      file: selectedFile || undefined,
    });
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = localError || errorMessage;

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary flex items-center gap-2">
            <Sparkles size={18} className="text-brand-primary" /> Analyze Job Post
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Provide a job posting via screenshot, PDF, or text description
          </p>
        </div>
      </div>

      {displayError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs animate-in fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="flex-1">{displayError}</span>
          <button onClick={() => setLocalError(null)} className="hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
            isDragOver
              ? "border-brand-primary bg-brand-primary/10 shadow-glow"
              : selectedFile
              ? "border-status-success/50 bg-status-success/5"
              : "border-white/10 hover:border-white/20 bg-bg-secondary/60 hover:bg-bg-secondary"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelection(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center justify-between max-w-md mx-auto p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-status-success/20 text-status-success flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-text-muted">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Document"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-white/5 transition-colors"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-11 h-11 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center mx-auto shadow-sm">
                <UploadCloud size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Upload Job Post
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Drag & Drop Image (LinkedIn, WhatsApp screenshot) or PDF
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-primary border border-white/10 transition-all mt-1"
              >
                Choose File
              </button>
              <p className="text-[10px] text-text-muted tracking-wider uppercase font-medium pt-1">
                PNG • JPG • WEBP • PDF (Max 10 MB)
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            OR
          </span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Text Area */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Paste Job Description
          </label>
          <textarea
            rows={5}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste job description here... (e.g. ABC Technologies hiring Java Backend Developer in Pune, experience 2-4 years. Send resume on WhatsApp: +91 98765 43210 or email hr@abctech.com)"
            className="w-full bg-bg-secondary/90 border border-white/10 rounded-xl p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-y"
          />
        </div>

        {/* Analyze Button */}
        <button
          type="submit"
          disabled={isLoading || (!jobText.trim() && !selectedFile)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-glow ${
            isLoading || (!jobText.trim() && !selectedFile)
              ? "bg-brand-primary/50 cursor-not-allowed"
              : "bg-brand-primary hover:bg-brand-hover active:scale-[0.99]"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing job post...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Analyze Job</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
