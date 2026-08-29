"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Target,
  Trophy,
  AlertCircle,
  Sparkles,
  Save,
  CheckCircle2,
} from "lucide-react";
import { DailyPlanner } from "@/lib/types";
import { formatDateKey, formatReadableDate } from "@/lib/utils";

interface DailyPlannerTabProps {
  plannerData: DailyPlanner;
  onSavePlanner: (planner: DailyPlanner) => void;
}

export const DailyPlannerTab: React.FC<DailyPlannerTabProps> = ({
  plannerData,
  onSavePlanner,
}) => {
  const [selectedDate, setSelectedDate] = useState(formatDateKey());
  const [form, setForm] = useState<DailyPlanner>(plannerData);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    setForm(plannerData);
  }, [plannerData]);

  const handleChange = (field: keyof DailyPlanner, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    onSavePlanner({
      ...form,
      date: selectedDate,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Controls */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <CalendarDays size={22} className="text-brand-primary" /> Daily Planner & Reflections
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Capture intentions in the morning and review wins & improvements at night
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-bg-secondary border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          />
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
          >
            {savedMessage ? <CheckCircle2 size={16} /> : <Save size={16} />}
            <span>{savedMessage ? "Saved!" : "Save Reflections"}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Reflection Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Morning & Goals */}
        <div className="space-y-6">
          {/* Morning Goals */}
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-base text-text-primary mb-2 flex items-center gap-2">
              <Target size={18} className="text-status-warning" /> Morning Intentions & High-Impact Targets
            </h3>
            <p className="text-xs text-text-muted mb-4">
              What are the 3 major wins that make today successful?
            </p>
            <textarea
              rows={4}
              value={form.morningGoals || ""}
              onChange={(e) => handleChange("morningGoals", e.target.value)}
              placeholder="1. Finish Spring Security JWT filter&#10;2. Solve 2 LeetCode Tree problems&#10;3. Submit 3 job applications"
              className="w-full bg-bg-secondary/70 border border-white/10 rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary leading-relaxed"
            />
          </div>

          {/* Today Execution Targets */}
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-base text-text-primary mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-brand-primary" /> Daily Execution Checklist
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Detailed breakdown of specific developer tasks.
            </p>
            <textarea
              rows={4}
              value={form.todayGoals || ""}
              onChange={(e) => handleChange("todayGoals", e.target.value)}
              placeholder="- [ ] Review pull requests&#10;- [ ] Configure Redis connection pool&#10;- [ ] Docker compose testing"
              className="w-full bg-bg-secondary/70 border border-white/10 rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Evening Review & Learnings */}
        <div className="space-y-6">
          {/* Wins of the Day */}
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-base text-text-primary mb-2 flex items-center gap-2">
              <Trophy size={18} className="text-status-success" /> Today's Wins & Highlights
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Celebrate progress, shipped code, and overcome obstacles.
            </p>
            <textarea
              rows={3}
              value={form.wins || ""}
              onChange={(e) => handleChange("wins", e.target.value)}
              placeholder="Cleanly handled Redis cache invalidation without stale data reads."
              className="w-full bg-bg-secondary/70 border border-white/10 rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary leading-relaxed"
            />
          </div>

          {/* Mistakes & Roadblocks */}
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-base text-text-primary mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-status-danger" /> Roadblocks & Mistakes
            </h3>
            <p className="text-xs text-text-muted mb-4">
              What broke? What caused distractions or delay?
            </p>
            <textarea
              rows={3}
              value={form.mistakes || ""}
              onChange={(e) => handleChange("mistakes", e.target.value)}
              placeholder="Spent 45 mins debugging a typo in application.yml instead of reading logs."
              className="w-full bg-bg-secondary/70 border border-white/10 rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary leading-relaxed"
            />
          </div>

          {/* Tomorrow's Plan */}
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-base text-text-primary mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" /> Tomorrow's Pre-Commitments
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Eliminate decision fatigue by deciding tomorrow's first hour tonight.
            </p>
            <textarea
              rows={3}
              value={form.tomorrowPlan || ""}
              onChange={(e) => handleChange("tomorrowPlan", e.target.value)}
              placeholder="Start immediately with 6:30 AM gym, then LeetCode Graph practice on commute."
              className="w-full bg-bg-secondary/70 border border-white/10 rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
