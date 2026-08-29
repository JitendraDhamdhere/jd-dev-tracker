"use client";

import React from "react";
import { Mail, MessageSquare, Phone, CheckCircle2, ArrowRight } from "lucide-react";

interface ContactInformationProps {
  email: string;
  phone: string;
  whatsapp: string;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onWhatsAppChange: (v: string) => void;
  onSelectApplyMethod: (method: "email" | "whatsapp") => void;
}

export const ContactInformation: React.FC<ContactInformationProps> = ({
  email,
  phone,
  whatsapp,
  onEmailChange,
  onPhoneChange,
  onWhatsAppChange,
  onSelectApplyMethod,
}) => {
  const isWhatsAppLinked = Boolean(whatsapp && whatsapp.trim());

  const handleUsePhoneAsWhatsApp = () => {
    if (phone) {
      onWhatsAppChange(phone);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          Application Contacts
        </h4>
        <span className="text-[10px] text-text-muted">
          Click an action below or edit contacts directly
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Contact Card */}
        <div className="p-3.5 rounded-xl bg-bg-secondary border border-white/5 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Mail size={15} className="text-brand-primary" /> Recruiter Email
              </label>
              {email && (
                <span className="text-[10px] text-status-success font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> Detected
                </span>
              )}
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="e.g. hr@company.com"
              className="w-full bg-bg-primary/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary"
            />
          </div>

          <button
            type="button"
            onClick={() => onSelectApplyMethod("email")}
            disabled={!email.trim()}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              email.trim()
                ? "bg-brand-primary hover:bg-brand-hover text-white shadow-glow"
                : "bg-white/5 text-text-muted cursor-not-allowed"
            }`}
          >
            <Mail size={14} />
            <span>Apply via Email</span>
            <ArrowRight size={13} className="ml-1" />
          </button>
        </div>

        {/* WhatsApp & Phone Contact Card */}
        <div className="p-3.5 rounded-xl bg-bg-secondary border border-white/5 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <MessageSquare size={15} className="text-status-success" /> WhatsApp / Phone
              </label>
              {isWhatsAppLinked ? (
                <span className="text-[10px] text-status-success font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> WhatsApp Ready
                </span>
              ) : phone ? (
                <span className="text-[10px] text-status-warning font-medium flex items-center gap-1">
                  <Phone size={11} /> Phone Detected
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="block text-[10px] text-text-muted mb-1">Phone Number</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-bg-primary/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <span className="block text-[10px] text-text-muted mb-1">WhatsApp Number</span>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => onWhatsAppChange(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full bg-bg-primary/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-success"
                />
              </div>
            </div>

            {!isWhatsAppLinked && phone && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-text-muted">
                  Phone detected without explicit WhatsApp tag
                </span>
                <button
                  type="button"
                  onClick={handleUsePhoneAsWhatsApp}
                  className="text-[11px] font-semibold text-status-success hover:underline"
                >
                  [ Use as WhatsApp ]
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectApplyMethod("whatsapp")}
            disabled={!whatsapp.trim() && !phone.trim()}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              whatsapp.trim() || phone.trim()
                ? "bg-status-success hover:bg-emerald-600 text-white shadow-glow"
                : "bg-white/5 text-text-muted cursor-not-allowed"
            }`}
          >
            <MessageSquare size={14} />
            <span>Apply via WhatsApp</span>
            <ArrowRight size={13} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
