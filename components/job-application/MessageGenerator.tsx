"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, Mail, MessageSquare, Check } from "lucide-react";
import { TemplateType } from "@/lib/jobApplicationTypes";

interface MessageGeneratorProps {
  platform: TemplateType;
  subject: string;
  message: string;
  onSubjectChange: (s: string) => void;
  onMessageChange: (m: string) => void;
  onGenerateAiMessage: () => Promise<void>;
  isGenerating: boolean;
}

export const MessageGenerator: React.FC<MessageGeneratorProps> = ({
  platform,
  subject,
  message,
  onSubjectChange,
  onMessageChange,
  onGenerateAiMessage,
  isGenerating,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(platform === "email" ? `Subject: ${subject}\n\n${message}` : message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {platform === "whatsapp" ? (
            <MessageSquare size={18} className="text-status-success" />
          ) : (
            <Mail size={18} className="text-brand-primary" />
          )}
          <div>
            <h4 className="text-sm font-heading font-bold text-text-primary">
              Application Message Editor ({platform === "whatsapp" ? "WhatsApp" : "Email"})
            </h4>
            <p className="text-[11px] text-text-secondary">
              Personalized for the job post. Fully editable before sending.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGenerateAiMessage}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            <span>{isGenerating ? "Personalizing..." : "Generate AI Message"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary border border-white/10 transition-all"
          >
            {copied ? <Check size={13} className="text-status-success" /> : null}
            <span>{copied ? "Copied" : "Copy Text"}</span>
          </button>
        </div>
      </div>

      {/* Email Subject Line */}
      {platform === "email" && (
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Email Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="e.g. Application for Java Backend Developer – Candidate Name"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary font-medium"
          />
        </div>
      )}

      {/* Message Body */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1">
          Message Body
        </label>
        <textarea
          rows={platform === "whatsapp" ? 7 : 10}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Compose or generate your tailored message..."
          className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-brand-primary font-mono resize-y leading-relaxed"
        />
      </div>
    </div>
  );
};
