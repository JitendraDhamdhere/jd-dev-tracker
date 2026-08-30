"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardTab } from "@/components/tabs/DashboardTab";
import { StudyTab } from "@/components/tabs/StudyTab";
import { RoutineTab } from "@/components/tabs/RoutineTab";
import { DailyPlannerTab } from "@/components/tabs/DailyPlannerTab";
import { HabitsTab } from "@/components/tabs/HabitsTab";
import { NotesTab } from "@/components/tabs/NotesTab";
import { TasksTab } from "@/components/tabs/TasksTab";
import { RoadmapTab } from "@/components/tabs/RoadmapTab";
import { JavaTrackerTab } from "@/components/tabs/JavaTrackerTab";
import { SpringTrackerTab } from "@/components/tabs/SpringTrackerTab";
import { MysqlTrackerTab } from "@/components/tabs/MysqlTrackerTab";
import { DsaTrackerTab } from "@/components/tabs/DsaTrackerTab";
import { ProjectsTab } from "@/components/tabs/ProjectsTab";
import { InterviewsTab } from "@/components/tabs/InterviewsTab";
import { JobsTab } from "@/components/tabs/JobsTab";
import { JobApplicationDashboard } from "@/components/job-application/JobApplicationDashboard";
import { CertificationsTab } from "@/components/tabs/CertificationsTab";
import { AnalyticsTab } from "@/components/tabs/AnalyticsTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import {
  Profile,
  StudySession,
  DailyRoutine,
  DailyPlanner,
  Habit,
  HabitHistory,
  Note,
  Task,
  RoadmapNode,
  TechChecklist,
  DsaTrackerState,
  Project,
  Interview,
  JobApplication,
  Certification,
} from "@/lib/types";
import {
  DataService,
  defaultProfile,
  defaultRoadmapNodes,
  defaultTrackers,
  defaultNotes,
  defaultTasks,
  defaultProjects,
  defaultJobs,
  defaultInterviews,
  defaultHabits,
  defaultCertifications,
  defaultRoutineTemplate,
} from "@/lib/dataService";
import { formatDateKey } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function Home() {
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Application State
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [routine, setRoutine] = useState<DailyRoutine>({
    [formatDateKey()]: defaultRoutineTemplate,
  });
  const [plannerData, setPlannerData] = useState<DailyPlanner>({
    date: formatDateKey(),
    morningGoals: "",
    todayGoals: "",
    eveningReview: "",
    tomorrowPlan: "",
    wins: "",
    mistakes: "",
    improvements: "",
  });
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [habitHistory, setHabitHistory] = useState<HabitHistory>({});
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>(defaultRoadmapNodes);
  const [trackers, setTrackers] = useState(defaultTrackers);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [interviews, setInterviews] = useState<Interview[]>(defaultInterviews);
  const [jobs, setJobs] = useState<JobApplication[]>(defaultJobs);
  const [certifications, setCertifications] = useState<Certification[]>(defaultCertifications);

  // Load Initial Data from Supabase
  const loadAllData = useCallback(async () => {
    try {
      const [
        p,
        ss,
        r,
        dp,
        h,
        hh,
        n,
        t,
        rm,
        tr,
        pr,
        iv,
        jb,
        cr,
      ] = await Promise.all([
        DataService.get<Profile>("profile", defaultProfile),
        DataService.get<StudySession[]>("study_sessions", []),
        DataService.get<DailyRoutine>("daily_routine", { [formatDateKey()]: defaultRoutineTemplate }),
        DataService.get<DailyPlanner>("daily_planner", {
          date: formatDateKey(),
          morningGoals: "",
          todayGoals: "",
          eveningReview: "",
          tomorrowPlan: "",
          wins: "",
          mistakes: "",
          improvements: "",
        }),
        DataService.get<Habit[]>("habits_list", defaultHabits),
        DataService.get<HabitHistory>("habits", {}),
        DataService.get<Note[]>("notes", defaultNotes),
        DataService.get<Task[]>("tasks", defaultTasks),
        DataService.get<RoadmapNode[]>("roadmap_nodes", defaultRoadmapNodes),
        DataService.get<typeof defaultTrackers>("trackers", defaultTrackers),
        DataService.get<Project[]>("projects", defaultProjects),
        DataService.get<Interview[]>("interviews", defaultInterviews),
        DataService.get<JobApplication[]>("jobs", defaultJobs),
        DataService.get<Certification[]>("certifications", defaultCertifications),
      ]);

      if (p) setProfile(p);
      if (ss) setStudySessions(ss);
      if (r) setRoutine(r);
      if (dp) setPlannerData(dp);
      if (h) setHabits(h);
      if (hh) setHabitHistory(hh);
      if (n) setNotes(n);
      if (t) setTasks(t);
      if (rm) setRoadmapNodes(rm);
      if (tr) setTrackers(tr);
      if (pr) setProjects(pr);
      if (iv) setInterviews(iv);
      if (jb) setJobs(jb);
      if (cr) setCertifications(cr);
    } catch (e) {
      console.warn("Failed to load initial data from Supabase", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setCurrentTab(tabParam);
      }
    }
  }, [loadAllData]);

  // Data Mutators syncing with Supabase
  const handleSaveProfile = async (updated: Profile) => {
    setProfile(updated);
    await DataService.set("profile", updated);
  };

  const handleSaveStudySession = async (session: StudySession) => {
    const updated = [session, ...studySessions];
    setStudySessions(updated);
    await DataService.set("study_sessions", updated);
    showToast("Session Logged", `${session.subject} (${session.duration} mins)`, "success");
  };

  const handleDeleteStudySession = async (id: string) => {
    const updated = studySessions.filter((s) => s.id !== id);
    setStudySessions(updated);
    await DataService.set("study_sessions", updated);
    showToast("Session Deleted", "Study session removed.", "info");
  };

  const handleUpdateRoutine = async (updated: DailyRoutine) => {
    setRoutine(updated);
    await DataService.set("daily_routine", updated);
  };

  const handleSavePlanner = async (updated: DailyPlanner) => {
    setPlannerData(updated);
    await DataService.set("daily_planner", updated);
    showToast("Planner Saved", "Reflections updated successfully.", "success");
  };

  const handleUpdateHabits = async (newHabits: Habit[], newHistory: HabitHistory) => {
    setHabits(newHabits);
    setHabitHistory(newHistory);
    await DataService.set("habits_list", newHabits);
    await DataService.set("habits", newHistory);
  };

  const handleSaveNote = async (note: Note) => {
    const exists = notes.some((n) => n.id === note.id);
    const updated = exists ? notes.map((n) => (n.id === note.id ? note : n)) : [note, ...notes];
    setNotes(updated);
    await DataService.set("notes", updated);
  };

  const handleDeleteNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    await DataService.set("notes", updated);
    showToast("Note Deleted", "Markdown note removed.", "info");
  };

  const handleSaveTask = async (task: Task) => {
    const exists = tasks.some((t) => t.id === task.id);
    const updated = exists ? tasks.map((t) => (t.id === task.id ? task : t)) : [task, ...tasks];
    setTasks(updated);
    await DataService.set("tasks", updated);
  };

  const handleDeleteTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    await DataService.set("tasks", updated);
    showToast("Task Removed", "Task deleted from board.", "info");
  };

  const handleToggleRoadmapNode = async (id: string) => {
    const updated = roadmapNodes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n));
    setRoadmapNodes(updated);
    await DataService.set("roadmap_nodes", updated);
  };

  const handleToggleTracker = async (type: "java" | "spring" | "mysql", itemKey: string) => {
    const updated = {
      ...trackers,
      [type]: {
        ...trackers[type],
        [itemKey]: !trackers[type]?.[itemKey],
      },
    };
    setTrackers(updated);
    await DataService.set("trackers", updated);
  };

  const handleUpdateDsa = async (
    topicKey: string,
    updates: Partial<DsaTrackerState[string]>
  ) => {
    const updated = {
      ...trackers,
      dsa: {
        ...trackers.dsa,
        [topicKey]: {
          ...trackers.dsa[topicKey],
          ...updates,
        },
      },
    };
    setTrackers(updated);
    await DataService.set("trackers", updated);
  };

  const handleSaveProject = async (project: Project) => {
    const exists = projects.some((p) => p.id === project.id);
    const updated = exists
      ? projects.map((p) => (p.id === project.id ? project : p))
      : [project, ...projects];
    setProjects(updated);
    await DataService.set("projects", updated);
  };

  const handleDeleteProject = async (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    await DataService.set("projects", updated);
    showToast("Project Removed", "Portfolio project deleted.", "info");
  };

  const handleSaveInterview = async (interview: Interview) => {
    const exists = interviews.some((i) => i.id === interview.id);
    const updated = exists
      ? interviews.map((i) => (i.id === interview.id ? interview : i))
      : [interview, ...interviews];
    setInterviews(updated);
    await DataService.set("interviews", updated);
    showToast("Interview Updated", `${interview.company} (${interview.stage})`, "success");
  };

  const handleDeleteInterview = async (id: string) => {
    const updated = interviews.filter((i) => i.id !== id);
    setInterviews(updated);
    await DataService.set("interviews", updated);
    showToast("Interview Removed", "Log deleted.", "info");
  };

  const handleSaveJob = async (job: JobApplication) => {
    const exists = jobs.some((j) => j.id === job.id);
    const updated = exists ? jobs.map((j) => (j.id === job.id ? job : j)) : [job, ...jobs];
    setJobs(updated);
    await DataService.set("jobs", updated);
  };

  const handleDeleteJob = async (id: string) => {
    const updated = jobs.filter((j) => j.id !== id);
    setJobs(updated);
    await DataService.set("jobs", updated);
    showToast("Application Deleted", "Job removed from pipeline.", "info");
  };

  const handleSaveCert = async (cert: Certification) => {
    const exists = certifications.some((c) => c.id === cert.id);
    const updated = exists
      ? certifications.map((c) => (c.id === cert.id ? cert : c))
      : [cert, ...certifications];
    setCertifications(updated);
    await DataService.set("certifications", updated);
  };

  const handleDeleteCert = async (id: string) => {
    const updated = certifications.filter((c) => c.id !== id);
    setCertifications(updated);
    await DataService.set("certifications", updated);
    showToast("Certification Removed", "Credential deleted.", "info");
  };

  const handleDataReset = async () => {
    const cleanProfile = { ...defaultProfile, studyStreak: 0, createdAt: new Date().toISOString() };
    setProfile(cleanProfile);
    setStudySessions([]);
    setRoutine({ [formatDateKey()]: defaultRoutineTemplate });
    setHabits(defaultHabits);
    setHabitHistory({});
    setNotes([]);
    setTasks([]);
    setRoadmapNodes(defaultRoadmapNodes);
    setTrackers(defaultTrackers);
    setProjects([]);
    setInterviews([]);
    setJobs([]);
    setCertifications([]);

    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("devtrack_")) {
          localStorage.removeItem(k);
        }
      });
    }

    await Promise.all([
      DataService.set("profile", cleanProfile),
      DataService.set("study_sessions", []),
      DataService.set("daily_routine", { [formatDateKey()]: defaultRoutineTemplate }),
      DataService.set("habits_list", defaultHabits),
      DataService.set("habits", {}),
      DataService.set("notes", []),
      DataService.set("tasks", []),
      DataService.set("roadmap_nodes", defaultRoadmapNodes),
      DataService.set("trackers", defaultTrackers),
      DataService.set("projects", []),
      DataService.set("interviews", []),
      DataService.set("jobs", []),
      DataService.set("certifications", []),
      DataService.set("job_applications_v2", []),
      DataService.set("resumes_v2", []),
      DataService.set("resumes", []),
      DataService.set("daily_planner", {
        [formatDateKey()]: {
          morningGoals: "",
          todayGoals: "",
          wins: "",
          mistakes: "",
          improvements: "",
          date: formatDateKey(),
        },
      }),
    ]);
  };

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onQuickTimer={() => setCurrentTab("study")}
          onRefresh={() => {
            loadAllData();
            showToast("Synced with Supabase", "Latest data refreshed.", "info");
          }}
          profile={profile}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-text-muted">
              Loading DevTrack Pro data from Supabase...
            </div>
          ) : (
            <>
              {currentTab === "dashboard" && (
                <DashboardTab
                  profile={profile}
                  studySessions={studySessions}
                  tasks={tasks}
                  jobs={jobs}
                  interviews={interviews}
                  routine={routine}
                  trackers={trackers}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === "study" && (
                <StudyTab
                  sessions={studySessions}
                  onSaveSession={handleSaveStudySession}
                  onDeleteSession={handleDeleteStudySession}
                />
              )}

              {currentTab === "routine" && (
                <RoutineTab routine={routine} onUpdateRoutine={handleUpdateRoutine} />
              )}

              {currentTab === "daily-planner" && (
                <DailyPlannerTab plannerData={plannerData} onSavePlanner={handleSavePlanner} />
              )}

              {currentTab === "habits" && (
                <HabitsTab
                  habits={habits}
                  history={habitHistory}
                  onUpdateHabits={handleUpdateHabits}
                />
              )}

              {currentTab === "notes" && (
                <NotesTab
                  notes={notes}
                  onSaveNote={handleSaveNote}
                  onDeleteNote={handleDeleteNote}
                />
              )}

              {currentTab === "tasks" && (
                <TasksTab
                  tasks={tasks}
                  onSaveTask={handleSaveTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {currentTab === "roadmap" && (
                <RoadmapTab nodes={roadmapNodes} onToggleNode={handleToggleRoadmapNode} />
              )}

              {currentTab === "java-tracker" && (
                <JavaTrackerTab
                  checklist={trackers?.java}
                  onToggleItem={(k) => handleToggleTracker("java", k)}
                />
              )}

              {currentTab === "springboot-tracker" && (
                <SpringTrackerTab
                  checklist={trackers?.spring}
                  onToggleItem={(k) => handleToggleTracker("spring", k)}
                />
              )}

              {currentTab === "mysql-tracker" && (
                <MysqlTrackerTab
                  checklist={trackers?.mysql}
                  onToggleItem={(k) => handleToggleTracker("mysql", k)}
                />
              )}

              {currentTab === "dsa-tracker" && (
                <DsaTrackerTab dsaState={trackers?.dsa} onUpdateTopic={handleUpdateDsa} />
              )}

              {currentTab === "projects" && (
                <ProjectsTab
                  projects={projects}
                  onSaveProject={handleSaveProject}
                  onDeleteProject={handleDeleteProject}
                />
              )}

              {currentTab === "interviews" && (
                <InterviewsTab
                  interviews={interviews}
                  onSaveInterview={handleSaveInterview}
                  onDeleteInterview={handleDeleteInterview}
                />
              )}

              {currentTab === "jobs" && (
                <JobsTab
                  jobs={jobs}
                  onSaveJob={handleSaveJob}
                  onDeleteJob={handleDeleteJob}
                />
              )}

              {currentTab === "job-application-send" && (
                <JobApplicationDashboard profile={profile} />
              )}

              {currentTab === "certifications" && (
                <CertificationsTab
                  certifications={certifications}
                  onSaveCert={handleSaveCert}
                  onDeleteCert={handleDeleteCert}
                />
              )}

              {currentTab === "analytics" && (
                <AnalyticsTab
                  studySessions={studySessions}
                  jobs={jobs}
                  trackers={trackers}
                  routine={routine}
                />
              )}

              {currentTab === "settings" && (
                <SettingsTab
                  profile={profile}
                  onSaveProfile={handleSaveProfile}
                  onDataReset={handleDataReset}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
