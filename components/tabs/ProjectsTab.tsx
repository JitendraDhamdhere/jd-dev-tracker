"use client";

import React, { useState } from "react";
import {
  FolderGit2,
  Plus,
  Github,
  ExternalLink,
  Trash2,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import { Project, Milestone } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface ProjectsTabProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  onSaveProject,
  onDeleteProject,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techStackStr, setTechStackStr] = useState("Spring Boot, Docker, React");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const handleToggleMilestone = (project: Project, mId: string) => {
    const updated = project.milestones.map((m) =>
      m.id === mId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updated.filter((m) => m.completed).length;
    const progress =
      updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;

    onSaveProject({
      ...project,
      milestones: updated,
      progress,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProj: Project = {
      id: generateId("proj"),
      name,
      description,
      techStack: techStackStr.split(",").map((s) => s.trim()).filter(Boolean),
      githubUrl,
      liveUrl,
      status: "in_progress",
      progress: 0,
      milestones: [
        { id: generateId("m"), title: "Architecture & Database Design", completed: true },
        { id: generateId("m"), title: "Core REST APIs & Auth", completed: false },
        { id: generateId("m"), title: "Docker deployment & CI/CD", completed: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveProject(newProj);
    setIsAddModalOpen(false);
    setName("");
    setDescription("");
    setGithubUrl("");
    setLiveUrl("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <FolderGit2 size={22} className="text-brand-primary" /> Project Portfolio Showcase
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Track key architecture projects, code repositories, and milestone releases
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
        >
          <Plus size={15} /> Add Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="glass-card p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    {proj.name}
                  </h3>
                  <div className="text-xs text-text-muted mt-1 leading-relaxed">
                    {proj.description}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteProject(proj.id)}
                  className="text-text-muted hover:text-status-danger p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Tech stack tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {proj.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                  <span>Milestones Progress</span>
                  <span className="font-bold text-brand-primary">{proj.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Milestones list */}
              <div className="mt-3 space-y-1.5">
                {proj.milestones.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={() => handleToggleMilestone(proj, m.id)}
                      className="rounded bg-bg-primary border-white/10 text-brand-primary focus:ring-0"
                    />
                    <span className={m.completed ? "line-through text-text-muted" : ""}>
                      {m.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Links footer */}
            <div className="pt-3 border-t border-white/5 flex items-center gap-4 text-xs">
              {proj.githubUrl && (
                <a
                  href={proj.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary"
                >
                  <Github size={14} /> Repository
                </a>
              )}
              {proj.liveUrl && (
                <a
                  href={proj.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-brand-primary hover:underline"
                >
                  <ExternalLink size={14} /> Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Showcase Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Cache & Rate Limiter"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief architecture and goals"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Tech Stack (comma separated)
            </label>
            <input
              type="text"
              value={techStackStr}
              onChange={(e) => setTechStackStr(e.target.value)}
              placeholder="Java, Spring Boot, Redis, Docker"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Live URL
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
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
              Save Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
