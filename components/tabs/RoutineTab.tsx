"use client";

import React, { useState } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { DailyRoutine, RoutineActivity } from "@/lib/types";
import { formatDateKey, formatReadableDate } from "@/lib/utils";
import { defaultRoutineTemplate } from "@/lib/dataService";
import { Modal } from "@/components/ui/Modal";

interface RoutineTabProps {
  routine: DailyRoutine;
  onUpdateRoutine: (updatedRoutine: DailyRoutine) => void;
}

export const RoutineTab: React.FC<RoutineTabProps> = ({
  routine,
  onUpdateRoutine,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New slot state
  const [slotName, setSlotName] = useState("");
  const [slotTime, setSlotTime] = useState("09:00 AM");
  const [slotCategory, setSlotCategory] = useState<RoutineActivity["category"]>("Career");
  const [slotDuration, setSlotDuration] = useState(30);

  // Get or seed routine for selectedDate
  const activities: RoutineActivity[] =
    routine[selectedDate] && routine[selectedDate].length > 0
      ? routine[selectedDate]
      : defaultRoutineTemplate.map((item, idx) => ({
          ...item,
          id: `routine_${selectedDate}_${idx}`,
          status: "pending",
        }));

  // Date controls
  const handleDateShift = (deltaDays: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + deltaDays);
    setSelectedDate(formatDateKey(current));
  };

  const handleStatusChange = (
    activityId: string,
    newStatus: "completed" | "pending" | "missed"
  ) => {
    const updated = activities.map((act) =>
      act.id === activityId ? { ...act, status: newStatus } : act
    );
    onUpdateRoutine({
      ...routine,
      [selectedDate]: updated,
    });
  };

  const handleResetToTemplate = () => {
    const fresh = defaultRoutineTemplate.map((item, idx) => ({
      ...item,
      id: `routine_${selectedDate}_${idx}`,
      status: "pending" as const,
    }));
    onUpdateRoutine({
      ...routine,
      [selectedDate]: fresh,
    });
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newAct: RoutineActivity = {
      id: `custom_${Date.now()}`,
      name: slotName,
      time: slotTime,
      category: slotCategory,
      duration: Number(slotDuration),
      status: "pending",
    };
    onUpdateRoutine({
      ...routine,
      [selectedDate]: [...activities, newAct],
    });
    setIsAddModalOpen(false);
    setSlotName("");
  };

  // Metrics
  const completedCount = activities.filter((a) => a.status === "completed").length;
  const pendingCount = activities.filter((a) => a.status === "pending").length;
  const missedCount = activities.filter((a) => a.status === "missed").length;
  const totalCount = activities.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Health":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Fitness":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Career":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "Work":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "Commute":
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
      case "Food":
        return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "Recovery":
        return "bg-teal-500/15 text-teal-400 border-teal-500/30";
      case "Sleep":
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Header & Quick Summary */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDateShift(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10 transition-all"
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary">
              {formatReadableDate(selectedDate)}
            </h2>
            <div className="text-xs text-text-muted mt-0.5">
              {selectedDate === formatDateKey() ? "Today's Schedule" : "Scheduled Time Blocks"}
            </div>
          </div>
          <button
            onClick={() => handleDateShift(1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10 transition-all"
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-bg-secondary border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand-primary ml-2"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToTemplate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary border border-white/10 transition-all"
          >
            <RotateCcw size={14} /> Reset Template
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-xs font-bold text-white shadow-glow transition-all"
          >
            <Plus size={14} /> Add Block
          </button>
        </div>
      </div>

      {/* Progress & Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
            Routine Completion
          </div>
          <div className="text-2xl font-heading font-bold text-brand-primary mt-1">
            {percent}%
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
            Completed
          </div>
          <div className="text-2xl font-heading font-bold text-status-success mt-1">
            {completedCount}
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
            Pending
          </div>
          <div className="text-2xl font-heading font-bold text-status-warning mt-1">
            {pendingCount}
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
            Missed
          </div>
          <div className="text-2xl font-heading font-bold text-status-danger mt-1">
            {missedCount}
          </div>
        </div>
      </div>

      {/* Timeline Schedule Cards */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <CalendarCheck size={18} className="text-brand-primary" /> Daily Schedule Timeline
          </h3>
          <span className="text-xs text-text-muted">{totalCount} blocks</span>
        </div>

        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                act.status === "completed"
                  ? "bg-status-success/[0.04] border-status-success/20"
                  : act.status === "missed"
                  ? "bg-status-danger/[0.04] border-status-danger/20"
                  : "bg-white/[0.01] border-white/5 hover:border-white/10"
              }`}
            >
              {/* Left Details */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="font-mono text-xs font-semibold text-text-secondary bg-black/30 px-2.5 py-1 rounded-lg border border-white/5 shrink-0">
                  {act.time}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{act.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(
                        act.category
                      )}`}
                    >
                      {act.category}
                    </span>
                  </div>
                  {act.duration > 0 && (
                    <div className="text-xs text-text-muted mt-0.5">{act.duration} minutes</div>
                  )}
                </div>
              </div>

              {/* Right Status Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleStatusChange(act.id, "completed")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    act.status === "completed"
                      ? "bg-status-success text-white border-status-success shadow-glow"
                      : "bg-white/5 text-text-secondary hover:text-status-success border-white/5"
                  }`}
                >
                  <CheckCircle2 size={14} /> Done
                </button>
                <button
                  onClick={() => handleStatusChange(act.id, "pending")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    act.status === "pending"
                      ? "bg-status-warning text-white border-status-warning shadow-glow"
                      : "bg-white/5 text-text-secondary hover:text-status-warning border-white/5"
                  }`}
                >
                  <Clock size={14} /> Pending
                </button>
                <button
                  onClick={() => handleStatusChange(act.id, "missed")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    act.status === "missed"
                  ? "bg-status-danger text-white border-status-danger shadow-glow"
                  : "bg-white/5 text-text-secondary hover:text-status-danger border-white/5"
                  }`}
                >
                  <XCircle size={14} /> Missed
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Schedule Time Block"
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Activity Name
            </label>
            <input
              type="text"
              required
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              placeholder="e.g. System Design Mock Interview"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Time (e.g. 07:00 PM)
              </label>
              <input
                type="text"
                required
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Category
              </label>
              <select
                value={slotCategory}
                onChange={(e) => setSlotCategory(e.target.value as RoutineActivity["category"])}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              >
                <option value="Health">Health</option>
                <option value="Fitness">Fitness</option>
                <option value="Career">Career</option>
                <option value="Work">Work</option>
                <option value="Commute">Commute</option>
                <option value="Food">Food</option>
                <option value="Recovery">Recovery</option>
                <option value="Sleep">Sleep</option>
                <option value="Personal">Personal</option>
                <option value="Spiritual">Spiritual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min={0}
              max={600}
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
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
              Add Block
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
