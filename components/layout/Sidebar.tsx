"use client";

import React from "react";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  CalendarDays,
  CheckCheck,
  StickyNote,
  CheckSquare,
  Milestone,
  Code2,
  Leaf,
  Database,
  GitFork,
  FolderGit2,
  MessagesSquare,
  Briefcase,
  Award,
  BarChart3,
  Settings,
  Terminal,
  X,
  Send,
} from "lucide-react";
import { Profile } from "@/lib/types";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  isOpen,
  onClose,
}) => {
  const mainItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "study", label: "Daily Study", icon: GraduationCap },
    { id: "routine", label: "Daily Routine", icon: CalendarCheck },
    { id: "daily-planner", label: "Daily Planner", icon: CalendarDays },
    { id: "habits", label: "Habit Tracker", icon: CheckCheck },
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "roadmap", label: "Roadmap", icon: Milestone },
  ];

  const trackerItems: MenuItem[] = [
    { id: "java-tracker", label: "Java Tracker", icon: Code2 },
    { id: "springboot-tracker", label: "Spring Boot Tracker", icon: Leaf },
    { id: "mysql-tracker", label: "MySQL Tracker", icon: Database },
    { id: "dsa-tracker", label: "DSA Tracker", icon: GitFork },
  ];

  const careerItems: MenuItem[] = [
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "interviews", label: "Interview Prep", icon: MessagesSquare },
    { id: "jobs", label: "Job Applications", icon: Briefcase },
    { id: "job-application-send", label: "Job Application Send", icon: Send },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderNavGroup = (items: MenuItem[]) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <li key={item.id}>
            <button
              onClick={() => {
                onSelectTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-brand-primary text-white shadow-glow"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "text-white" : "text-text-muted"} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-bg-sidebar border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Brand Header */}
        <div className="h-[70px] px-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-glow">
              <Terminal size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base text-text-primary tracking-tight">
                DevTrack <span className="text-brand-primary">Pro</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">
                dev-Jitendra
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menus (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2">
              Workspace
            </div>
            {renderNavGroup(mainItems)}
          </div>

          <div className="h-px bg-white/5 mx-2" />

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2">
              Skill Trackers
            </div>
            {renderNavGroup(trackerItems)}
          </div>

          <div className="h-px bg-white/5 mx-2" />

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2">
              Career & Data
            </div>
            {renderNavGroup(careerItems)}
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={() => onSelectTab("settings")}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-primary font-heading font-bold text-white flex items-center justify-center text-sm shadow-md">
              {profile.avatar || "JD"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-text-primary truncate">{profile.name}</div>
              <div className="text-xs text-text-muted truncate">{profile.role || "Software Developer"}</div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
