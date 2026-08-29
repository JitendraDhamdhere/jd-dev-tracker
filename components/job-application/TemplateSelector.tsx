"use client";

import React, { useState } from "react";
import {
  FileCode,
  Mail,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Eye,
} from "lucide-react";
import { ApplicationTemplate, TemplateType } from "@/lib/jobApplicationTypes";
import { Modal } from "@/components/ui/Modal";

interface TemplateSelectorProps {
  templates: ApplicationTemplate[];
  selectedTemplateId?: string;
  activeType: TemplateType;
  onSelectTemplate: (templateId: string) => void;
  onSaveTemplate: (template: ApplicationTemplate) => Promise<void>;
  onDeleteTemplate: (templateId: string) => Promise<void>;
  onTypeChange?: (type: TemplateType) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  activeType,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onTypeChange,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ApplicationTemplate>>({
    name: "",
    type: activeType,
    subject: "",
    body: "",
    is_default: false,
  });

  const filteredTemplates = templates.filter((t) => t.type === activeType);

  const handleOpenNew = () => {
    setEditingTemplate({
      id: `tpl_${Date.now()}`,
      user_id: "default_user",
      name: "",
      type: activeType,
      subject: activeType === "email" ? "Application for {job_title} – {candidate_name}" : undefined,
      body: "",
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (tpl: ApplicationTemplate) => {
    setEditingTemplate({ ...tpl });
    setIsEditorOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate.name || !editingTemplate.body) return;

    await onSaveTemplate({
      id: editingTemplate.id || `tpl_${Date.now()}`,
      user_id: editingTemplate.user_id || "default_user",
      name: editingTemplate.name,
      type: editingTemplate.type || activeType,
      subject: editingTemplate.subject,
      body: editingTemplate.body,
      is_default: Boolean(editingTemplate.is_default),
      created_at: editingTemplate.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <FileCode size={14} className="text-brand-primary" /> Application Template
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            Select a message template with dynamic variables for {activeType}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel Tabs */}
          {onTypeChange && (
            <div className="flex p-0.5 rounded-xl bg-bg-secondary border border-white/10">
              <button
                type="button"
                onClick={() => onTypeChange("email")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeType === "email"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Mail size={13} />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => onTypeChange("whatsapp")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeType === "whatsapp"
                    ? "bg-status-success text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <MessageSquare size={13} />
                <span>WhatsApp</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-primary border border-white/10 transition-all"
          >
            <Plus size={13} />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          return (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? activeType === "whatsapp"
                    ? "bg-status-success/10 border-status-success shadow-glow"
                    : "bg-brand-primary/10 border-brand-primary shadow-glow"
                  : "bg-bg-secondary/70 hover:bg-bg-secondary border-white/5 hover:border-white/15"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary truncate">
                      {template.name}
                    </span>
                    {template.is_default && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-text-secondary font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2
                      size={16}
                      className={
                        activeType === "whatsapp" ? "text-status-success" : "text-brand-primary"
                      }
                    />
                  )}
                </div>

                {template.subject && (
                  <p className="text-[11px] font-medium text-text-muted mt-1 truncate">
                    Subject: {template.subject}
                  </p>
                )}

                <p className="text-[11px] text-text-secondary mt-2 line-clamp-3 font-mono bg-black/20 p-2 rounded-lg border border-white/5 whitespace-pre-wrap">
                  {template.body}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5 text-[11px]">
                <span
                  className={`font-semibold ${
                    isSelected
                      ? activeType === "whatsapp"
                        ? "text-status-success"
                        : "text-brand-primary"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {isSelected ? "Active Template" : "Select Template"}
                </span>

                <div className="flex items-center gap-2 text-text-muted">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(template);
                    }}
                    className="hover:text-text-primary"
                    title="Edit Template"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete template "${template.name}"?`)) {
                        onDeleteTemplate(template.id);
                      }
                    }}
                    className="hover:text-status-danger"
                    title="Delete Template"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingTemplate.id ? "Edit Message Template" : "Create New Template"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Template Name
              </label>
              <input
                type="text"
                required
                value={editingTemplate.name || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Senior Java Backend Pitch"
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Channel
              </label>
              <select
                value={editingTemplate.type || activeType}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({
                    ...prev,
                    type: e.target.value as TemplateType,
                  }))
                }
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>

          {editingTemplate.type === "email" && (
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={editingTemplate.subject || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Application for {job_title} – {candidate_name}"
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary">Message Body</label>
              <span className="text-[10px] text-text-muted">
                Variables: &#123;job_title&#125;, &#123;company_name&#125;, &#123;skills&#125;,
                &#123;recruiter_name&#125;, &#123;candidate_name&#125;, &#123;phone&#125;
              </span>
            </div>
            <textarea
              rows={8}
              required
              value={editingTemplate.body || ""}
              onChange={(e) =>
                setEditingTemplate((prev) => ({ ...prev, body: e.target.value }))
              }
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-brand-primary font-mono resize-y"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefaultCheckbox"
              checked={Boolean(editingTemplate.is_default)}
              onChange={(e) =>
                setEditingTemplate((prev) => ({ ...prev, is_default: e.target.checked }))
              }
              className="rounded bg-bg-secondary border-white/20 text-brand-primary focus:ring-0"
            />
            <label htmlFor="isDefaultCheckbox" className="text-xs text-text-secondary">
              Set as default template for {editingTemplate.type}
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
            >
              Save Template
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
