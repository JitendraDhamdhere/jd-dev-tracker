"use client";

import React, { useState } from "react";
import { Menu, Search, Sun, Moon, Clock, RefreshCw } from "lucide-react";
import { Profile } from "@/lib/types";

interface HeaderProps {
  currentTab: string;
  onOpenSidebar: () => void;
  onQuickTimer: () => void;
  onRefresh: () => void;
  profile: Profile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenSidebar,
  onQuickTimer,
  onRefresh,
  profile,
  searchQuery,
  onSearchChange,
}) => {
  const [isLight, setIsLight] = useState(false);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.setAttribute("data-theme", next ? "light" : "dark");
  };

  const formatTabTitle = (tab: string) => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard Overview",
      study: "Daily Study & Pomodoro",
      routine: "Daily Routine Schedule",
      "daily-planner": "Daily Planner & Reflections",
      habits: "Habits Consistency Matrix",
      notes: "Markdown Notes Manager",
      tasks: "Kanban Task Board",
      roadmap: "Full-Stack Learning Roadmap",
      "java-tracker": "Java Core Skill Tracker",
      "springboot-tracker": "Spring Boot & Cloud Tracker",
      "mysql-tracker": "MySQL Database Tracker",
      "dsa-tracker": "DSA LeetCode Tracker",
      projects: "Project Portfolio Showcase",
      interviews: "Interview Prep Archive",
      jobs: "Job Applications ATS Tracker",
      "job-application-send": "Job Application Send",
      certifications: "Professional Certifications",
      analytics: "Deep Productivity Analytics",
      settings: "Profile Settings & Backups",
    };
    return titles[tab] || "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 h-[70px] bg-bg-primary/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 flex items-center justify-between">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 lg:hidden"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-heading text-lg lg:text-xl font-bold text-text-primary">
            {formatTabTitle(currentTab)}
          </h1>
          <span className="hidden sm:inline-block text-xs text-text-muted">
            Welcome back, {profile.name}
          </span>
        </div>
      </div>

      {/* Right Search & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, tasks, jobs..."
            className="w-full bg-bg-secondary/90 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
          />
        </div>

        {/* Sync / Refresh */}
        <button
          onClick={onRefresh}
          className="p-2.5 rounded-xl text-text-secondary hover:text-brand-primary hover:bg-white/5 border border-white/5 transition-all"
          title="Sync with Supabase"
        >
          <RefreshCw size={17} />
        </button>

        {/* Quick Pomodoro Launch */}
        <button
          onClick={onQuickTimer}
          className="p-2.5 rounded-xl text-text-secondary hover:text-brand-primary hover:bg-white/5 border border-white/5 transition-all"
          title="Quick Study Timer"
        >
          <Clock size={17} />
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-text-secondary hover:text-status-warning hover:bg-white/5 border border-white/5 transition-all"
          title="Toggle Theme"
        >
          {isLight ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* User Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-lg bg-brand-primary font-heading font-bold text-white text-xs flex items-center justify-center shadow-sm">
            {profile.avatar || "JD"}
          </div>
        </div>
      </div>
    </header>
  );
};
