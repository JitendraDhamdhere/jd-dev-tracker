"use client";

import React from "react";
import { AlertTriangle, Building2, Calendar, Check, ExternalLink } from "lucide-react";
import { JobApplicationRecord } from "@/lib/jobApplicationTypes";
import { Modal } from "@/components/ui/Modal";

interface DuplicateWarningModalProps {
  isOpen: boolean;
  duplicateApp: JobApplicationRecord | null;
  onContinueAnyway: () => void;
  onViewExisting: (app: JobApplicationRecord) => void;
  onCancel: () => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  duplicateApp,
  onContinueAnyway,
  onViewExisting,
  onCancel,
}) => {
  if (!isOpen || !duplicateApp) return null;

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
    <Modal isOpen={isOpen} onClose={onCancel} title="Possible Duplicate Application">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-status-warning/10 border border-status-warning/30">
          <AlertTriangle size={20} className="text-status-warning shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-status-warning">
              You may have already applied to this company!
            </p>
            <p className="text-text-secondary leading-relaxed">
              We detected an existing application in your history matching this company name and role:
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-bg-secondary border border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-text-primary text-sm">
            <Building2 size={15} className="text-brand-primary" />
            <span>{duplicateApp.company_name}</span>
          </div>
          <p className="text-text-secondary">{duplicateApp.job_title}</p>
          <div className="flex items-center gap-4 text-[11px] text-text-muted pt-1">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Applied on: {formatDate(duplicateApp.applied_at || duplicateApp.created_at)}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 font-semibold text-text-primary">
              Status: {duplicateApp.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onViewExisting(duplicateApp)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-text-primary border border-white/10 transition-all"
          >
            <ExternalLink size={13} />
            <span>View Existing</span>
          </button>
          <button
            type="button"
            onClick={onContinueAnyway}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
          >
            <Check size={14} />
            <span>Continue Anyway</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
