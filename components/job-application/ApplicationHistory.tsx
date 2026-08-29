"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Mail,
  MessageSquare,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { JobApplicationRecord, ApplicationStatus } from "@/lib/jobApplicationTypes";
import { ApplicationDetailsModal } from "./ApplicationDetailsModal";

interface ApplicationHistoryProps {
  applications: JobApplicationRecord[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus, notes?: string) => Promise<void>;
  onDeleteApplication: (id: string) => Promise<void>;
  onApplyAgain: (app: JobApplicationRecord) => void;
}

export const ApplicationHistory: React.FC<ApplicationHistoryProps> = ({
  applications,
  onUpdateStatus,
  onDeleteApplication,
  onApplyAgain,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "company" | "status">("newest");
  const [selectedApp, setSelectedApp] = useState<JobApplicationRecord | null>(null);

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Status filter
        if (statusFilter !== "all" && app.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
        // Search filter
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          app.company_name.toLowerCase().includes(q) ||
          app.job_title.toLowerCase().includes(q) ||
          (app.location && app.location.toLowerCase().includes(q)) ||
          (app.required_skills && app.required_skills.some((s) => s.toLowerCase().includes(q))) ||
          (app.notes && app.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "company") {
          return a.company_name.localeCompare(b.company_name);
        }
        if (sortBy === "status") {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [applications, searchQuery, statusFilter, sortBy]);

  const getStatusBadgeClass = (status: ApplicationStatus) => {
    switch (status) {
      case "Selected":
        return "bg-status-success/20 text-status-success border-status-success/30";
      case "Interview":
        return "bg-brand-primary/20 text-brand-primary border-brand-primary/30";
      case "Applied":
        return "bg-status-info/20 text-status-info border-status-info/30";
      case "Rejected":
        return "bg-status-danger/20 text-status-danger border-status-danger/30";
      case "Saved":
      case "Analyzed":
        return "bg-status-warning/20 text-status-warning border-status-warning/30";
      default:
        return "bg-white/10 text-text-muted border-white/10";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary">
            Application History & Pipeline
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Showing {filteredApplications.length} of {applications.length} recorded applications
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-48 lg:w-56">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, skills..."
              className="w-full bg-bg-secondary border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-bg-secondary border border-white/10 rounded-xl px-2.5 py-1 text-xs">
            <Filter size={13} className="text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-text-primary text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="saved">Saved / Draft</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="selected">Selected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-bg-secondary border border-white/10 rounded-xl px-2.5 py-1 text-xs">
            <ArrowUpDown size={13} className="text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-text-primary text-xs focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="company">Company (A-Z)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-2">
          {filteredApplications.map((app) => {
            const hasWhatsApp = Boolean(app.whatsapp);
            const hasEmail = Boolean(app.email);

            return (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="cursor-pointer p-3.5 sm:p-4 rounded-xl bg-bg-secondary/70 hover:bg-bg-secondary border border-white/5 hover:border-white/15 transition-all duration-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-brand-primary flex items-center justify-center shrink-0 font-bold text-sm">
                    {app.company_name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {app.company_name}
                      </p>
                      {app.location && (
                        <span className="text-[10px] text-text-muted hidden sm:inline-block">
                          • {app.location}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {app.job_title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  {/* Channel indicator */}
                  <div className="hidden sm:flex items-center gap-1.5 text-text-muted">
                    {hasWhatsApp && (
                      <span
                        title="Applied via WhatsApp"
                        className="p-1 rounded bg-status-success/15 text-status-success"
                      >
                        <MessageSquare size={13} />
                      </span>
                    )}
                    {hasEmail && (
                      <span
                        title="Applied via Email"
                        className="p-1 rounded bg-brand-primary/15 text-brand-primary"
                      >
                        <Mail size={13} />
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-right hidden md:block">
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(app.applied_at || app.created_at)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${getStatusBadgeClass(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>

                  <ChevronRight size={16} className="text-text-muted" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 space-y-2">
          <p className="text-xs font-semibold text-text-secondary">
            No applications match your filter.
          </p>
          <p className="text-[11px] text-text-muted">
            Analyze a job description above to prepare and track your next developer application.
          </p>
        </div>
      )}

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={Boolean(selectedApp)}
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onUpdateStatus={async (id, newStatus, notes) => {
          await onUpdateStatus(id, newStatus, notes);
          setSelectedApp(null);
        }}
        onDelete={async (id) => {
          await onDeleteApplication(id);
          setSelectedApp(null);
        }}
        onApplyAgain={(app) => {
          onApplyAgain(app);
          setSelectedApp(null);
        }}
      />
    </div>
  );
};
