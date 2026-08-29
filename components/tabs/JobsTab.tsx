"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Plus,
  ExternalLink,
  Trash2,
  Building,
  DollarSign,
  MapPin,
  Calendar,
} from "lucide-react";
import { JobApplication } from "@/lib/types";
import { generateId, formatDateKey, formatReadableDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface JobsTabProps {
  jobs: JobApplication[];
  onSaveJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  onSaveJob,
  onDeleteJob,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Software Engineer (Backend)");
  const [location, setLocation] = useState("Remote");
  const [salary, setSalary] = useState("₹25 - ₹35 LPA");
  const [jobUrl, setJobUrl] = useState("");
  const [appliedDate, setAppliedDate] = useState(formatDateKey());
  const [status, setStatus] = useState<JobApplication["status"]>("applied");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: JobApplication = {
      id: generateId("job"),
      company,
      role,
      location,
      salary,
      jobUrl,
      appliedDate,
      status,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveJob(newJob);
    setIsAddModalOpen(false);
    setCompany("");
    setJobUrl("");
    setNotes("");
  };

  const handleStatusChange = (job: JobApplication, nextStatus: JobApplication["status"]) => {
    onSaveJob({
      ...job,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Funnel calculations
  const total = jobs.length;
  const screenings = jobs.filter((j) => j.status === "screening").length;
  const interviews = jobs.filter((j) => j.status === "interview").length;
  const offers = jobs.filter((j) => j.status === "offer").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <Briefcase size={22} className="text-brand-primary" /> Job Applications ATS Tracker
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Monitor recruiter outreach, salary negotiations, and interview pipelines
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
        >
          <Plus size={15} /> Add Application
        </button>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Total Applied</div>
          <div className="text-2xl font-heading font-bold text-brand-primary mt-1">{total}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-status-warning font-bold">Screening</div>
          <div className="text-2xl font-heading font-bold text-status-warning mt-1">{screenings}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-purple-400 font-bold">Interviews</div>
          <div className="text-2xl font-heading font-bold text-purple-400 mt-1">{interviews}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-status-success font-bold">Offers</div>
          <div className="text-2xl font-heading font-bold text-status-success mt-1">{offers}</div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 text-text-muted uppercase tracking-wider">
              <th className="py-3 px-4">Company & Role</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Salary Range</th>
              <th className="py-3 px-4">Applied Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4">
                  <div className="font-semibold text-text-primary text-sm flex items-center gap-2">
                    {job.company}
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-text-muted hover:text-brand-primary"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">{job.role}</div>
                </td>
                <td className="py-4 px-4 text-text-secondary">{job.location || "Remote"}</td>
                <td className="py-4 px-4 text-brand-primary font-semibold">{job.salary || "—"}</td>
                <td className="py-4 px-4 text-text-secondary">{formatReadableDate(job.appliedDate)}</td>
                <td className="py-4 px-4">
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job, e.target.value as JobApplication["status"])}
                    className="bg-bg-secondary text-xs text-text-primary border border-white/10 rounded-lg px-2.5 py-1 focus:outline-none"
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-status-danger transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Job Application"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Company</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Netflix, Stripe"
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Role Title</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote, Bangalore..."
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Salary Range</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="₹30 - ₹40 LPA"
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Job URL</label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobApplication["status"])}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              >
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
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
              Save Job
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
