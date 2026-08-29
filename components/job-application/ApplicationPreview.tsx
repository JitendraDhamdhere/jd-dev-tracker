"use client";

import React, { useState } from "react";
import {
  Mail,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Paperclip,
} from "lucide-react";
import { TemplateType, ResumeItem } from "@/lib/jobApplicationTypes";
import {
  generateWhatsAppDeepLink,
  generateMailtoDeepLink,
} from "@/lib/jobApplicationService";

interface ApplicationPreviewProps {
  platform: TemplateType;
  recipient: string; // email or phone
  subject?: string;
  message: string;
  selectedResume?: ResumeItem | null;
  onBack: () => void;
  onConfirmApplied: () => void;
}

export const ApplicationPreview: React.FC<ApplicationPreviewProps> = ({
  platform,
  recipient,
  subject,
  message,
  selectedResume,
  onBack,
  onConfirmApplied,
}) => {
  const [hasOpenedApp, setHasOpenedApp] = useState(false);

  const isWhatsApp = platform === "whatsapp";

  const handleOpenClient = () => {
    if (isWhatsApp) {
      const waLink = generateWhatsAppDeepLink(recipient, message);
      window.open(waLink, "_blank", "noopener,noreferrer");
    } else {
      const mailtoLink = generateMailtoDeepLink(recipient, subject || "Job Application", message);
      window.location.href = mailtoLink;
    }
    setHasOpenedApp(true);
  };

  return (
    <div className="glass-card p-6 space-y-6 max-w-3xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isWhatsApp ? "bg-status-success/20 text-status-success" : "bg-brand-primary/20 text-brand-primary"
            }`}
          >
            {isWhatsApp ? <MessageSquare size={20} /> : <Mail size={20} />}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary">
              Application Preview ({isWhatsApp ? "WhatsApp" : "Email"})
            </h3>
            <p className="text-xs text-text-secondary">
              Review recipients and message content before launching
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary border border-white/10 transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to Edit</span>
        </button>
      </div>

      {/* Crucial Manual PDF Attachment Notice */}
      <div className="p-4 rounded-xl bg-status-warning/10 border border-status-warning/30 flex items-start gap-3">
        <AlertTriangle size={18} className="text-status-warning shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-status-warning">
            Important: Manual Resume Attachment Required
          </p>
          <p className="text-text-secondary leading-relaxed">
            {isWhatsApp
              ? "WhatsApp deep links cannot attach local PDF files automatically. When WhatsApp opens, your message will be pre-filled. Please tap the attachment clip in WhatsApp to attach your resume before sending."
              : "Mailto links cannot attach local PDF files automatically for browser security reasons. When your email client opens, the recipient, subject, and body will be pre-filled. Please attach your resume before sending."}
          </p>
        </div>
      </div>

      {/* Preview Card */}
      <div className="p-5 rounded-2xl bg-bg-secondary border border-white/10 space-y-4">
        {/* Recipient */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 pb-2 border-b border-white/5">
          <span className="text-text-muted font-medium">
            {isWhatsApp ? "WhatsApp Number:" : "To:"}
          </span>
          <span className="text-text-primary font-bold">{recipient || "Not specified"}</span>
        </div>

        {/* Subject (for Email) */}
        {!isWhatsApp && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 pb-2 border-b border-white/5">
            <span className="text-text-muted font-medium">Subject:</span>
            <span className="text-text-primary font-bold">{subject || "No Subject"}</span>
          </div>
        )}

        {/* Selected Resume */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 pb-2 border-b border-white/5">
          <span className="text-text-muted font-medium flex items-center gap-1.5">
            <Paperclip size={13} /> Target Resume:
          </span>
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-brand-primary" />
            <span className="text-brand-primary font-semibold">
              {selectedResume?.name || "No resume selected"}
            </span>
          </div>
        </div>

        {/* Message Box */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Prepared Message:
          </span>
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-xs text-text-primary whitespace-pre-wrap font-mono leading-relaxed">
            {message}
          </div>
        </div>
      </div>

      {/* Post-Open Confirmation Banner */}
      {hasOpenedApp && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={20} className="text-status-success shrink-0" />
            <div>
              <p className="text-xs font-bold text-status-success">
                {isWhatsApp ? "WhatsApp opened!" : "Email client opened!"}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Remember to attach:{" "}
                <span className="font-semibold text-text-primary">
                  {selectedResume?.name || "your resume PDF"}
                </span>{" "}
                before hitting send.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onConfirmApplied}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-status-success hover:bg-emerald-600 text-white text-xs font-bold shadow-glow transition-all whitespace-nowrap"
          >
            <CheckCircle2 size={14} />
            <span>Mark as Applied</span>
          </button>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary border border-white/10 transition-all text-center"
        >
          Back
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenClient}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-glow transition-all ${
              isWhatsApp
                ? "bg-status-success hover:bg-emerald-600"
                : "bg-brand-primary hover:bg-brand-hover"
            }`}
          >
            {isWhatsApp ? <MessageSquare size={16} /> : <Mail size={16} />}
            <span>{isWhatsApp ? "Open WhatsApp" : "Open Email"}</span>
            <ExternalLink size={13} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
