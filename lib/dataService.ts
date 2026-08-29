import { supabase } from "./supabase";
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
} from "./types";
import { formatDateKey } from "./utils";

const PREFIX = "devtrack_";

// Default Fallback States
export const defaultProfile: Profile = {
  name: "Jitendra Dhamdhere",
  role: "Software Developer",
  avatar: "JD",
  dailyTargetHours: 4,
  studyStreak: 12,
  githubGoal: 3,
  createdAt: new Date().toISOString(),
};

export const defaultRoadmapNodes: RoadmapNode[] = [
  { id: "java_basics", title: "Java Syntax & Basics", category: "Core Java", completed: true },
  { id: "oop", title: "Object Oriented Programming (OOP)", category: "Core Java", completed: true },
  { id: "collections", title: "Collections Framework", category: "Core Java", completed: true },
  { id: "generics", title: "Generics & Annotations", category: "Core Java", completed: true },
  { id: "exceptions", title: "Exception Handling", category: "Core Java", completed: true },
  { id: "streams", title: "Java 8 Streams & Lambdas", category: "Core Java", completed: true },
  { id: "concurrency", title: "Multithreading & Concurrency", category: "Core Java", completed: false },
  { id: "jvm", title: "JVM Internals & Memory Model", category: "Core Java", completed: false },
  { id: "spring_core", title: "Spring Core & IoC / DI", category: "Spring Boot", completed: true },
  { id: "spring_mvc", title: "Spring MVC & REST APIs", category: "Spring Boot", completed: true },
  { id: "spring_data", title: "Spring Data JPA & Hibernate", category: "Spring Boot", completed: true },
  { id: "spring_sec", title: "Spring Security & JWT", category: "Spring Boot", completed: true },
  { id: "microservices", title: "Microservices Architecture & Eureka", category: "Advanced", completed: false },
  { id: "docker", title: "Docker & Containerization", category: "DevOps", completed: false },
  { id: "system_design", title: "System Design (LLD & HLD)", category: "Architecture", completed: false },
];

export const defaultTrackers = {
  java: {
    basics: true,
    oop: true,
    collections: true,
    generics: true,
    exceptions: true,
    streams: true,
    lambdas: true,
    multithreading: false,
    executor: false,
    concurrency: false,
    jvm: false,
    memory: false,
    gc: false,
    reflection: false,
    annotations: true,
    serialization: false,
    design_patterns: false,
  } as TechChecklist,
  spring: {
    core: true,
    ioc: true,
    di: true,
    mvc: true,
    rest: true,
    validation: true,
    jpa: true,
    security: true,
    jwt: true,
    redis: false,
    microservices: false,
    gateway: false,
    eureka: false,
    feign: false,
    rabbitmq: false,
    kafka: false,
    docker: false,
    testing: false,
    actuator: true,
    swagger: true,
  } as TechChecklist,
  mysql: {
    ddl: true,
    dml: true,
    constraints: true,
    joins: true,
    views: true,
    indexes: true,
    normalization: true,
    transactions: true,
    procedures: false,
    triggers: false,
    tuning: false,
    backup: false,
    replication: false,
  } as TechChecklist,
  dsa: {
    arrays: { easy: 18, medium: 12, hard: 2, target: 40, completed: false },
    strings: { easy: 14, medium: 9, hard: 1, target: 30, completed: false },
    linkedlist: { easy: 10, medium: 8, hard: 2, target: 20, completed: true },
    stacks_queues: { easy: 8, medium: 7, hard: 1, target: 20, completed: false },
    trees: { easy: 12, medium: 15, hard: 3, target: 35, completed: false },
    graphs: { easy: 5, medium: 10, hard: 2, target: 25, completed: false },
    binary_search: { easy: 10, medium: 8, hard: 2, target: 25, completed: false },
    sorting: { easy: 12, medium: 5, hard: 0, target: 20, completed: false },
    greedy: { easy: 6, medium: 8, hard: 1, target: 25, completed: false },
    dp: { easy: 4, medium: 12, hard: 4, target: 30, completed: false },
    recursion: { easy: 8, medium: 6, hard: 1, target: 20, completed: false },
    sliding_window: { easy: 6, medium: 7, hard: 2, target: 15, completed: true },
  } as DsaTrackerState,
};

export const defaultRoutineTemplate = [
  { id: "wake-up", name: "Wake Up", time: "06:00 AM", category: "Health" as const, duration: 0, status: "completed" as const },
  { id: "freshen", name: "Freshen up + gym prep", time: "06:00-06:20 AM", category: "Health" as const, duration: 20, status: "completed" as const },
  { id: "travel-gym", name: "Travel to gym", time: "06:20-06:30 AM", category: "Commute" as const, duration: 10, status: "completed" as const },
  { id: "gym", name: "Gym / Workout", time: "06:30-07:30 AM", category: "Fitness" as const, duration: 60, status: "completed" as const },
  { id: "return-home", name: "Return home + cool down", time: "07:30-08:00 AM", category: "Recovery" as const, duration: 30, status: "completed" as const },
  { id: "bath-ready", name: "Bath + get ready for office", time: "08:00-08:30 AM", category: "Personal" as const, duration: 30, status: "completed" as const },
  { id: "breakfast", name: "Breakfast / Diet", time: "08:30-08:45 AM", category: "Food" as const, duration: 15, status: "completed" as const },
  { id: "temple", name: "Temple + Prayer", time: "08:45-08:50 AM", category: "Spiritual" as const, duration: 5, status: "completed" as const },
  { id: "travel-bus", name: "Leave home + travel to bus point", time: "08:50-09:15 AM", category: "Commute" as const, duration: 25, status: "completed" as const },
  { id: "career-morning", name: "Career Learning (Java/DSA)", time: "09:15-10:10 AM", category: "Career" as const, duration: 55, status: "completed" as const },
  { id: "office-checkin", name: "Office Check-in", time: "10:10 AM", category: "Work" as const, duration: 0, status: "completed" as const },
  { id: "office-work", name: "Office / Job Sprint", time: "10:10 AM–07:30 PM", category: "Work" as const, duration: 560, status: "completed" as const },
  { id: "office-logout", name: "Office Logout", time: "07:30 PM", category: "Work" as const, duration: 0, status: "completed" as const },
  { id: "return-bus", name: "Return bus commute", time: "07:45-08:40 PM", category: "Commute" as const, duration: 55, status: "completed" as const },
  { id: "travel-home", name: "Travel from bus point to home", time: "08:40-09:00 PM", category: "Commute" as const, duration: 20, status: "completed" as const },
  { id: "refresh", name: "Refresh + Relax", time: "09:00-09:30 PM", category: "Recovery" as const, duration: 30, status: "completed" as const },
  { id: "dinner", name: "Dinner", time: "09:30-10:00 PM", category: "Food" as const, duration: 30, status: "completed" as const },
  { id: "job-study", name: "Job Switch Study", time: "10:00-10:25 PM", category: "Career" as const, duration: 25, status: "pending" as const },
  { id: "wind-down", name: "Wind down + prepare for sleep", time: "10:25-10:30 PM", category: "Sleep" as const, duration: 5, status: "pending" as const },
  { id: "sleep", name: "Sleep (7.5 Hours)", time: "10:30 PM–06:00 AM", category: "Sleep" as const, duration: 450, status: "pending" as const },
];

export const defaultNotes: Note[] = [
  {
    id: "note_1",
    title: "Java 8 Streams API Cheatsheet & Memory Patterns",
    content: `### Java Streams API Overview
The Stream API brings functional-style operations to streams of elements.
\`\`\`java
List<String> activeUsers = users.stream()
    .filter(User::isActive)
    .map(User::getName)
    .sorted()
    .collect(Collectors.toList());
\`\`\`
- Intermediate Operations: \`filter\`, \`map\`, \`flatMap\`, \`distinct\`, \`sorted\`
- Terminal Operations: \`collect\`, \`forEach\`, \`reduce\`, \`count\`
`,
    category: "Java",
    tags: ["Java", "Streams", "Functional"],
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note_2",
    title: "Spring Security with JWT Flow",
    content: `### JWT Authentication Workflow
1. User submits credentials to \`/api/auth/login\`.
2. \`AuthenticationManager\` validates credentials.
3. \`JwtTokenProvider\` generates access and refresh tokens.
4. Client sends JWT in \`Authorization: Bearer <token>\` header for subsequent requests.
5. \`JwtAuthenticationFilter\` intercepts requests and sets \`SecurityContextHolder\`.
`,
    category: "Spring Boot",
    tags: ["Spring", "Security", "JWT"],
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const defaultTasks: Task[] = [
  {
    id: "task_1",
    title: "Implement Distributed Rate Limiter with Redis",
    description: "Build a token bucket rate limiter filter in Spring Cloud Gateway with Redis backing.",
    status: "in_progress",
    priority: "high",
    category: "Development",
    dueDate: formatDateKey(new Date(Date.now() + 86400000 * 2)),
    tags: ["Redis", "Spring", "System Design"],
    subtasks: [
      { id: "st_1", title: "Configure Redis connection pool", completed: true },
      { id: "st_2", title: "Implement Lua script for atomic token check", completed: true },
      { id: "st_3", title: "Write unit test under 1000 req/sec load", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_2",
    title: "Solve 5 LeetCode Graph Questions",
    description: "Focus on BFS, Topological Sort, and Dijkstra algorithms.",
    status: "todo",
    priority: "medium",
    category: "DSA",
    dueDate: formatDateKey(new Date(Date.now() + 86400000 * 3)),
    tags: ["DSA", "Graphs"],
    subtasks: [
      { id: "st_4", title: "Course Schedule I & II", completed: false },
      { id: "st_5", title: "Network Delay Time", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_3",
    title: "Refactor MySQL Query Execution Plans",
    description: "Add composite indexes on user_orders table and eliminate file sort.",
    status: "completed",
    priority: "urgent",
    category: "Database",
    dueDate: formatDateKey(),
    tags: ["MySQL", "Optimization"],
    subtasks: [
      { id: "st_6", title: "Run EXPLAIN ANALYZE", completed: true },
      { id: "st_7", title: "Add index on (user_id, created_at)", completed: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const defaultProjects: Project[] = [
  {
    id: "proj_1",
    name: "DevTrack Pro Productivity Hub",
    description: "Developer study habits, daily routine tracking, and career ATS management suite.",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"],
    githubUrl: "https://github.com/jitendradeveloper333/dev-tracker-1",
    liveUrl: "https://devtrack.vercel.app",
    status: "in_progress",
    progress: 85,
    milestones: [
      { id: "m_1", title: "Full-Stack Next.js Migration", completed: true },
      { id: "m_2", title: "Supabase Realtime Sync", completed: true },
      { id: "m_3", title: "Mobile Touch Optimizations", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_2",
    name: "Microservices E-Commerce Core",
    description: "Event-driven distributed e-commerce backend built with Spring Cloud, Kafka, and PostgreSQL.",
    techStack: ["Spring Boot", "Spring Cloud", "Kafka", "Docker", "PostgreSQL"],
    githubUrl: "https://github.com/jitendradeveloper333/microservices-core",
    status: "in_progress",
    progress: 60,
    milestones: [
      { id: "m_4", title: "Auth & User Service with JWT", completed: true },
      { id: "m_5", title: "Order Service with Saga Pattern", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const defaultJobs: JobApplication[] = [
  {
    id: "job_1",
    company: "Google",
    role: "Senior Software Engineer (Backend)",
    location: "Bangalore / Hybrid",
    salary: "₹45 - ₹55 LPA",
    jobUrl: "https://careers.google.com",
    appliedDate: formatDateKey(new Date(Date.now() - 86400000 * 5)),
    status: "interview",
    notes: "Completed Technical Screening. Coding round scheduled for next week.",
    followUpDate: formatDateKey(new Date(Date.now() + 86400000 * 3)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "job_2",
    company: "Microsoft",
    role: "Software Engineer II - Cloud + AI",
    location: "Hyderabad / Remote",
    salary: "₹38 - ₹45 LPA",
    jobUrl: "https://careers.microsoft.com",
    appliedDate: formatDateKey(new Date(Date.now() - 86400000 * 12)),
    status: "screening",
    notes: "Recruiter call completed on Thursday.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const defaultInterviews: Interview[] = [
  {
    id: "int_1",
    company: "Amazon",
    role: "SDE II Backend",
    stage: "System Design",
    date: formatDateKey(new Date(Date.now() + 86400000 * 4)),
    status: "scheduled",
    questions: "Design a distributed logging service with elastic search and logstash.",
    difficulty: 4,
    notes: "Review consistency models and leader election algorithms.",
    createdAt: new Date().toISOString(),
  },
];

export const defaultHabits: Habit[] = [
  { id: "wake", name: "Wake Up at 6:00 AM", category: "Health", targetPerWeek: 7 },
  { id: "gym", name: "Workout / Gym", category: "Fitness", targetPerWeek: 5 },
  { id: "study", name: "Study 2+ Hours", category: "Career", targetPerWeek: 7 },
  { id: "dsa", name: "Solve 1+ LeetCode Problem", category: "Career", targetPerWeek: 6 },
  { id: "reading", name: "Read Tech Docs / System Design", category: "Career", targetPerWeek: 5 },
  { id: "water", name: "3L Water Intake", category: "Health", targetPerWeek: 7 },
];

export const defaultCertifications: Certification[] = [
  {
    id: "cert_1",
    name: "AWS Certified Developer – Associate",
    issuer: "Amazon Web Services",
    issueDate: "2025-06-15",
    credentialId: "AWS-DEV-984210",
    credentialUrl: "https://aws.amazon.com/verification",
    status: "active",
  },
  {
    id: "cert_2",
    name: "Oracle Certified Professional: Java SE 17",
    issuer: "Oracle",
    issueDate: "2024-11-20",
    credentialId: "OCP-JAVA-17-765",
    status: "active",
  },
];

// Data Service Implementation
export const DataService = {
  async get<T>(key: string, defaultVal: T): Promise<T> {
    const storageKey = PREFIX + key;
    try {
      const { data, error } = await supabase
        .from("devtrack_kv")
        .select("value")
        .eq("key", storageKey)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Key doesn't exist yet, seed default value
          await this.set(key, defaultVal);
          return defaultVal;
        }
        console.warn(`Supabase get error for ${key}:`, error.message);
        // Fallback to local storage if available
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(storageKey);
          if (cached) return JSON.parse(cached);
        }
        return defaultVal;
      }

      if (data && data.value !== undefined && data.value !== null) {
        // Cache to local storage
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(data.value));
        }
        return data.value as T;
      }
      return defaultVal;
    } catch (e) {
      console.warn(`Fetch exception for ${key}`, e);
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            return defaultVal;
          }
        }
      }
      return defaultVal;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    const storageKey = PREFIX + key;
    // Optimistic local cache update
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch (e) {
        console.warn("Local storage cache failed", e);
      }
    }

    try {
      const { error } = await supabase.from("devtrack_kv").upsert({
        key: storageKey,
        value: value,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`Supabase set error for ${key}:`, error);
        return false;
      }
      return true;
    } catch (e) {
      console.error(`Save exception for ${key}:`, e);
      return false;
    }
  },

  async exportAllData(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("devtrack_kv")
        .select("*")
        .like("key", PREFIX + "%");

      if (error) throw error;
      const dump: Record<string, unknown> = {};
      data.forEach((row: { key: string; value: unknown }) => {
        const cleanKey = row.key.replace(PREFIX, "");
        dump[cleanKey] = row.value;
      });
      return JSON.stringify(dump, null, 2);
    } catch (e) {
      console.error("Export error", e);
      return "{}";
    }
  },

  async importAllData(jsonStr: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== "object") return false;

      for (const [key, value] of Object.entries(parsed)) {
        await this.set(key, value);
      }
      return true;
    } catch (e) {
      console.error("Import error", e);
      return false;
    }
  },
};
