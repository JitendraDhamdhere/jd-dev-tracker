"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Profile } from "@/lib/types";
import { DataService } from "@/lib/dataService";
import { useToast } from "@/components/ui/Toast";

interface SettingsTabProps {
  profile: Profile;
  onSaveProfile: (profile: Profile) => void;
  onDataReset: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  profile,
  onSaveProfile,
  onDataReset,
}) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<Profile>(profile);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(form);
    showToast("Profile Updated", "Your developer goals and information have been saved.", "success");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dumpStr = await DataService.exportAllData();
      const blob = new Blob([dumpStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devtrack-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Export Successful", "All DevTrack data exported as JSON.", "success");
    } catch (e) {
      showToast("Export Failed", "Could not export database.", "danger");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const success = await DataService.importAllData(text);
      if (success) {
        showToast("Import Complete", "Backup restored successfully! Refreshing...", "success");
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showToast("Import Failed", "Invalid JSON format.", "danger");
      }
    } catch (err) {
      showToast("Import Error", "Could not read file.", "danger");
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all dashboard data? This will reset all trackers and tasks to default."
      )
    ) {
      onDataReset();
      showToast("Dashboard Reset", "All data returned to initial default state.", "info");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
          <Settings size={22} className="text-brand-primary" /> Settings & Backups
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Manage your developer profile, Supabase sync, JSON data exports, and backups
        </p>
      </div>

      {/* Developer Profile Settings */}
      <div className="glass-card p-6">
        <h3 className="font-heading font-bold text-base text-text-primary mb-4 flex items-center gap-2">
          <User size={18} className="text-brand-primary" /> Developer Profile
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Role Title
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Avatar Initials
              </label>
              <input
                type="text"
                maxLength={3}
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value.toUpperCase() })}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Daily Study Target (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={16}
                value={form.dailyTargetHours}
                onChange={(e) => setForm({ ...form, dailyTargetHours: Number(e.target.value) })}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Weekly GitHub Commit Goal
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={form.githubGoal}
                onChange={(e) => setForm({ ...form, githubGoal: Number(e.target.value) })}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
            >
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Data Backup & Portability */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
          <Download size={18} className="text-status-success" /> Data Portability & JSON Backups
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          DevTrack Pro guarantees 100% data ownership. You can export a snapshot of all your
          notes, routine records, tasks, and interview progress at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-primary border border-white/10 text-xs font-bold transition-all"
          >
            <Download size={15} /> {isExporting ? "Exporting..." : "Export Full JSON Backup"}
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-primary border border-white/10 text-xs font-bold cursor-pointer transition-all">
            <Upload size={15} /> {isImporting ? "Restoring..." : "Import Backup File"}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border border-status-danger/20 space-y-3">
        <h3 className="font-heading font-bold text-base text-status-danger flex items-center gap-2">
          <AlertTriangle size={18} /> Danger Zone
        </h3>
        <p className="text-xs text-text-secondary">
          Reset all dashboard tables and state back to pristine default seeding.
        </p>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-status-danger/10 hover:bg-status-danger text-status-danger hover:text-white border border-status-danger/30 text-xs font-bold transition-all shadow-glow"
        >
          <RotateCcw size={15} /> Reset Dashboard Data
        </button>
      </div>
    </div>
  );
};
