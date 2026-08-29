"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  GraduationCap,
  Clock,
  BookOpen,
  Calendar,
} from "lucide-react";
import { StudySession } from "@/lib/types";
import { formatDateKey, generateId } from "@/lib/utils";
import { playChime } from "@/lib/audio";
import { Modal } from "@/components/ui/Modal";

interface StudyTabProps {
  sessions: StudySession[];
  onSaveSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
}

export const StudyTab: React.FC<StudyTabProps> = ({
  sessions,
  onSaveSession,
  onDeleteSession,
}) => {
  // Pomodoro States
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Manual Session Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState("Java");
  const [manualDuration, setManualDuration] = useState(60);
  const [sessionDate, setSessionDate] = useState(formatDateKey());
  const [sessionNotes, setSessionNotes] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set mode changes
  const switchMode = (newMode: "work" | "shortBreak" | "longBreak") => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "work") setTimeLeft(workDuration * 60);
    else if (newMode === "shortBreak") setTimeLeft(breakDuration * 60);
    else setTimeLeft(15 * 60);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChime("complete");

            // Auto-log session if it was work mode
            if (mode === "work") {
              const newSession: StudySession = {
                id: generateId("study"),
                subject: "Pomodoro Focus",
                duration: workDuration,
                date: formatDateKey(),
                mode: "pomodoro",
                notes: `Completed ${workDuration}m Pomodoro cycle`,
                createdAt: new Date().toISOString(),
              };
              onSaveSession(newSession);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, workDuration, onSaveSession]);

  const toggleStart = () => {
    if (!isRunning) {
      playChime("start");
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === "work") setTimeLeft(workDuration * 60);
    else if (mode === "shortBreak") setTimeLeft(breakDuration * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Total statistics
  const totalMins = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalHours = (totalMins / 60).toFixed(1);
  const todayMins = sessions
    .filter((s) => s.date === formatDateKey())
    .reduce((acc, s) => acc + (s.duration || 0), 0);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: StudySession = {
      id: generateId("study"),
      subject,
      duration: Number(manualDuration),
      date: sessionDate,
      mode: "manual",
      notes: sessionNotes,
      createdAt: new Date().toISOString(),
    };
    onSaveSession(newSession);
    setIsModalOpen(false);
    setSessionNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pomodoro Console (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 bg-bg-primary/60 p-1.5 rounded-2xl border border-white/5 mb-8">
            <button
              onClick={() => switchMode("work")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "work"
                  ? "bg-brand-primary text-white shadow-glow"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Work ({workDuration}m)
            </button>
            <button
              onClick={() => switchMode("shortBreak")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "shortBreak"
                  ? "bg-status-success text-white shadow-glow"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Short Break ({breakDuration}m)
            </button>
            <button
              onClick={() => switchMode("longBreak")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "longBreak"
                  ? "bg-status-info text-white shadow-glow"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Time Display */}
          <div className="font-heading font-extrabold text-7xl sm:text-8xl tracking-tight text-text-primary mb-8 select-none drop-shadow-md">
            {formatTime(timeLeft)}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleStart}
              className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-bold text-white transition-all transform hover:scale-105 shadow-glow ${
                isRunning ? "bg-status-warning" : "bg-brand-primary"
              }`}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              <span>{isRunning ? "Pause" : "Start Focus"}</span>
            </button>
            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10 transition-all"
              title="Reset Timer"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Custom Duration Adjusters */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-6 text-xs text-text-secondary">
            <label className="flex items-center gap-2">
              <span>Work:</span>
              <input
                type="number"
                min={1}
                max={120}
                value={workDuration}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWorkDuration(val);
                  if (mode === "work") setTimeLeft(val * 60);
                }}
                className="w-14 bg-bg-secondary border border-white/10 rounded-lg px-2 py-1 text-text-primary text-center"
              />
              <span>min</span>
            </label>
            <label className="flex items-center gap-2">
              <span>Break:</span>
              <input
                type="number"
                min={1}
                max={60}
                value={breakDuration}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBreakDuration(val);
                  if (mode === "shortBreak") setTimeLeft(val * 60);
                }}
                className="w-14 bg-bg-secondary border border-white/10 rounded-lg px-2 py-1 text-text-primary text-center"
              />
              <span>min</span>
            </label>
          </div>
        </div>

        {/* Study Stats & Quick Log (1 col) */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-base text-text-primary mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-brand-primary" /> Study Summary
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Study Today</span>
                <span className="text-xl font-heading font-bold text-brand-primary">
                  {(todayMins / 60).toFixed(1)} hrs
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-xs text-text-secondary">All-Time Study</span>
                <span className="text-xl font-heading font-bold text-status-success">
                  {totalHours} hrs
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Total Sessions</span>
                <span className="text-xl font-heading font-bold text-text-primary">
                  {sessions.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/30 text-xs font-bold transition-all shadow-glow"
            >
              <Plus size={16} /> Log Manual Session
            </button>
          </div>
        </div>
      </div>

      {/* Study Sessions History Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <BookOpen size={18} className="text-brand-primary" /> Logged Study Sessions
          </h3>
          <span className="text-xs text-text-muted">{sessions.length} sessions logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-text-muted">
                    No study sessions logged yet. Complete a Pomodoro session or add one manually!
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-primary">{s.subject}</td>
                    <td className="py-3.5 px-4 text-brand-primary font-bold">{s.duration} mins</td>
                    <td className="py-3.5 px-4 text-text-secondary">{s.date}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          s.mode === "pomodoro"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {s.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted max-w-xs truncate">{s.notes || "—"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteSession(s.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-all"
                        title="Delete Session"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Study Session"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Subject / Topic
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Java Concurrency, LeetCode Trees"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                required
                min={5}
                max={720}
                value={manualDuration}
                onChange={(e) => setManualDuration(Number(e.target.value))}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Notes & Key Learnings
            </label>
            <textarea
              rows={3}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="What did you study or build during this session?"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow"
            >
              Save Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
