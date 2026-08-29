"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Sparkles, Info } from "lucide-react";
import { MatchScoreResult } from "@/lib/jobApplicationTypes";

interface ResumeMatchCardProps {
  matchResult: MatchScoreResult | null;
  isLoading: boolean;
  onRefreshMatch?: () => void;
}

export const ResumeMatchCard: React.FC<ResumeMatchCardProps> = ({
  matchResult,
  isLoading,
  onRefreshMatch,
}) => {
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-bg-secondary/70 border border-white/5 flex items-center justify-center gap-3">
        <div className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
        <span className="text-xs text-text-secondary">
          Calculating AI-assisted resume match...
        </span>
      </div>
    );
  }

  if (!matchResult) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-status-success stroke-status-success";
    if (score >= 60) return "text-status-warning stroke-status-warning";
    return "text-brand-primary stroke-brand-primary";
  };

  const getRecommendationBadge = (score: number) => {
    if (score >= 80) {
      return "bg-status-success/15 border-status-success/30 text-status-success";
    }
    if (score >= 60) {
      return "bg-status-warning/15 border-status-warning/30 text-status-warning";
    }
    return "bg-brand-primary/15 border-brand-primary/30 text-brand-primary";
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-sm font-heading font-bold text-text-primary">
              Resume & Job Match
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-text-muted">
              <Info size={11} />
              <span>AI-assisted estimate</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getRecommendationBadge(
              matchResult.score
            )}`}
          >
            {matchResult.recommendation}
          </span>
          <div className="text-right">
            <span
              className={`font-heading font-extrabold text-2xl ${getScoreColor(
                matchResult.score
              )}`}
            >
              {matchResult.score}%
            </span>
            <span className="text-[10px] text-text-muted block">Match</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
        {matchResult.summary}
      </p>

      {/* Matches and Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Strong Matches */}
        <div className="space-y-2 p-3 rounded-xl bg-status-success/5 border border-status-success/15">
          <div className="text-xs font-bold text-status-success flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Strong Matches
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchResult.strong_matches.length > 0 ? (
              matchResult.strong_matches.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-status-success/10 text-status-success border border-status-success/20 text-[11px] font-medium"
                >
                  ✓ {skill}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-text-muted">No explicit overlap detected</span>
            )}
          </div>
        </div>

        {/* Potential Gaps */}
        <div className="space-y-2 p-3 rounded-xl bg-status-warning/5 border border-status-warning/15">
          <div className="text-xs font-bold text-status-warning flex items-center gap-1.5">
            <AlertTriangle size={14} /> Potential Gaps
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchResult.potential_gaps.length > 0 ? (
              matchResult.potential_gaps.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-status-warning/10 text-status-warning border border-status-warning/20 text-[11px] font-medium"
                >
                  ⚠ {skill}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-text-muted">All primary skills matched</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
