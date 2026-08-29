"use client";

import React, { useState } from "react";
import { Award, Plus, ExternalLink, Trash2, Calendar, ShieldCheck } from "lucide-react";
import { Certification } from "@/lib/types";
import { generateId, formatReadableDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface CertificationsTabProps {
  certifications: Certification[];
  onSaveCert: (cert: Certification) => void;
  onDeleteCert: (id: string) => void;
}

export const CertificationsTab: React.FC<CertificationsTabProps> = ({
  certifications,
  onSaveCert,
  onDeleteCert,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("Amazon Web Services");
  const [issueDate, setIssueDate] = useState("2025-01-01");
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert: Certification = {
      id: generateId("cert"),
      name,
      issuer,
      issueDate,
      credentialId,
      credentialUrl,
      status: "active",
    };
    onSaveCert(newCert);
    setIsAddModalOpen(false);
    setName("");
    setCredentialId("");
    setCredentialUrl("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <Award size={22} className="text-brand-primary" /> Professional Certifications
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Showcase verified cloud, programming, and architecture credentials
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
        >
          <Plus size={15} /> Add Certification
        </button>
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {certifications.map((cert) => (
          <div key={cert.id} className="glass-card p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-status-success/10 border border-status-success/20 flex items-center justify-center text-status-success">
                  <ShieldCheck size={20} />
                </div>
                <button
                  onClick={() => onDeleteCert(cert.id)}
                  className="text-text-muted hover:text-status-danger p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="mt-3">
                <h3 className="font-heading font-bold text-base text-text-primary">{cert.name}</h3>
                <div className="text-xs text-brand-primary font-semibold mt-1">{cert.issuer}</div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-text-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} /> Issued: {formatReadableDate(cert.issueDate)}
                </div>
                {cert.credentialId && (
                  <div className="font-mono text-[11px] text-text-secondary">
                    ID: {cert.credentialId}
                  </div>
                )}
              </div>
            </div>

            {/* Verification Link */}
            {cert.credentialUrl && (
              <div className="pt-3 border-t border-white/5">
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:underline font-semibold"
                >
                  <ExternalLink size={13} /> Verify Credential
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Certification"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Certification Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS Certified Solutions Architect"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Issuer</label>
              <input
                type="text"
                required
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. AWS, Oracle, Linux Foundation"
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Credential ID
              </label>
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="e.g. CERT-12345"
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Verification URL
              </label>
              <input
                type="url"
                value={credentialUrl}
                onChange={(e) => setCredentialUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow"
            >
              Save Certification
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
