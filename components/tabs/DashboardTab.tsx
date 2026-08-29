"use client";

import React from "react";
import {
  Flame,
  Clock,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Award,
  ListTodo,
} from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import {
  Profile,
  StudySession,
  Task,
  JobApplication,
  Interview,
  DailyRoutine,
  TechChecklist,
} from "@/lib/types";
import { formatDateKey } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DashboardTabProps {
  profile: Profile;
  studySessions: StudySession[];
  tasks: Task[];
  jobs: JobApplication[];
  interviews: Interview[];
  routine: DailyRoutine;
  trackers: {
    java: TechChecklist;
    spring: TechChecklist;
    mysql: TechChecklist;
  };
  onNavigate: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  profile,
  studySessions,
  tasks,
  jobs,
  interviews,
  routine,
  trackers,
  onNavigate,
}) => {
  const todayKey = formatDateKey();

  // Calculate today's study minutes
  const todayStudyMins = (studySessions || [])
    .filter((s) => s.date === todayKey)
    .reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const todayStudyHours = (todayStudyMins / 60).toFixed(1);

  // Calculate task counts
  const completedTasks = (tasks || []).filter((t) => t.status === "completed").length;
  const pendingTasks = (tasks || []).filter((t) => t.status !== "completed").length;

  // Calculate job counts
  const appliedJobs = (jobs || []).length;
  const activeInterviews = (interviews || []).filter((i) => i.status === "scheduled").length;

  // Routine counts for today
  const todayRoutine = routine[todayKey] || [];
  const completedRoutine = todayRoutine.filter((r) => r.status === "completed").length;
  const pendingRoutine = todayRoutine.filter((r) => r.status === "pending").length;
  const missedRoutine = todayRoutine.filter((r) => r.status === "missed").length;
  const totalRoutine = todayRoutine.length;
  const routinePercent = totalRoutine > 0 ? Math.round((completedRoutine / totalRoutine) * 100) : 0;

  // Weekly study data for chart (last 7 days)
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dKey = formatDateKey(d);
    const dayName = daysOfWeek[d.getDay()];
    const mins = (studySessions || [])
      .filter((s) => s.date === dKey)
      .reduce((acc, curr) => acc + (curr.duration || 0), 0);
    return {
      day: dayName,
      hours: Number((mins / 60).toFixed(1)),
    };
  });

  // Calculate tech mastery %
  const calcChecklist = (obj: TechChecklist) => {
    const entries = Object.values(obj || {});
    if (!entries.length) return 0;
    const completed = entries.filter(Boolean).length;
    return (completed / entries.length) * 100;
  };

  const javaPercent = calcChecklist(trackers?.java);
  const springPercent = calcChecklist(trackers?.spring);
  const mysqlPercent = calcChecklist(trackers?.mysql);

  return (
    <div className="space-y-6">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="glass-card p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-text-primary">
              {profile.studyStreak || 12} Days
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Current Study Streak</div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-500/40" />
        </div>

        {/* Study Hours Today */}
        <div className="glass-card p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-text-primary">
              {todayStudyHours} hrs
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">
              Study Today (Target: {profile.dailyTargetHours || 4}h)
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-brand-primary/40" />
        </div>

        {/* Tasks */}
        <div className="glass-card p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-status-success/10 border border-status-success/20 flex items-center justify-center text-status-success group-hover:scale-110 transition-transform">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-text-primary">
              {completedTasks}
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">
              Tasks Done ({pendingTasks} left)
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-status-success/40" />
        </div>

        {/* Jobs */}
        <div className="glass-card p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-status-warning/10 border border-status-warning/20 flex items-center justify-center text-status-warning group-hover:scale-110 transition-transform">
            <Briefcase size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-text-primary">
              {appliedJobs}
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">
              Jobs Applied ({activeInterviews} interviews)
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-status-warning/40" />
        </div>
      </div>

      {/* Daily Routine Summary Bar */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-primary" /> Daily Routine System
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Fixed consistency schedule for Monday–Friday
            </p>
          </div>
          <button
            onClick={() => onNavigate("routine")}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-brand-primary text-text-secondary hover:text-white border border-white/10 transition-all"
          >
            <span>View Routine</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
              Completion
            </div>
            <div className="text-2xl font-bold font-heading text-brand-primary mt-1">
              {routinePercent}%
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
              Completed
            </div>
            <div className="text-2xl font-bold font-heading text-status-success mt-1">
              {completedRoutine}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
              Pending
            </div>
            <div className="text-2xl font-bold font-heading text-status-warning mt-1">
              {pendingRoutine}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
              Missed
            </div>
            <div className="text-2xl font-bold font-heading text-status-danger mt-1">
              {missedRoutine}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Progress Rings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Chart (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-text-primary">
              Weekly Study Hours
            </h3>
            <span className="text-xs text-text-muted">Rolling 7-Day Trend</span>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121826",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#f3f4f6",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Mastery Summary (1 col) */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-text-primary">
              Skill Mastery
            </h3>
            <Award size={18} className="text-brand-primary" />
          </div>

          <div className="grid grid-cols-3 gap-2 py-4">
            <ProgressRing
              percentage={javaPercent}
              size={80}
              strokeColor="#3b82f6"
              label="Java Core"
            />
            <ProgressRing
              percentage={springPercent}
              size={80}
              strokeColor="#10b981"
              label="Spring Boot"
            />
            <ProgressRing
              percentage={mysqlPercent}
              size={80}
              strokeColor="#f59e0b"
              label="MySQL"
            />
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-text-muted">Target: 80% across all tech</span>
            <button
              onClick={() => onNavigate("java-tracker")}
              className="text-brand-primary hover:underline font-semibold"
            >
              Open Trackers
            </button>
          </div>
        </div>
      </div>

      {/* Active Tasks Widget */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <ListTodo size={18} className="text-brand-primary" /> Active Tasks
          </h3>
          <button
            onClick={() => onNavigate("tasks")}
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            View Board
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {(tasks || []).slice(0, 3).map((task) => (
            <div key={task.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    task.status === "completed"
                      ? "bg-status-success"
                      : task.status === "in_progress"
                      ? "bg-brand-primary animate-pulse"
                      : "bg-text-muted"
                  }`}
                />
                <div>
                  <div className="text-sm font-semibold text-text-primary">{task.title}</div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {task.category || "General"} • {task.subtasks?.length || 0} subtasks
                  </div>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  task.priority === "urgent"
                    ? "bg-status-danger/20 text-status-danger"
                    : task.priority === "high"
                    ? "bg-status-warning/20 text-status-warning"
                    : "bg-white/5 text-text-secondary"
                }`}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
