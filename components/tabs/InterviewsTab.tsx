"use client";

import React, { useState } from "react";
import {
  MessagesSquare,
  Plus,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { Interview } from "@/lib/types";
import { generateId, formatDateKey, formatReadableDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface InterviewsTabProps {
  interviews: Interview[];
  onSaveInterview: (interview: Interview) => void;
  onDeleteInterview: (id: string) => void;
}

export const InterviewsTab: React.FC<InterviewsTabProps> = ({
  interviews,
  onSaveInterview,
  onDeleteInterview,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Java Backend Engineer");
  const [stage, setStage] = useState<Interview["stage"]>("Technical");
  const [date, setDate] = useState(formatDateKey());
  const [status, setStatus] = useState<Interview["status"]>("scheduled");
  const [questions, setQuestions] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newInt: Interview = {
      id: generateId("int"),
      company,
      role,
      stage,
      date,
      status,
      questions,
      notes,
      createdAt: new Date().toISOString(),
    };
    onSaveInterview(newInt);
    setIsAddModalOpen(false);
    setCompany("");
    setQuestions("");
    setNotes("");
  };

  const handleStatusChange = (interview: Interview, nextStatus: Interview["status"]) => {
    onSaveInterview({
      ...interview,
      status: nextStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <MessagesSquare size={22} className="text-brand-primary" /> Interview Prep & Question Bank
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Log technical rounds, interview dates, coding problems, and system design feedback
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
        >
          <Plus size={15} /> Log Interview
        </button>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {interviews.map((item) => (
          <div key={item.id} className="glass-card p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-primary font-heading font-bold">
                    <Building size={18} className="text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-text-primary">
                      {item.company}
                    </h3>
                    <div className="text-xs text-text-muted">{item.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteInterview(item.id)}
                  className="text-text-muted hover:text-status-danger p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-semibold border border-brand-primary/20">
                  {item.stage}
                </span>
                <span className="text-text-muted flex items-center gap-1">
                  <Calendar size={13} /> {formatReadableDate(item.date)}
                </span>
              </div>

              {item.questions && (
                <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-text-muted">
                    Questions & Focus:
                  </div>
                  <div className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {item.questions}
                  </div>
                </div>
              )}
            </div>

            {/* Status Selector Footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-text-muted">Result:</span>
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item, e.target.value as Interview["status"])}
                className="bg-bg-secondary text-xs text-text-primary border border-white/10 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="scheduled">Scheduled</option>
                <option value="passed">Passed</option>
                <option value="rejected">Rejected</option>
                <option value="offered">Offered</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule / Log Interview"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Amazon, Startup"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Role Title
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Interview Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as Interview["stage"])}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              >
                <option value="Coding">Coding Round</option>
                <option value="Technical">Technical Round 1</option>
                <option value="System Design">System Design</option>
                <option value="HR">HR / Managerial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Interview["status"])}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              >
                <option value="scheduled">Scheduled</option>
                <option value="passed">Passed</option>
                <option value="rejected">Rejected</option>
                <option value="offered">Offered</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Questions & Topics
            </label>
            <textarea
              rows={3}
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder="What questions were asked or expected?"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
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
              Save Interview
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
