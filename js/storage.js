/* Storage JS - Supabase persistence and default state seeding */

(function () {
  const STORAGE_PREFIX = 'devtrack_';

  const defaultProfile = {
    name: 'Jitendra Dhamdhere',
    role: '',
    avatar: 'JD',
    dailyTargetHours: 0,
    studyStreak: 0,
    githubGoal: 0,
    createdAt: new Date().toISOString()
  };

  const defaultStudySessions = [];
  const defaultNotes = [];
  const defaultTasks = [];
  const defaultRoadmap = {
    'java_basics': false, 'oop': false, 'collections': false, 'generics': false,
    'exception_handling': false, 'streams': false, 'lambda': false, 'multithreading': false,
    'concurrency': false, 'jvm_internals': false, 'spring_core': false, 'ioc_di': false,
    'spring_mvc': false, 'jpa_hibernate': false, 'spring_security': false, 'rest_api': false,
    'microservices': false, 'docker': false, 'kubernetes': false, 'aws_basics': false,
    'system_design_lld': false, 'system_design_hld': false
  };
  const defaultTrackers = {
    java: {
      basics: false, oop: false, collections: false, generics: false, exceptions: false,
      streams: false, lambdas: false, multithreading: false, executor: false,
      concurrency: false, jvm: false, memory: false, gc: false, reflection: false,
      annotations: false, serialization: false, design_patterns: false
    },
    spring: {
      core: false, ioc: false, di: false, mvc: false, rest: false, validation: false,
      jpa: false, security: false, jwt: false, redis: false, microservices: false,
      gateway: false, eureka: false, feign: false, rabbitmq: false, kafka: false,
      docker: false, testing: false, actuator: false, swagger: false
    },
    mysql: {
      ddl: false, dml: false, constraints: false, joins: false, views: false,
      indexes: false, normalization: false, transactions: false, procedures: false,
      triggers: false, tuning: false, backup: false, replication: false
    },
    dsa: {
      arrays: { easy: 0, medium: 0, hard: 0, target: 40, completed: false },
      strings: { easy: 0, medium: 0, hard: 0, target: 30, completed: false },
      linkedlist: { easy: 0, medium: 0, hard: 0, target: 20, completed: false },
      stacks_queues: { easy: 0, medium: 0, hard: 0, target: 20, completed: false },
      trees: { easy: 0, medium: 0, hard: 0, target: 35, completed: false },
      graphs: { easy: 0, medium: 0, hard: 0, target: 25, completed: false },
      binary_search: { easy: 0, medium: 0, hard: 0, target: 25, completed: false },
      sorting: { easy: 0, medium: 0, hard: 0, target: 20, completed: false },
      greedy: { easy: 0, medium: 0, hard: 0, target: 25, completed: false },
      dp: { easy: 0, medium: 0, hard: 0, target: 30, completed: false },
      recursion: { easy: 0, medium: 0, hard: 0, target: 20, completed: false },
      sliding_window: { easy: 0, medium: 0, hard: 0, target: 15, completed: false }
    }
  };
  const defaultProjects = [];
  const defaultResumes = [];
  const defaultInterviews = [];
  const defaultJobs = [];
  const defaultHabits = {};
  const defaultCertifications = [];
  const defaultDailyPlanner = {
    date: new Date().toISOString().split('T')[0],
    morningGoals: '', todayGoals: '', eveningReview: '', tomorrowPlan: '',
    wins: '', mistakes: '', improvements: ''
  };

  const defaultState = {
    profile: defaultProfile,
    study_sessions: defaultStudySessions,
    notes: defaultNotes,
    tasks: defaultTasks,
    roadmap: defaultRoadmap,
    trackers: defaultTrackers,
    projects: defaultProjects,
    resumes: defaultResumes,
    interviews: defaultInterviews,
    jobs: defaultJobs,
    habits: defaultHabits,
    certifications: defaultCertifications,
    daily_planner: defaultDailyPlanner,
    daily_routine: {}
  };

  // Storage Methods
  window.StorageService = {
    get: async function (key) {
      if (!window.SupabaseClient) return null;
      try {
        const { data, error } = await window.SupabaseClient
          .from('devtrack_kv')
          .select('value')
          .eq('key', STORAGE_PREFIX + key)
          .single();
        if (error) {
          if (error.code === 'PGRST116') {
            return null; // not found
          }
          console.error('Error fetching from Supabase:', error);
          return null;
        }
        return data.value;
      } catch (e) {
        console.error('Error reading from Supabase', e);
        return null;
      }
    },

    set: async function (key, value) {
      if (!window.SupabaseClient) return;
      try {
        const { error } = await window.SupabaseClient.from('devtrack_kv').upsert({
          key: STORAGE_PREFIX + key,
          value: value,
          updated_at: new Date().toISOString()
        });
        if (error) {
          console.error('Supabase upsert error', error);
          if (window.Utils && typeof window.Utils.showToast === 'function') {
            window.Utils.showToast('Storage Error', 'Failed to save data to Supabase.', 'danger');
          }
        }
      } catch (e) {
        console.error('Error saving to Supabase', e);
        if (window.Utils && typeof window.Utils.showToast === 'function') {
          window.Utils.showToast('Storage Error', 'Failed to save data to Supabase.', 'danger');
        }
      }
    },

    initialize: async function () {
      if (!window.SupabaseClient) return;
      try {
        const { data, error } = await window.SupabaseClient
          .from('devtrack_kv')
          .select('key')
          .like('key', STORAGE_PREFIX + '%');

        if (error) {
          console.error('Failed to list keys from Supabase', error);
          return;
        }

        const existingKeys = new Set(data.map(r => r.key.replace(STORAGE_PREFIX, '')));

        for (const [key, value] of Object.entries(defaultState)) {
          if (!existingKeys.has(key)) {
            await this.set(key, value);
          }
        }
      } catch (e) {
        console.error('Init Error', e);
      }
    },

    exportData: async function () {
      if (!window.SupabaseClient) return "{}";
      const { data, error } = await window.SupabaseClient
        .from('devtrack_kv')
        .select('*')
        .like('key', STORAGE_PREFIX + '%');
      
      if (error) {
        console.error('Export Error', error);
        return "{}";
      }

      const dump = {};
      data.forEach(row => {
        const key = row.key.replace(STORAGE_PREFIX, '');
        if (key === 'daily_routine') {
          dump.dailyRoutine = row.value;
        } else {
          dump[key] = row.value;
        }
      });
      return JSON.stringify(dump, null, 2);
    },

    importData: async function (jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        if (!data || typeof data !== 'object') {
          return false;
        }

        if (data.dailyRoutine && !data.daily_routine) {
          data.daily_routine = data.dailyRoutine;
        }

        for (const [key, value] of Object.entries(data)) {
          if (key === 'dailyRoutine') continue;
          await this.set(key, value);
        }
        return true;
      } catch (e) {
        console.error('Failed to parse import data', e);
        return false;
      }
    },

    resetAll: async function () {
      if (!window.SupabaseClient) return;
      try {
        const { error } = await window.SupabaseClient
          .from('devtrack_kv')
          .delete()
          .like('key', STORAGE_PREFIX + '%');
        if (error) console.error('Reset Error', error);
        await this.initialize();
      } catch (e) {
        console.error('Reset Error', e);
      }
    }
  };

  // Run initialization
  window.StorageService.initPromise = window.StorageService.initialize();
})();
