"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Calendar,
  Kanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import { Task, Subtask } from "@/lib/types";
import { formatDateKey, generateId, formatReadableDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface TasksTabProps {
  tasks: Task[];
  onSaveTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  onSaveTask,
  onDeleteTask,
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "calendar">("kanban");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [category, setCategory] = useState("Development");
  const [dueDate, setDueDate] = useState(formatDateKey());
  const [subtasksList, setSubtasksList] = useState<string[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const columns: { id: Task["status"]; label: string; color: string }[] = [
    { id: "todo", label: "To Do", color: "border-slate-500/30" },
    { id: "in_progress", label: "In Progress", color: "border-blue-500/30" },
    { id: "testing", label: "Testing / Review", color: "border-purple-500/30" },
    { id: "completed", label: "Completed", color: "border-emerald-500/30" },
  ];

  const handleStatusChange = (task: Task, nextStatus: Task["status"]) => {
    onSaveTask({
      ...task,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onSaveTask({
      ...task,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddSubtaskDraft = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasksList([...subtasksList, newSubtaskTitle.trim()]);
    setNewSubtaskTitle("");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: generateId("task"),
      title,
      description,
      status: "todo",
      priority,
      category,
      dueDate,
      tags: [category],
      subtasks: subtasksList.map((st) => ({
        id: generateId("st"),
        title: st,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveTask(newTask);
    setIsAddModalOpen(false);
    setTitle("");
    setDescription("");
    setSubtasksList([]);
  };

  // Calendar grouping
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    if (t.dueDate) {
      if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
      tasksByDate[t.dueDate].push(t);
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <CheckSquare size={22} className="text-brand-primary" /> Tasks & Kanban Board
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Organize development sprints, subtask checklists, and release deadlines
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-bg-secondary p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                viewMode === "kanban"
                  ? "bg-brand-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                viewMode === "calendar"
                  ? "bg-brand-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Calendar size={14} /> Calendar
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
          >
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="flex flex-col glass-card p-4 min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                      {col.label}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {colTasks.map((task) => {
                    const completedSub = task.subtasks?.filter((s) => s.completed).length || 0;
                    const totalSub = task.subtasks?.length || 0;
                    const subPercent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

                    return (
                      <div
                        key={task.id}
                        className="glass-card bg-bg-secondary/70 p-4 border border-white/5 hover:border-white/15 transition-all shadow-md group space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              task.priority === "urgent"
                                ? "bg-status-danger/20 text-status-danger"
                                : task.priority === "high"
                                ? "bg-status-warning/20 text-status-warning"
                                : "bg-white/5 text-text-secondary"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="text-text-muted hover:text-status-danger p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="font-semibold text-xs text-text-primary leading-snug">
                          {task.title}
                        </div>

                        {task.description && (
                          <div className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                            {task.description}
                          </div>
                        )}

                        {/* Subtasks checklist */}
                        {totalSub > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-text-muted">
                              <span>Checklist</span>
                              <span>{completedSub}/{totalSub}</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-primary rounded-full transition-all"
                                style={{ width: `${subPercent}%` }}
                              />
                            </div>
                            <div className="space-y-1 pt-1">
                              {task.subtasks.map((st) => (
                                <label
                                  key={st.id}
                                  className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer hover:text-text-primary"
                                >
                                  <input
                                    type="checkbox"
                                    checked={st.completed}
                                    onChange={() => handleToggleSubtask(task, st.id)}
                                    className="rounded bg-bg-primary border-white/10 text-brand-primary focus:ring-0"
                                  />
                                  <span className={st.completed ? "line-through text-text-muted" : ""}>
                                    {st.title}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Move column quick buttons */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <Clock size={11} /> {task.dueDate || "No date"}
                          </span>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task, e.target.value as Task["status"])}
                            className="bg-bg-primary text-[10px] text-text-secondary border border-white/10 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="testing">Testing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar View */
        <div className="glass-card p-6">
          <h3 className="font-heading font-bold text-base text-text-primary mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-brand-primary" /> Task Deadlines Calendar
          </h3>
          <div className="space-y-4">
            {Object.entries(tasksByDate).map(([dateStr, dateTasks]) => (
              <div key={dateStr} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="font-mono text-xs font-bold text-brand-primary flex items-center gap-2">
                  <Calendar size={14} /> {formatReadableDate(dateStr)} ({dateTasks.length} tasks)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dateTasks.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-bg-secondary border border-white/5 text-xs">
                      <div className="font-semibold text-text-primary">{t.title}</div>
                      <div className="text-[10px] text-text-muted mt-1">Status: {t.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build JWT authentication filter"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details or acceptance criteria"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Dev, DSA..."
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Subtasks inline builder */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Add Subtasks
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="e.g. Unit tests, Docker file"
                className="flex-1 bg-bg-secondary border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={handleAddSubtaskDraft}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl"
              >
                Add
              </button>
            </div>
            {subtasksList.length > 0 && (
              <ul className="space-y-1 text-xs text-text-muted">
                {subtasksList.map((st, i) => (
                  <li key={i}>• {st}</li>
                ))}
              </ul>
            )}
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
              Save Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
