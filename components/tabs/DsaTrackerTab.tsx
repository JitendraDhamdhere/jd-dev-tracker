"use client";

import React from "react";
import { GitFork, Plus, Minus, CheckCircle2, Award } from "lucide-react";
import { DsaTrackerState } from "@/lib/types";

interface DsaTrackerTabProps {
  dsaState: DsaTrackerState;
  onUpdateTopic: (topicKey: string, updates: Partial<DsaTrackerState[string]>) => void;
}

export const DsaTrackerTab: React.FC<DsaTrackerTabProps> = ({
  dsaState,
  onUpdateTopic,
}) => {
  const topicKeys = Object.keys(dsaState || {});

  // Calculate totals
  let totalEasy = 0;
  let totalMedium = 0;
  let totalHard = 0;
  let totalTarget = 0;

  topicKeys.forEach((k) => {
    const t = dsaState[k];
    if (t) {
      totalEasy += t.easy || 0;
      totalMedium += t.medium || 0;
      totalHard += t.hard || 0;
      totalTarget += t.target || 25;
    }
  });

  const totalSolved = totalEasy + totalMedium + totalHard;
  const overallPercent = totalTarget > 0 ? Math.round((totalSolved / totalTarget) * 100) : 0;

  const handleAdjust = (
    topicKey: string,
    field: "easy" | "medium" | "hard",
    delta: number
  ) => {
    const current = dsaState[topicKey]?.[field] || 0;
    const next = Math.max(0, current + delta);
    onUpdateTopic(topicKey, { [field]: next });
  };

  const formatTopicTitle = (key: string) => {
    return key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI overview */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <GitFork size={22} className="text-brand-primary" /> Data Structures & Algorithms Tracker
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Track LeetCode and algorithmic problem-solving totals across 12 standard interview patterns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold text-xs">
            {totalSolved} / {totalTarget} Solved ({overallPercent}%)
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Total Solved</div>
          <div className="text-2xl font-heading font-bold text-brand-primary mt-1">{totalSolved}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">Easy</div>
          <div className="text-2xl font-heading font-bold text-emerald-400 mt-1">{totalEasy}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">Medium</div>
          <div className="text-2xl font-heading font-bold text-amber-400 mt-1">{totalMedium}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-red-400 font-bold">Hard</div>
          <div className="text-2xl font-heading font-bold text-red-400 mt-1">{totalHard}</div>
        </div>
      </div>

      {/* 12 Algorithmic Topic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {topicKeys.map((key) => {
          const item = dsaState[key];
          if (!item) return null;
          const sum = (item.easy || 0) + (item.medium || 0) + (item.hard || 0);
          const percent = item.target > 0 ? Math.min(100, Math.round((sum / item.target) * 100)) : 0;
          const isDone = sum >= item.target;

          return (
            <div key={key} className="glass-card p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold text-sm text-text-primary">
                    {formatTopicTitle(key)}
                  </h4>
                  {isDone && <CheckCircle2 size={16} className="text-status-success" />}
                </div>
                <span className="text-xs text-text-muted font-bold">
                  {sum}/{item.target}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isDone ? "bg-status-success" : "bg-brand-primary"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Easy, Medium, Hard Counters */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                {/* Easy */}
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-emerald-400 font-bold">Easy</div>
                  <div className="text-sm font-bold text-text-primary my-1">{item.easy || 0}</div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleAdjust(key, "easy", -1)}
                      className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
                    >
                      <Minus size={10} />
                    </button>
                    <button
                      onClick={() => handleAdjust(key, "easy", 1)}
                      className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {/* Medium */}
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-amber-400 font-bold">Medium</div>
                  <div className="text-sm font-bold text-text-primary my-1">{item.medium || 0}</div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleAdjust(key, "medium", -1)}
                      className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
                    >
                      <Minus size={10} />
                    </button>
                    <button
                      onClick={() => handleAdjust(key, "medium", 1)}
                      className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {/* Hard */}
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-red-400 font-bold">Hard</div>
                  <div className="text-sm font-bold text-text-primary my-1">{item.hard || 0}</div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleAdjust(key, "hard", -1)}
                      className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
                    >
                      <Minus size={10} />
                    </button>
                    <button
                      onClick={() => handleAdjust(key, "hard", 1)}
                      className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
