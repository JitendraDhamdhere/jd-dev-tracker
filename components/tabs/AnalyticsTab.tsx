"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import {
  StudySession,
  JobApplication,
  TechChecklist,
  DailyRoutine,
} from "@/lib/types";
import { formatDateKey } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsTabProps {
  studySessions: StudySession[];
  jobs: JobApplication[];
  trackers: {
    java: TechChecklist;
    spring: TechChecklist;
    mysql: TechChecklist;
  };
  routine: DailyRoutine;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  studySessions,
  jobs,
  trackers,
  routine,
}) => {
  // 14-Day Study Trend Area Chart
  const studyTrend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = formatDateKey(d);
    const mins = studySessions
      .filter((s) => s.date === key)
      .reduce((acc, curr) => acc + (curr.duration || 0), 0);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hours: Number((mins / 60).toFixed(1)),
    };
  });

  // Competency mastery data
  const calcChecklist = (obj: TechChecklist) => {
    const entries = Object.values(obj || {});
    if (!entries.length) return 0;
    const completed = entries.filter(Boolean).length;
    return Math.round((completed / entries.length) * 100);
  };

  const skillData = [
    { name: "Java Core", score: calcChecklist(trackers?.java) },
    { name: "Spring Boot", score: calcChecklist(trackers?.spring) },
    { name: "MySQL DB", score: calcChecklist(trackers?.mysql) },
    { name: "Distributed Sys", score: 65 },
    { name: "Algorithms", score: 70 },
  ];

  // Job Funnel data
  const appliedCount = jobs.length;
  const screeningCount = jobs.filter((j) => ["screening", "interview", "offer"].includes(j.status)).length;
  const interviewCount = jobs.filter((j) => ["interview", "offer"].includes(j.status)).length;
  const offerCount = jobs.filter((j) => j.status === "offer").length;

  const funnelData = [
    { stage: "Applied", count: appliedCount },
    { stage: "Screening", count: screeningCount },
    { stage: "Interviews", count: interviewCount },
    { stage: "Offers", count: offerCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
          <BarChart3 size={22} className="text-brand-primary" /> Productivity & Career Analytics
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Deep telemetry on study habits, skill progression, and job interview conversion rates
        </p>
      </div>

      {/* 14-Day Study Trend Area Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
              <Clock size={18} className="text-brand-primary" /> 14-Day Study Trend
            </h3>
            <span className="text-xs text-text-muted">Daily focused learning hours</span>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={studyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#121826",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#f3f4f6",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#studyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2 Grid: Skill Mastery & Job Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Mastery Competency Bar */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-bold text-base text-text-primary mb-4 flex items-center gap-2">
            <Award size={18} className="text-status-success" /> Tech Competency Distribution (%)
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121826",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#f3f4f6",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="score" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Funnel Conversion */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-bold text-base text-text-primary mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-status-warning" /> Recruiter Pipeline Funnel
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="stage" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121826",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#f3f4f6",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
