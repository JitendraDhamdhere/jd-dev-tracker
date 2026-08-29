/* Daily Routine Tracker Module */

(function () {
  const ROUTINE_STORAGE_KEY = 'daily_routine';
  const DEFAULT_WEEKDAY_TEMPLATE = [
    { id: 'wake-up', name: 'Wake Up', time: '06:00 AM', category: 'Health', duration: 0, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'freshen', name: 'Freshen up + get ready for gym', time: '06:00-06:20 AM', category: 'Health', duration: 20, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'travel-gym', name: 'Travel to gym', time: '06:20-06:30 AM', category: 'Commute', duration: 10, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'gym', name: 'Gym / Workout', time: '06:30-07:30 AM', category: 'Fitness', duration: 60, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'return-home', name: 'Return home + cool down', time: '07:30-08:00 AM', category: 'Recovery', duration: 30, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'bath-ready', name: 'Bath + get ready for office', time: '08:00-08:30 AM', category: 'Personal', duration: 30, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'breakfast', name: 'Breakfast / Diet', time: '08:30-08:45 AM', category: 'Food', duration: 15, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'temple', name: 'Temple + Prayer', time: '08:45-08:50 AM', category: 'Spiritual', duration: 5, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'travel-bus', name: 'Leave home + travel to bus point', time: '08:50-09:15 AM', category: 'Commute', duration: 25, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'career-morning', name: 'Career Learning', time: '09:15-10:10 AM', category: 'Career', duration: 55, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'office-checkin', name: 'Office Check-in', time: '10:10 AM', category: 'Work', duration: 0, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'office-work', name: 'Office / Job', time: '10:10 AM–07:30 PM', category: 'Work', duration: 9 * 60 + 20, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'office-logout', name: 'Office Logout', time: '07:30 PM', category: 'Work', duration: 0, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'return-bus-point', name: 'Reach return bus point', time: '07:30-07:45 PM', category: 'Commute', duration: 15, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'return-bus', name: 'Return bus commute', time: '07:45-08:40 PM', category: 'Commute', duration: 55, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'travel-home', name: 'Travel from bus point to home', time: '08:40-09:00 PM', category: 'Commute', duration: 20, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'refresh', name: 'Refresh + Relax', time: '09:00-09:30 PM', category: 'Recovery', duration: 30, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'dinner', name: 'Dinner', time: '09:30-10:00 PM', category: 'Food', duration: 30, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'job-study', name: 'Job Switch Study', time: '10:00-10:25 PM', category: 'Career', duration: 25, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'wind-down', name: 'Wind down + prepare for sleep', time: '10:25-10:30 PM', category: 'Sleep', duration: 5, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'sleep', name: 'Sleep', time: '10:30 PM', category: 'Sleep', duration: 0, status: 'pending', notes: '', actualStart: '', actualEnd: '' },
    { id: 'sleep-window', name: '7.5 Hours Sleep', time: '10:30 PM–06:00 AM', category: 'Sleep', duration: 450, status: 'pending', notes: '', actualStart: '', actualEnd: '' }
  ];

  const CATEGORY_COLORS = {
    Health: 'var(--success)',
    Fitness: 'var(--warning)',
    Personal: 'var(--secondary)',
    Spiritual: 'var(--info)',
    Commute: 'var(--primary)',
    Career: 'var(--primary)',
    Work: 'var(--success)',
    Food: 'var(--warning)',
    Recovery: 'var(--success)',
    Sleep: 'var(--text-secondary)'
  };

  const STUDY_TYPES = [
    'Java', 'Spring Boot', 'Spring Security', 'Hibernate/JPA', 'MySQL', 'REST API', 'Microservices', 'System Design', 'DSA', 'Interview Preparation', 'Resume', 'Job Applications', 'Other'
  ];

  async function formatDateKey(date) {
    const d = (date instanceof Date) ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async function formatReadableDate(dateString) {
    if (!dateString) return 'Select date';
    const d = new Date(`${dateString}T12:00:00`);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  async function getDayName(dateString) {
    const d = new Date(`${dateString}T12:00:00`);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  async function minutesToDisplay(minutes) {
    if (!minutes || minutes <= 0) return '0 min';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs && mins) return `${hrs}h ${mins}m`;
    if (hrs) return `${hrs}h`;
    return `${mins}m`;
  }

  async function sleepDurationDisplay(actualMinutes) {
    if (!actualMinutes || actualMinutes <= 0) return '0h 0m';
    const hrs = Math.floor(actualMinutes / 60);
    const mins = actualMinutes % 60;
    return `${hrs}h ${mins.toString().padStart(2,'0')}m`;
  }

  async function createDefaultRoutine(dateString) {
    const dayName = getDayName(dateString);
    const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
    const activities = isWeekend ? [] : DEFAULT_WEEKDAY_TEMPLATE.map((activity, index) => ({
      id: activity.id || `routine_${dateString}_${index}`,
      name: activity.name,
      time: activity.time,
      category: activity.category,
      duration: Number(activity.duration || 0),
      status: 'pending',
      notes: '',
      actualStart: '',
      actualEnd: '',
      disabled: false,
      pendingReason: ''
    }));

    const routine = {
      date: dateString,
      day: dayName,
      weekend: isWeekend,
      activities,
      sleep: {
        plannedBedtime: '10:30 PM',
        actualBedtime: '',
        plannedWakeup: '06:00 AM',
        actualWakeup: '',
        actualSleepDuration: 0,
        targetAchieved: false,
        quality: 3,
        notes: ''
      },
      gym: {
        completed: false,
        workoutType: 'Strength',
        duration: 60,
        intensity: 'Moderate',
        notes: '',
        weeklyConsistency: []
      },
      study: {
        morning: {
          topic: 'Career Learning',
          duration: 55,
          technology: 'Java',
          studyType: 'Java',
          notes: '',
          completed: false,
          status: 'pending'
        },
        evening: {
          topic: 'Job Switch Study',
          duration: 25,
          technology: 'Spring Boot',
          studyType: 'Spring Boot',
          notes: '',
          completed: false,
          status: 'pending'
        }
      },
      reflections: {
        morning: '',
        evening: '',
        missed: '',
        tomorrow: ''
      },
      dailyScore: 0,
      lastUpdated: new Date().toISOString()
    };

    return routine;
  }

  const RoutineModule = {
    selectedDate: formatDateKey(new Date()),
    charts: {},
    createDefaultRoutine: createDefaultRoutine,

    init: async function () {
      this.ensureTodayRoutine();
      this.render();
    },

    ensureTodayRoutine: async function () {
      try {
        const store = await StorageService.get(ROUTINE_STORAGE_KEY) || {};
        const today = formatDateKey(new Date());
        if (!store[today]) {
          store[today] = createDefaultRoutine(today);
          await StorageService.set(ROUTINE_STORAGE_KEY, store);
        }
        this.selectedDate = today;
      } catch (error) {
        console.error('Routine init failed', error);
        Utils.showToast('Routine Error', 'Daily routine data could not be initialized.', 'danger');
      }
    },

    loadRoutine: async function (dateString) {
      try {
        const key = dateString || this.selectedDate || formatDateKey(new Date());
        const store = await StorageService.get(ROUTINE_STORAGE_KEY) || {};
        if (!store[key]) {
          store[key] = createDefaultRoutine(key);
          await StorageService.set(ROUTINE_STORAGE_KEY, store);
        }
        return store[key];
      } catch (error) {
        console.error('Failed to load routine', error);
        Utils.showToast('Routine Load Failed', 'The routine data for this day could not be loaded.', 'danger');
        return createDefaultRoutine(formatDateKey(new Date()));
      }
    },

    saveRoutine: async function (dateString, routine) {
      try {
        const store = await StorageService.get(ROUTINE_STORAGE_KEY) || {};
        store[dateString] = routine;
        await StorageService.set(ROUTINE_STORAGE_KEY, store);
        return true;
      } catch (error) {
        console.error('Failed to save routine', error);
        Utils.showToast('Routine Save Failed', 'Your routine changes were not saved.', 'danger');
        return false;
      }
    },

    getRoutineForDate: async function (dateString) {
      return this.loadRoutine(dateString);
    },

    getSelectedRoutine: async function () {
      return this.getRoutineForDate(this.selectedDate);
    },

    updateActivityStatus: async function (dateString, index, status) {
      const routine = await this.getRoutineForDate(dateString);
      if (!routine || !routine.activities[index]) return;
      const activity = routine.activities[index];
      activity.status = status;
      if (status === 'completed') {
        activity.completed = true;
      } else {
        activity.completed = false;
      }
      routine.lastUpdated = new Date().toISOString();
      routine.dailyScore = this.calculateRoutineScore(routine);
      this.saveRoutine(dateString, routine);
      if (window.DashboardModule) window.DashboardModule.render();
      if (window.AnalyticsModule) window.AnalyticsModule.render();
      this.render();
    },

    updateActivityField: async function (dateString, index, field, value) {
      const routine = await this.getRoutineForDate(dateString);
      if (!routine || !routine.activities[index]) return;
      routine.activities[index][field] = value;
      routine.lastUpdated = new Date().toISOString();
      this.saveRoutine(dateString, routine);
    },

    setDate: async function (dateString) {
      this.selectedDate = dateString;
      this.render();
    },

    shiftDate: async function (offset) {
      const d = new Date(`${this.selectedDate}T12:00:00`);
      d.setDate(d.getDate() + offset);
      this.selectedDate = formatDateKey(d);
      this.render();
    },

    calculateDailyCompletion: async function (routine) {
      if (!routine) return { percent: 0, completed: 0, missed: 0, pending: 0, partial: 0, skipped: 0, total: 0 };
      const activities = (routine.activities || []).filter(a => !a.disabled);
      const total = activities.length;
      const completed = activities.filter(a => a.status === 'completed').length;
      const partial = activities.filter(a => a.status === 'partial').length;
      const missed = activities.filter(a => a.status === 'missed').length;
      const pending = activities.filter(a => a.status === 'pending').length;
      const skipped = activities.filter(a => a.status === 'skipped').length;
      const weighted = completed + (partial * 0.5);
      const percent = total > 0 ? Math.round((weighted / total) * 100) : 0;
      return { percent, completed, missed, pending, partial, skipped, total, weighted };
    },

    calculateSleepTarget: async function (routine) {
      const sleep = routine && routine.sleep ? routine.sleep : { actualSleepDuration: 0 };
      const targetMinutes = 7.5 * 60;
      const actualMinutes = Number(sleep.actualSleepDuration || 0);
      const achieved = actualMinutes >= targetMinutes;
      const percent = targetMinutes > 0 ? Math.min((actualMinutes / targetMinutes) * 100, 100) : 0;
      return { actualMinutes, targetMinutes, achieved, percent };
    },

    calculateRoutineScore: async function (routine) {
      const stats = this.calculateDailyCompletion(routine);
      const sleepStats = this.calculateSleepTarget(routine);
      const gymCompleted = routine && routine.gym && routine.gym.completed;
      const morningStudy = routine && routine.study && routine.study.morning ? routine.study.morning.completed : false;
      const eveningStudy = routine && routine.study && routine.study.evening ? routine.study.evening.completed : false;
      const workCompleted = (routine.activities || []).some(a => a.category === 'Work' && a.status === 'completed');
      const personalCompleted = (routine.activities || []).filter(a => ['Health','Personal','Spiritual'].includes(a.category) && a.status === 'completed').length;
      const foodCompleted = (routine.activities || []).filter(a => ['Food','Recovery'].includes(a.category) && a.status === 'completed').length;

      const completionScore = stats.percent;
      const sleepScore = sleepStats.percent;
      const gymScore = gymCompleted ? 100 : 0;
      const studyScore = (morningStudy || eveningStudy) ? 100 : 0;
      const workScore = workCompleted ? 100 : 40;
      const personalScore = ((personalCompleted / Math.max(1, (routine.activities || []).filter(a => ['Health','Personal','Spiritual'].includes(a.category)).length)) * 100) || 0;
      const foodScore = ((foodCompleted / Math.max(1, (routine.activities || []).filter(a => ['Food','Recovery'].includes(a.category)).length)) * 100) || 0;

      const weightedScore = (
        completionScore * 0.25 +
        sleepScore * 0.25 +
        gymScore * 0.20 +
        studyScore * 0.25 +
        workScore * 0.15 +
        personalScore * 0.10 +
        foodScore * 0.05
      ) / 1.25;

      return Math.max(0, Math.min(100, Math.round(weightedScore)));
    },

    calculateStreaks: async function () {
      const store = await StorageService.get(ROUTINE_STORAGE_KEY) || {};
      const today = new Date();
      const dates = Object.keys(store)
        .filter((key) => {
          const keyDate = new Date(`${key}T12:00:00`);
          return !Number.isNaN(keyDate.getTime()) && keyDate <= today;
        })
        .sort((a, b) => new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`));

      let routineStreak = 0;
      let gymStreak = 0;
      let studyStreak = 0;
      let sleepStreak = 0;

      for (const key of dates) {
        const routine = store[key];
        if (!routine) continue;

        const dayName = getDayName(key);
        if (dayName === 'Saturday' || dayName === 'Sunday') {
          continue;
        }

        const metrics = this.calculateDailyCompletion(routine);
        if (metrics.percent >= 70) {
          routineStreak += 1;
        } else {
          break;
        }

        if (routine.gym && routine.gym.completed) {
          gymStreak += 1;
        } else {
          break;
        }

        const studyCompleted = !!(
          routine.study && (
            (routine.study.morning && routine.study.morning.completed) ||
            (routine.study.evening && routine.study.evening.completed)
          )
        );
        if (studyCompleted) {
          studyStreak += 1;
        } else {
          break;
        }

        if (routine && this.calculateSleepTarget(routine).achieved) {
          sleepStreak += 1;
        } else {
          break;
        }
      }

      return { routineStreak, gymStreak, studyStreak, sleepStreak };
    },

    render: async function () {
      try {
        const app = document.getElementById('routine-app');
        if (!app) return;

        const routine = await this.getRoutineForDate(this.selectedDate);
        const completion = await this.calculateDailyCompletion(routine);
        const sleepStats = await this.calculateSleepTarget(routine);
        const score = await this.calculateRoutineScore(routine);
        const streaks = await this.calculateStreaks();
        const totalStudyMinutes = this.getStudyMinutes(routine);
        if (!routine.sleep) routine.sleep = { plannedBedtime: '10:30 PM', actualBedtime: '', plannedWakeup: '06:00 AM', actualWakeup: '', actualSleepDuration: 0, targetAchieved: false, quality: 3, notes: '' };
        if (!routine.gym) routine.gym = { completed: false, workoutType: 'Strength', duration: 60, intensity: 'Moderate', notes: '', weeklyConsistency: [] };
        if (!routine.study) routine.study = { morning: { topic: 'Career Learning', duration: 55, completed: false, status: 'pending' }, evening: { topic: 'Job Switch Study', duration: 25, completed: false, status: 'pending' } };
        if (!routine.reflections) routine.reflections = { morning: '', evening: '', missed: '', tomorrow: '' };

        const gymStatus = routine.gym.completed ? 'Completed' : 'Missed';
        const studyStatus = (routine.study && ((routine.study.morning && routine.study.morning.completed) || (routine.study.evening && routine.study.evening.completed))) ? 'Completed' : 'Missed';
        const workStatus = (routine.activities || []).some(a => a.category === 'Work' && a.status === 'completed') ? 'Completed' : 'Pending';

        app.innerHTML = `
          <div class="routine-shell">
            <div class="routine-toolbar glass-card">
              <div class="routine-date-nav">
                <button class="btn btn-secondary btn-sm routine-date-btn" data-nav="prev"><i class="fas fa-chevron-left"></i> Prev</button>
                <button class="btn btn-primary btn-sm routine-date-btn" data-nav="today">Today</button>
                <button class="btn btn-secondary btn-sm routine-date-btn" data-nav="next">Next <i class="fas fa-chevron-right"></i></button>
                <input type="date" class="routine-date-picker" id="routine-date-picker" value="${this.selectedDate}">
              </div>
              <div class="routine-date-meta">
                <div class="routine-date-main">${formatReadableDate(this.selectedDate)}</div>
                <div class="routine-date-sub">${getDayName(this.selectedDate)} &bull; Routine score ${score}%</div>
              </div>
              <div class="routine-actions">
                <button class="btn btn-secondary btn-sm" id="routine-add-custom-activity"><i class="fas fa-plus"></i> Add Custom Activity</button>
                <button class="btn btn-warning btn-sm" id="routine-reset-default"><i class="fas fa-undo"></i> Reset Day to Default Routine</button>
              </div>
            </div>

            <div class="routine-kpis">
              <div class="routine-kpi-card glass-card">
                <div class="routine-kpi-label">Today's Completion</div>
                <div class="routine-kpi-value">${completion.percent}%</div>
                <div class="routine-kpi-sub">${completion.completed} / ${completion.total} trackable</div>
              </div>
              <div class="routine-kpi-card glass-card">
                <div class="routine-kpi-label">Activities</div>
                <div class="routine-kpi-value">${completion.completed}/${completion.total}</div>
                <div class="routine-kpi-sub">Completed / Total planned</div>
              </div>
              <div class="routine-kpi-card glass-card">
                <div class="routine-kpi-label">Gym</div>
                <div class="routine-kpi-value">${routine.weekend ? '—' : (routine.gym && routine.gym.completed ? 'Done' : 'Missed')}</div>
                <div class="routine-kpi-sub">${routine.weekend ? 'Flexible weekend' : '1 hr target'}</div>
              </div>
              <div class="routine-kpi-card glass-card">
                <div class="routine-kpi-label">Study</div>
                <div class="routine-kpi-value">${studyStatus}</div>
                <div class="routine-kpi-sub">${totalStudyMinutes} min planned</div>
              </div>
              <div class="routine-kpi-card glass-card">
                <div class="routine-kpi-label">Sleep</div>
                <div class="routine-kpi-value">${sleepDurationDisplay(sleepStats.actualMinutes)}</div>
                <div class="routine-kpi-sub">${sleepStats.achieved ? 'Target met' : 'Need 7h 30m'}</div>
              </div>
              <div class="routine-kpi-card glass-card">
                <div class="routine-kpi-label">Career Learning</div>
                <div class="routine-kpi-value">${this.getCareerLearningMinutes(routine)} min</div>
                <div class="routine-kpi-sub">${this.getCareerLearningLabel(routine)}</div>
              </div>
            </div>

            <div class="routine-layout">
              <div class="routine-table-card">
                <h3>Daily Timetable</h3>
                <table class="routine-timeline">
                  <thead>
                    <tr>
                      <th style="width: 80px;">Status</th>
                      <th>Time</th>
                      <th>Activity</th>
                      <th>Category</th>
                      <th>Duration</th>
                      <th style="width: 160px;">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(routine.activities || []).map((activity, index) => `
                      <tr class="routine-row" data-activity-index="${index}">
                        <td>
                          <select class="routine-status-select" data-action="status" data-index="${index}">
                            <option value="pending" ${activity.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="completed" ${activity.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="partial" ${activity.status === 'partial' ? 'selected' : ''}>Partially Completed</option>
                            <option value="missed" ${activity.status === 'missed' ? 'selected' : ''}>Missed</option>
                            <option value="skipped" ${activity.status === 'skipped' ? 'selected' : ''}>Skipped</option>
                          </select>
                        </td>
                        <td>${activity.time}</td>
                        <td>
                          <div class="routine-activity-main">
                            <input type="checkbox" class="routine-checkbox" data-action="checkbox" data-index="${index}" ${activity.status === 'completed' ? 'checked' : ''}>
                            <div>
                              <div class="routine-activity-name">${activity.name}</div>
                              <div class="routine-activity-meta">${activity.actualStart && activity.actualEnd ? `Actual: ${activity.actualStart}–${activity.actualEnd}` : 'No actual time recorded'}</div>
                            </div>
                          </div>
                        </td>
                        <td><span class="routine-category-pill routine-category-${activity.category}">${activity.category}</span></td>
                        <td>${activity.duration ? minutesToDisplay(activity.duration) : '-'}</td>
                        <td>
                          <textarea class="routine-textarea" data-action="notes" data-index="${index}" placeholder="Optional notes...">${(activity.notes || '')}</textarea>
                        </td>
                      </tr>
                    `).join('') || '<tr><td colspan="6">No routine entries for this date.</td></tr>'}
                  </tbody>
                </table>
              </div>

              <div class="routine-side-card">
                <div class="routine-tracker-grid">
                  <div class="routine-tracker-card">
                    <div class="routine-tracker-header">
                      <h4>Sleep Tracker</h4>
                      <span class="badge badge-low">${sleepStats.achieved ? 'Target' : 'Missed'}</span>
                    </div>
                    <div class="routine-tracker-form">
                      <div class="routine-field-row">
                        <div>
                          <label>Planned Bedtime</label>
                          <input class="routine-input" data-sleep-field="plannedBedtime" value="${routine.sleep.plannedBedtime || '10:30 PM'}">
                        </div>
                        <div>
                          <label>Actual Bedtime</label>
                          <input class="routine-input" data-sleep-field="actualBedtime" value="${routine.sleep.actualBedtime || ''}" placeholder="HH:MM">
                        </div>
                      </div>
                      <div class="routine-field-row">
                        <div>
                          <label>Planned Wake-up</label>
                          <input class="routine-input" data-sleep-field="plannedWakeup" value="${routine.sleep.plannedWakeup || '06:00 AM'}">
                        </div>
                        <div>
                          <label>Actual Wake-up</label>
                          <input class="routine-input" data-sleep-field="actualWakeup" value="${routine.sleep.actualWakeup || ''}" placeholder="HH:MM">
                        </div>
                      </div>
                      <div class="routine-field-row">
                        <div>
                          <label>Sleep Duration</label>
                          <input class="routine-input" data-sleep-field="actualSleepDuration" value="${routine.sleep.actualSleepDuration || 0}" type="number">
                        </div>
                        <div>
                          <label>Quality (1-5)</label>
                          <select class="routine-select" data-sleep-field="quality">
                            ${[1,2,3,4,5].map(v => `<option value="${v}" ${Number(routine.sleep.quality || 3) === v ? 'selected' : ''}>${v}</option>`).join('')}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label>Notes</label>
                        <textarea class="routine-textarea" data-sleep-field="notes">${routine.sleep.notes || ''}</textarea>
                      </div>
                      <div class="routine-inline-note">Target: 7h 30m &bull; Actual: ${sleepDurationDisplay(sleepStats.actualMinutes)} / 7h 30m</div>
                    </div>
                  </div>

                  <div class="routine-tracker-card">
                    <div class="routine-tracker-header">
                      <h4>Gym Tracker</h4>
                      <span class="badge badge-medium">${routine.gym && routine.gym.completed ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div class="routine-tracker-form">
                      <div class="routine-field-row">
                        <div>
                          <label>Gym completed</label>
                          <select class="routine-select" data-gym-field="completed">
                            <option value="true" ${routine.gym && routine.gym.completed ? 'selected' : ''}>Yes</option>
                            <option value="false" ${!(routine.gym && routine.gym.completed) ? 'selected' : ''}>No</option>
                          </select>
                        </div>
                        <div>
                          <label>Workout type</label>
                          <input class="routine-input" data-gym-field="workoutType" value="${routine.gym.workoutType || 'Strength'}">
                        </div>
                      </div>
                      <div class="routine-field-row">
                        <div>
                          <label>Duration</label>
                          <input class="routine-input" data-gym-field="duration" type="number" value="${routine.gym.duration || 60}">
                        </div>
                        <div>
                          <label>Intensity</label>
                          <select class="routine-select" data-gym-field="intensity">
                            <option value="Low" ${routine.gym.intensity === 'Low' ? 'selected' : ''}>Low</option>
                            <option value="Moderate" ${routine.gym.intensity === 'Moderate' || !routine.gym.intensity ? 'selected' : ''}>Moderate</option>
                            <option value="High" ${routine.gym.intensity === 'High' ? 'selected' : ''}>High</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label>Notes</label>
                        <textarea class="routine-textarea" data-gym-field="notes">${routine.gym.notes || ''}</textarea>
                      </div>
                    </div>
                  </div>

                  <div class="routine-tracker-card">
                    <div class="routine-tracker-header">
                      <h4>Study Tracker</h4>
                      <span class="badge badge-low">${studyStatus}</span>
                    </div>
                    <div class="routine-tracker-form">
                      <div>
                        <label>Morning commute learning</label>
                        <select class="routine-select" data-study-field="morningTopic">
                          ${STUDY_TYPES.map(type => `<option value="${type}" ${routine.study.morning.topic === type ? 'selected' : ''}>${type}</option>`).join('')}
                        </select>
                      </div>
                      <div class="routine-field-row">
                        <div>
                          <label>Duration</label>
                          <input class="routine-input" data-study-field="morningDuration" type="number" value="${routine.study.morning.duration || 55}">
                        </div>
                        <div>
                          <label>Completed</label>
                          <select class="routine-select" data-study-field="morningCompleted">
                            <option value="true" ${routine.study.morning.completed ? 'selected' : ''}>Yes</option>
                            <option value="false" ${!routine.study.morning.completed ? 'selected' : ''}>No</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label>Evening study</label>
                        <select class="routine-select" data-study-field="eveningTopic">
                          ${STUDY_TYPES.map(type => `<option value="${type}" ${routine.study.evening.topic === type ? 'selected' : ''}>${type}</option>`).join('')}
                        </select>
                      </div>
                      <div class="routine-field-row">
                        <div>
                          <label>Duration</label>
                          <input class="routine-input" data-study-field="eveningDuration" type="number" value="${routine.study.evening.duration || 25}">
                        </div>
                        <div>
                          <label>Completed</label>
                          <select class="routine-select" data-study-field="eveningCompleted">
                            <option value="true" ${routine.study.evening.completed ? 'selected' : ''}>Yes</option>
                            <option value="false" ${!routine.study.evening.completed ? 'selected' : ''}>No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="routine-analytics-card">
              <h3>Weekly Routine Analysis</h3>
              <div class="routine-weekday-summary">
                ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, idx) => `<span class="routine-weekday-pill">${day}</span>`).join('')}
              </div>
              <div class="routine-insights">
                <div class="routine-insight-box">
                  <span class="routine-insight-label">Current Streak</span>
                  <div class="routine-insight-value">${streaks.routineStreak} days</div>
                </div>
                <div class="routine-insight-box">
                  <span class="routine-insight-label">Gym Consistency</span>
                  <div class="routine-insight-value">${this.calculateWeeklyGymConsistency(this.selectedDate)}%</div>
                </div>
                <div class="routine-insight-box">
                  <span class="routine-insight-label">Study Consistency</span>
                  <div class="routine-insight-value">${this.calculateWeeklyStudyConsistency(this.selectedDate)}%</div>
                </div>
                <div class="routine-insight-box">
                  <span class="routine-insight-label">Sleep Target</span>
                  <div class="routine-insight-value">${this.calculateSleepAchievementWeek(this.selectedDate)}%</div>
                </div>
              </div>
              <div class="routine-analytics-grid" style="margin-top:20px;">
                <div class="routine-chart-card"><canvas id="routine-chart-completion"></canvas></div>
                <div class="routine-chart-card"><canvas id="routine-chart-gym"></canvas></div>
                <div class="routine-chart-card"><canvas id="routine-chart-study"></canvas></div>
                <div class="routine-chart-card"><canvas id="routine-chart-sleep"></canvas></div>
              </div>
            </div>

            <div class="routine-notes-card">
              <h3>Daily Reflections</h3>
              <div class="routine-tracker-form">
                <div>
                  <label>Morning Reflection</label>
                  <textarea class="routine-textarea" data-reflection-field="morning">${routine.reflections.morning || ''}</textarea>
                </div>
                <div>
                  <label>Evening Reflection</label>
                  <textarea class="routine-textarea" data-reflection-field="evening">${routine.reflections.evening || ''}</textarea>
                </div>
                <div>
                  <label>Missed Activities</label>
                  <textarea class="routine-textarea" data-reflection-field="missed">${routine.reflections.missed || ''}</textarea>
                </div>
                <div>
                  <label>Tomorrow Adjustment</label>
                  <textarea class="routine-textarea" data-reflection-field="tomorrow">${routine.reflections.tomorrow || ''}</textarea>
                </div>
              </div>
            </div>
          </div>
        `;

        this.bindRoutineEvents();
        this.renderWeeklyCharts();
      } catch (error) {
        console.error('Routine render failed', error);
        Utils.showToast('Routine Render Error', 'Daily routine page failed to render properly.', 'danger');
      }
    },

    bindRoutineEvents: async function () {
      const app = document.getElementById('routine-app');
      if (!app) return;

      const datePicker = document.getElementById('routine-date-picker');
      if (datePicker) {
        datePicker.addEventListener('change', async (event) => {
          this.setDate(event.target.value || formatDateKey(new Date()));
        });
      }

      const navButtons = app.querySelectorAll('[data-nav]');
      navButtons.forEach((button) => {
        button.addEventListener('click', async () => {
          const nav = button.getAttribute('data-nav');
          if (nav === 'prev') this.shiftDate(-1);
          if (nav === 'next') this.shiftDate(1);
          if (nav === 'today') this.setDate(formatDateKey(new Date()));
        });
      });

      app.querySelectorAll('[data-action="status"]').forEach((select) => {
        select.addEventListener('change', async (event) => {
          const idx = Number(event.target.getAttribute('data-index'));
          this.updateActivityStatus(this.selectedDate, idx, event.target.value);
        });
      });

      app.querySelectorAll('[data-action="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener('change', async (event) => {
          const idx = Number(event.target.getAttribute('data-index'));
          this.updateActivityStatus(this.selectedDate, idx, event.target.checked ? 'completed' : 'pending');
        });
      });

      app.querySelectorAll('[data-action="notes"]').forEach((textarea) => {
        textarea.addEventListener('input', async (event) => {
          const idx = Number(event.target.getAttribute('data-index'));
          this.updateActivityField(this.selectedDate, idx, 'notes', event.target.value);
        });
      });

      app.querySelectorAll('[data-sleep-field]').forEach((input) => {
        const field = input.getAttribute('data-sleep-field');
        input.addEventListener('change', async () => {
          const routine = await this.getRoutineForDate(this.selectedDate);
          if (!routine || !routine.sleep) return;
          let value = input.value;
          if (field === 'quality') value = Number(value);
          if (field === 'actualSleepDuration') value = Number(value || 0);
          routine.sleep[field] = value;
          routine.sleep.actualSleepDuration = this.parseSleepHours(routine.sleep.actualBedtime, routine.sleep.actualWakeup, routine.sleep.actualSleepDuration);
          routine.sleep.targetAchieved = routine.sleep.actualSleepDuration >= 7.5 * 60;
          this.saveRoutine(this.selectedDate, routine);
          this.render();
        });
      });

      app.querySelectorAll('[data-gym-field]').forEach((input) => {
        input.addEventListener('change', async () => {
          const routine = await this.getRoutineForDate(this.selectedDate);
          const field = input.getAttribute('data-gym-field');
          const value = field === 'completed' ? input.value === 'true' : input.value;
          routine.gym[field] = value;
          if (field === 'completed' && value === true) {
            routine.gym.completed = true;
          }
          if (field === 'completed' && value === false) {
            routine.gym.completed = false;
          }
          this.saveRoutine(this.selectedDate, routine);
          this.render();
        });
      });

      app.querySelectorAll('[data-study-field]').forEach((input) => {
        input.addEventListener('change', async () => {
          const routine = await this.getRoutineForDate(this.selectedDate);
          const field = input.getAttribute('data-study-field');
          const normalized = field.toLowerCase();
          if (normalized.includes('morning')) {
            if (normalized.endsWith('topic')) routine.study.morning.topic = input.value;
            if (normalized.endsWith('duration')) routine.study.morning.duration = Number(input.value || 0);
            if (normalized.endsWith('completed')) routine.study.morning.completed = input.value === 'true';
          } else if (normalized.includes('evening')) {
            if (normalized.endsWith('topic')) routine.study.evening.topic = input.value;
            if (normalized.endsWith('duration')) routine.study.evening.duration = Number(input.value || 0);
            if (normalized.endsWith('completed')) routine.study.evening.completed = input.value === 'true';
          }
          routine.dailyScore = this.calculateRoutineScore(routine);
          this.saveRoutine(this.selectedDate, routine);
          if (window.DashboardModule) window.DashboardModule.render();
          if (window.AnalyticsModule) window.AnalyticsModule.render();
          this.render();
        });
      });

      const addCustomBtn = document.getElementById('routine-add-custom-activity');
      if (addCustomBtn) {
        addCustomBtn.addEventListener('click', async () => this.addCustomActivity());
      }

      const resetBtn = document.getElementById('routine-reset-default');
      if (resetBtn) {
        resetBtn.addEventListener('click', async () => this.resetDayToDefault());
      }

      app.querySelectorAll('[data-reflection-field]').forEach((textarea) => {
        textarea.addEventListener('input', async (event) => {
          const field = event.target.getAttribute('data-reflection-field');
          const routine = await this.getRoutineForDate(this.selectedDate);
          if (!routine.reflections) routine.reflections = {};
          routine.reflections[field] = event.target.value;
          this.saveRoutine(this.selectedDate, routine);
        });
      });
    },

    parseSleepHours: async function (bedtime, wakeup, manualMinutes) {
      if (manualMinutes && Number(manualMinutes) > 0) return Number(manualMinutes);
      if (!bedtime || !wakeup) return 0;
      const parseTime = (value) => {
        if (!value) return null;
        const [hourText, meridian] = value.trim().split(' ');
        const [hh, mm] = hourText.split(':').map(Number);
        let minutes = hh * 60 + (mm || 0);
        if (meridian && meridian.toLowerCase() === 'pm' && hh !== 12) minutes += 12 * 60;
        if (meridian && meridian.toLowerCase() === 'am' && hh === 12) minutes = 0;
        return minutes;
      };
      const start = parseTime(bedtime);
      const end = parseTime(wakeup);
      if (start === null || end === null) return 0;
      let diff = end - start;
      if (diff < 0) diff += 24 * 60;
      return diff;
    },

    getStudyMinutes: async function (routine) {
      if (!routine || !routine.study) return 0;
      const morning = Number(routine.study.morning && routine.study.morning.duration) || 0;
      const evening = Number(routine.study.evening && routine.study.evening.duration) || 0;
      return morning + evening;
    },

    getCareerLearningMinutes: async function (routine) {
      if (!routine || !routine.study) return 0;
      const morning = Number(routine.study.morning && routine.study.morning.duration) || 0;
      const evening = Number(routine.study.evening && routine.study.evening.duration) || 0;
      return morning + evening;
    },

    getCareerLearningLabel: async function (routine) {
      const morning = Number(routine.study.morning && routine.study.morning.duration) || 0;
      const evening = Number(routine.study.evening && routine.study.evening.duration) || 0;
      if (morning || evening) {
        return `${morning} min commute + ${evening} min evening`;
      }
      return 'No study logged';
    },

    calculateWeeklyGymConsistency: async function (dateString) {
      const store = await StorageService.get(ROUTINE_STORAGE_KEY) || {};
      const today = new Date(`${dateString}T12:00:00`);
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(formatDateKey(d));
      }
      let count = 0;
      let total = 0;
      days.forEach((key) => {
        const routine = store[key];
        if (!routine) return;
        const dayName = getDayName(key);
        if (dayName === 'Saturday' || dayName === 'Sunday') return;
        total += 1;
        if (routine.gym && routine.gym.completed) count += 1;
      });
      return total > 0 ? Math.round((count / total) * 100) : 0;
    },

    calculateWeeklyStudyConsistency: async function (dateString) {
      const store = await StorageService.get(ROUTINE_STORAGE_KEY) || {};
      const today = new Date(`${dateString}T12:00:00`);
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(formatDateKey(d));
      }
      let count = 0;
      let total = 0;
      days.forEach((key) => {
        const routine = store[key];
        if (!routine) return;
        const dayName = getDayName(key);
        if (dayName === 'Saturday' || dayName === 'Sunday') return;
        total += 1;
        const study = routine.study || {};
        const completed = (study.morning && study.morning.completed) || (study.evening && study.evening.completed);
        if (completed) count += 1;
      });
      return total > 0 ? Math.round((count / total) * 100) : 0;
    },

    calculateSleepAchievementWeek: async function (dateString) {
      const store = await StorageService.get(ROUTINE_STORAGE_KEY) || {};
      const today = new Date(`${dateString}T12:00:00`);
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(formatDateKey(d));
      }
      let total = 0;
      let achieved = 0;
      days.forEach((key) => {
        const routine = store[key];
        if (!routine || routine.weekend) return;
        total += 1;
        if (this.calculateSleepTarget(routine).achieved) achieved += 1;
      });
      return total > 0 ? Math.round((achieved / total) * 100) : 0;
    },

    renderWeeklyCharts: async function () {
      if (typeof Chart === 'undefined') return;
      const store = await StorageService.get(ROUTINE_STORAGE_KEY) || {};
      const today = new Date(`${this.selectedDate}T12:00:00`);
      const labels = [];
      const completionData = [];
      const gymData = [];
      const studyData = [];
      const sleepData = [];
      const categoryData = {};

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = formatDateKey(d);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(label);

        const routine = store[key] || createDefaultRoutine(key);
        const completion = this.calculateDailyCompletion(routine);
        completionData.push(completion.percent);
        gymData.push(routine && routine.gym && routine.gym.completed ? 1 : 0);
        studyData.push(this.getStudyMinutes(routine));
        sleepData.push(Math.round((this.calculateSleepTarget(routine).actualMinutes || 0) / 60));

        if (routine && routine.activities) {
          routine.activities.forEach((activity) => {
            if (!activity.category) return;
            categoryData[activity.category] = (categoryData[activity.category] || 0) + (activity.status === 'completed' ? 1 : 0);
          });
        }
      }

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const textColor = isDark ? '#9ca3af' : '#475569';
      const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', size: 11 } } } },
        scales: { x: { grid: { color: gridColor }, ticks: { color: textColor } }, y: { grid: { color: gridColor }, ticks: { color: textColor } } }
      };

      const completionCtx = document.getElementById('routine-chart-completion');
      if (completionCtx) {
        if (this.charts.completion) this.charts.completion.destroy();
        this.charts.completion = new Chart(completionCtx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Daily completion %',
              data: completionData,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.15)',
              fill: true,
              tension: 0.25
            }]
          },
          options: chartOptions
        });
      }

      const gymCtx = document.getElementById('routine-chart-gym');
      if (gymCtx) {
        if (this.charts.gym) this.charts.gym.destroy();
        this.charts.gym = new Chart(gymCtx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Gym sessions',
              data: gymData,
              backgroundColor: 'rgba(245, 158, 11, 0.7)',
              borderRadius: 5
            }]
          },
          options: chartOptions
        });
      }

      const studyCtx = document.getElementById('routine-chart-study');
      if (studyCtx) {
        if (this.charts.study) this.charts.study.destroy();
        this.charts.study = new Chart(studyCtx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Study minutes',
              data: studyData,
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderRadius: 5
            }]
          },
          options: chartOptions
        });
      }

      const sleepCtx = document.getElementById('routine-chart-sleep');
      if (sleepCtx) {
        if (this.charts.sleep) this.charts.sleep.destroy();
        this.charts.sleep = new Chart(sleepCtx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Sleep hours',
              data: sleepData,
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              fill: true,
              tension: 0.25
            }, {
              label: 'Target 7.5h',
              data: labels.map(() => 7.5),
              borderColor: '#ef4444',
              pointRadius: 0,
              borderDash: [6, 6]
            }]
          },
          options: chartOptions
        });
      }
    },

    resetDayToDefault: async function () {
      const routine = createDefaultRoutine(this.selectedDate);
      this.saveRoutine(this.selectedDate, routine);
      this.render();
      Utils.showToast('Routine Reset', 'This day was restored to the default Monday-Friday template.', 'success');
    },

    addCustomActivity: async function () {
      const routine = this.getRoutineForDate(this.selectedDate);
      routine.activities.push({
        id: `custom_${Date.now()}`,
        name: 'Custom Activity',
        time: 'Custom Time',
        category: 'Personal',
        duration: 15,
        status: 'pending',
        notes: '',
        actualStart: '',
        actualEnd: '',
        disabled: false
      });
      this.saveRoutine(this.selectedDate, routine);
      this.render();
    }
  };

  window.RoutineModule = RoutineModule;
})();
