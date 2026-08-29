export interface Profile {
  name: string;
  role: string;
  avatar: string;
  dailyTargetHours: number;
  studyStreak: number;
  githubGoal: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subject: string;
  duration: number; // minutes
  date: string;
  mode: 'pomodoro' | 'manual';
  notes?: string;
  createdAt: string;
}

export interface RoutineActivity {
  id: string;
  name: string;
  time: string;
  category: 'Health' | 'Fitness' | 'Personal' | 'Spiritual' | 'Commute' | 'Career' | 'Work' | 'Food' | 'Recovery' | 'Sleep';
  duration: number; // minutes
  status: 'completed' | 'pending' | 'missed';
  notes?: string;
  actualStart?: string;
  actualEnd?: string;
  pendingReason?: string;
}

export interface DailyRoutine {
  [date: string]: RoutineActivity[];
}

export interface DailyPlanner {
  date: string;
  morningGoals: string;
  todayGoals: string;
  eveningReview: string;
  tomorrowPlan: string;
  wins: string;
  mistakes: string;
  improvements: string;
}

export interface Habit {
  id: string;
  name: string;
  category?: string;
  targetPerWeek?: number;
}

export interface HabitHistory {
  [habitId: string]: {
    [dateKey: string]: boolean;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'testing' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  dueDate?: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  description?: string;
}

export interface TechChecklist {
  [key: string]: boolean;
}

export interface DsaTopic {
  easy: number;
  medium: number;
  hard: number;
  target: number;
  completed: boolean;
}

export interface DsaTrackerState {
  [topicKey: string]: DsaTopic;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'planning' | 'in_progress' | 'completed';
  progress: number;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  company: string;
  role: string;
  stage: 'Coding' | 'Technical' | 'System Design' | 'HR' | 'Managerial';
  date: string;
  status: 'scheduled' | 'passed' | 'rejected' | 'offered';
  questions?: string;
  notes?: string;
  difficulty?: number;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  salary?: string;
  jobUrl?: string;
  appliedDate: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  status: 'active' | 'in_progress' | 'expired';
}
