"use client";

import React, { useState } from "react";
import { CheckCheck, Check, Plus, Trash2, Award } from "lucide-react";
import { Habit, HabitHistory } from "@/lib/types";
import { formatDateKey, generateId } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface HabitsTabProps {
  habits: Habit[];
  history: HabitHistory;
  onUpdateHabits: (habits: Habit[], history: HabitHistory) => void;
}

export const HabitsTab: React.FC<HabitsTabProps> = ({
  habits,
  history,
  onUpdateHabits,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("Career");

  // Get last 7 days dates
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateKey: formatDateKey(d),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: d.getDate(),
    };
  });

  const toggleHabitDay = (habitId: string, dateKey: string) => {
    const habitRecord = history[habitId] || {};
    const current = !!habitRecord[dateKey];
    const updatedHistory: HabitHistory = {
      ...history,
      [habitId]: {
        ...habitRecord,
        [dateKey]: !current,
      },
    };
    onUpdateHabits(habits, updatedHistory);
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHabit: Habit = {
      id: generateId("habit"),
      name: newHabitName,
      category: newHabitCategory,
      targetPerWeek: 7,
    };
    onUpdateHabits([...habits, newHabit], history);
    setIsAddModalOpen(false);
    setNewHabitName("");
  };

  const handleDeleteHabit = (id: string) => {
    const filtered = habits.filter((h) => h.id !== id);
    const updatedHistory = { ...history };
    delete updatedHistory[id];
    onUpdateHabits(filtered, updatedHistory);
  };

  // Overall compliance
  let totalOpportunities = habits.length * 7;
  let totalDone = 0;
  habits.forEach((h) => {
    days.forEach((d) => {
      if (history[h.id]?.[d.dateKey]) totalDone++;
    });
  });
  const overallRate =
    totalOpportunities > 0 ? Math.round((totalDone / totalOpportunities) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <CheckCheck size={22} className="text-status-success" /> Habits Consistency Matrix
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Build unshakeable daily habits across a rolling 7-day consistency grid
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-status-success/10 border border-status-success/20 text-status-success text-xs font-bold">
            <Award size={16} /> 7-Day Consistency: {overallRate}%
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
          >
            <Plus size={15} /> Add Habit
          </button>
        </div>
      </div>

      {/* Habits Matrix Grid Table */}
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead>
            <tr className="border-b border-white/5 text-text-muted uppercase tracking-wider">
              <th className="py-3 px-4 w-1/3">Habit Name</th>
              {days.map((d) => (
                <th key={d.dateKey} className="py-3 px-3 text-center">
                  <div className="font-bold text-text-primary">{d.dayName}</div>
                  <div className="text-[10px] text-text-muted font-normal">{d.dayNumber}</div>
                </th>
              ))}
              <th className="py-3 px-4 text-center">Compliance</th>
              <th className="py-3 px-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {habits.map((habit) => {
              const checkedCount = days.filter((d) => history[habit.id]?.[d.dateKey]).length;
              const habitPercent = Math.round((checkedCount / 7) * 100);

              return (
                <tr key={habit.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 font-semibold text-text-primary">
                    <div className="flex items-center gap-2">
                      <span>{habit.name}</span>
                      {habit.category && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-text-muted">
                          {habit.category}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 7 Days checkboxes */}
                  {days.map((d) => {
                    const isChecked = !!history[habit.id]?.[d.dateKey];
                    return (
                      <td key={d.dateKey} className="py-4 px-3 text-center">
                        <button
                          onClick={() => toggleHabitDay(habit.id, d.dateKey)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-status-success text-white shadow-glow"
                              : "bg-white/5 hover:bg-white/10 text-transparent hover:text-white/30 border border-white/10"
                          }`}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                      </td>
                    );
                  })}

                  {/* Compliance Rate */}
                  <td className="py-4 px-4 text-center">
                    <div className="font-heading font-bold text-sm text-text-primary">
                      {habitPercent}%
                    </div>
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto mt-1">
                      <div
                        className="h-full bg-status-success rounded-full transition-all"
                        style={{ width: `${habitPercent}%` }}
                      />
                    </div>
                  </td>

                  {/* Delete */}
                  <td className="py-4 px-2 text-right">
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1 rounded text-text-muted hover:text-status-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Habit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Daily Habit"
      >
        <form onSubmit={handleAddHabit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g. Read 15 mins of Architecture Docs"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Category
            </label>
            <select
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value)}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            >
              <option value="Health">Health</option>
              <option value="Fitness">Fitness</option>
              <option value="Career">Career</option>
              <option value="Productivity">Productivity</option>
              <option value="Mindset">Mindset</option>
            </select>
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
              Save Habit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
