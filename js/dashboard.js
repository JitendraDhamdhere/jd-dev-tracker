/* Dashboard JS - Aggregates data and renders charts and stat widgets */

(function () {
  const DashboardModule = {
    charts: {},

    init: async function () {
      this.render();
    },

    render: async function () {
      this.renderStats();
      this.renderCharts();
      this.renderRecentActivity();
    },

    renderStats: async function () {
      const profile = await StorageService.get('profile') || {};
      const studySessions = await StorageService.get('study_sessions') || [];
      const tasks = await StorageService.get('tasks') || [];
      const jobs = await StorageService.get('jobs') || [];
      const resumes = await StorageService.get('resumes') || [];
      const routine = (window.RoutineModule && window.RoutineModule.getRoutineForDate(new Date().toISOString().split('T')[0])) || { activities: [] };
      const routineStats = (window.RoutineModule && typeof window.RoutineModule.calculateDailyCompletion === 'function') ? window.RoutineModule.calculateDailyCompletion(routine) : { percent: 0, completed: 0, pending: 0, missed: 0, total: 0 };

      // 1. Streak
      const streakEl = document.getElementById('dash-streak-val');
      if (streakEl) streakEl.textContent = `${profile.studyStreak || 0} Days`;

      // 2. Study Hours Today, Weekly, Monthly
      const today = new Date().toISOString().split('T')[0];
      const todayMs = new Date(today).getTime();
      const oneWeekAgoMs = todayMs - 7 * 24 * 60 * 60 * 1000;
      const oneMonthAgoMs = todayMs - 30 * 24 * 60 * 60 * 1000;

      let studyToday = 0;
      let studyWeekly = 0;
      let studyMonthly = 0;

      studySessions.forEach(s => {
        if (!s.completed) return;
        const sTime = new Date(s.date).getTime();
        const durationHrs = s.duration / 60;

        if (s.date === today) {
          studyToday += durationHrs;
        }
        if (sTime >= oneWeekAgoMs) {
          studyWeekly += durationHrs;
        }
        if (sTime >= oneMonthAgoMs) {
          studyMonthly += durationHrs;
        }
      });

      const todayHrEl = document.getElementById('dash-study-today');
      if (todayHrEl) todayHrEl.textContent = `${studyToday.toFixed(1)} hrs`;
      
      const weeklyHrEl = document.getElementById('dash-study-weekly');
      if (weeklyHrEl) weeklyHrEl.textContent = `${studyWeekly.toFixed(1)} hrs`;
      
      const monthlyHrEl = document.getElementById('dash-study-monthly');
      if (monthlyHrEl) monthlyHrEl.textContent = `${studyMonthly.toFixed(1)} hrs`;

      // 3. Tasks Stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const pendingTasks = totalTasks - completedTasks;

      const totalTasksEl = document.getElementById('dash-tasks-total');
      if (totalTasksEl) totalTasksEl.textContent = totalTasks;
      
      const completedTasksEl = document.getElementById('dash-tasks-completed');
      if (completedTasksEl) completedTasksEl.textContent = completedTasks;
      
      const pendingTasksEl = document.getElementById('dash-tasks-pending');
      if (pendingTasksEl) pendingTasksEl.textContent = pendingTasks;

      // 4. Careers Stats
      const appliedCount = jobs.length;
      const offerCount = jobs.filter(j => j.status === 'Offer Received' || j.status === 'Selected').length;
      const interviewsCount = jobs.filter(j => ['Technical Round 1', 'Technical Round 2', 'Manager Round', 'HR Round', 'Final Round'].includes(j.status)).length;

      const jobsAppliedEl = document.getElementById('dash-jobs-applied');
      if (jobsAppliedEl) jobsAppliedEl.textContent = appliedCount;
      
      const interviewCountEl = document.getElementById('dash-interviews');
      if (interviewCountEl) interviewCountEl.textContent = interviewsCount;
      
      const offersEl = document.getElementById('dash-offers');
      if (offersEl) offersEl.textContent = offerCount;

      // 5. Resume and Goals
      const activeResume = resumes[0] ? `${resumes[0].name} (${resumes[0].version})` : 'None';
      const resumeEl = document.getElementById('dash-resume-ver');
      if (resumeEl) resumeEl.textContent = activeResume;

      // 6. Daily routine compact widget
      const routinePercentEl = document.getElementById('dashboard-routine-percent');
      if (routinePercentEl) routinePercentEl.textContent = `${routineStats.percent || 0}%`;
      const routineCompletedEl = document.getElementById('dashboard-routine-completed');
      if (routineCompletedEl) routineCompletedEl.textContent = routineStats.completed || 0;
      const routinePendingEl = document.getElementById('dashboard-routine-pending');
      if (routinePendingEl) routinePendingEl.textContent = routineStats.pending || 0;
      const routineMissedEl = document.getElementById('dashboard-routine-missed');
      if (routineMissedEl) routineMissedEl.textContent = routineStats.missed || 0;

      // 7. Learning Progress Rings
      this.updateProgressRing('dash-progress-ring-java', this.getTrackerPercentage('java'));
      this.updateProgressRing('dash-progress-ring-spring', this.getTrackerPercentage('spring'));
      this.updateProgressRing('dash-progress-ring-mysql', this.getTrackerPercentage('mysql'));
      this.updateProgressRing('dash-progress-ring-dsa', this.getDsaPercentage());
    },

    updateProgressRing: async function (id, percent) {
      const container = document.getElementById(id);
      if (!container) return;

      const textEl = container.querySelector('.progress-ring-text');
      const circleEl = container.querySelector('.progress-ring-circle');
      if (!circleEl || !textEl) return;

      const radius = circleEl.r.baseVal.value;
      const circumference = radius * 2 * Math.PI;

      circleEl.style.strokeDasharray = `${circumference} ${circumference}`;
      const offset = circumference - (percent / 100) * circumference;
      circleEl.style.strokeDashoffset = offset;
      
      textEl.textContent = `${Math.round(percent)}%`;
    },

    getTrackerPercentage: async function (trackerKey) {
      const tracker = (await StorageService.get('trackers') || {})[trackerKey] || {};
      const keys = Object.keys(tracker);
      if (keys.length === 0) return 0;
      const completed = keys.filter(k => tracker[k] === true).length;
      return (completed / keys.length) * 100;
    },

    getDsaPercentage: async function () {
      const trackers = await StorageService.get('trackers') || {};
      const dsa = trackers.dsa || {};
      const keys = Object.keys(dsa);
      if (keys.length === 0) return 0;
      
      let solved = 0;
      let target = 0;
      keys.forEach(k => {
        solved += (dsa[k].easy || 0) + (dsa[k].medium || 0) + (dsa[k].hard || 0);
        target += (dsa[k].target || 0);
      });
      return target > 0 ? Math.min((solved / target) * 100, 100) : 0;
    },

    renderCharts: async function () {
      if (typeof Chart === 'undefined') {
        console.warn('Chart.js CDN is not loaded yet');
        return;
      }

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const textColor = isDark ? '#9ca3af' : '#475569';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: textColor, font: { family: 'Inter', size: 11 } }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      };

      // Chart 1: Study Hours Chart
      const studyCtx = document.getElementById('chart-weekly-study');
      if (studyCtx) {
        if (this.charts.weeklyStudy) this.charts.weeklyStudy.destroy();
        
        const studySessions = await StorageService.get('study_sessions') || [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dataMap = [0, 0, 0, 0, 0, 0, 0];
        
        // Calculate last 7 days study hours
        const now = new Date();
        for (let i = 0; i < 7; i++) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dStr = d.toISOString().split('T')[0];
          const dDay = d.getDay();
          
          let daySum = 0;
          studySessions.forEach(s => {
            if (s.date === dStr && s.completed) {
              daySum += s.duration / 60;
            }
          });
          dataMap[dDay] = daySum;
        }

        this.charts.weeklyStudy = new Chart(studyCtx, {
          type: 'bar',
          data: {
            labels: days,
            datasets: [{
              label: 'Study Hours',
              data: dataMap,
              backgroundColor: 'rgba(59, 130, 246, 0.65)',
              borderColor: '#3b82f6',
              borderWidth: 1,
              borderRadius: 4
            }]
          },
          options: chartOptions
        });
      }

      // Chart 2: Job Application Status
      const jobsCtx = document.getElementById('chart-jobs-pipeline');
      if (jobsCtx) {
        if (this.charts.jobsPipeline) this.charts.jobsPipeline.destroy();

        const jobs = await StorageService.get('jobs') || [];
        const statuses = { 'Wishlist': 0, 'Applied': 0, 'Interviewing': 0, 'Offer': 0, 'Rejected': 0 };

        jobs.forEach(job => {
          if (['Technical Round 1', 'Technical Round 2', 'Manager Round', 'HR Round', 'Final Round'].includes(job.status)) {
            statuses['Interviewing']++;
          } else if (['Offer Received', 'Selected'].includes(job.status)) {
            statuses['Offer']++;
          } else if (['Rejected'].includes(job.status)) {
            statuses['Rejected']++;
          } else if (['Applied'].includes(job.status)) {
            statuses['Applied']++;
          } else {
            statuses['Wishlist']++;
          }
        });

        this.charts.jobsPipeline = new Chart(jobsCtx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(statuses),
            datasets: [{
              data: Object.values(statuses),
              backgroundColor: [
                'rgba(107, 114, 128, 0.6)', // Wishlist
                'rgba(59, 130, 246, 0.65)', // Applied
                'rgba(139, 92, 246, 0.65)', // Interviewing
                'rgba(16, 185, 129, 0.65)', // Offer
                'rgba(239, 68, 68, 0.65)'  // Rejected
              ],
              borderColor: isDark ? '#121826' : '#ffffff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: { color: textColor, font: { family: 'Inter', size: 11 } }
              }
            }
          }
        });
      }
    },

    renderRecentActivity: async function () {
      const feedContainer = document.getElementById('dash-recent-feed');
      if (!feedContainer) return;

      const sessions = await StorageService.get('study_sessions') || [];
      const jobs = await StorageService.get('jobs') || [];
      const tasks = await StorageService.get('tasks') || [];

      const activities = [];

      // Add completed study sessions to feed
      sessions.forEach(s => {
        if (s.completed) {
          activities.push({
            icon: 'fa-graduation-cap',
            class: 'success',
            text: `Studied <strong>${s.topic}</strong> under <strong>${s.category}</strong> for ${s.duration} mins.`,
            time: new Date(`${s.date}T${s.startTime || '00:00'}`),
            timeStr: `${Utils.formatDate(s.date)} ${s.startTime || ''}`
          });
        }
      });

      // Add completed tasks
      tasks.forEach(t => {
        if (t.status === 'completed') {
          activities.push({
            icon: 'fa-check',
            class: 'success',
            text: `Completed task: <strong>${t.title}</strong>.`,
            time: new Date(t.dueDate || Date.now()),
            timeStr: `Due: ${Utils.formatDate(t.dueDate)}`
          });
        }
      });

      // Add job applications
      jobs.forEach(j => {
        activities.push({
          icon: 'fa-briefcase',
          class: j.status === 'Rejected' ? 'danger' : 'info',
          text: `Applied as <strong>${j.role}</strong> at <strong>${j.company}</strong> (${j.status}).`,
          time: new Date(j.appDate),
          timeStr: Utils.formatDate(j.appDate)
        });
      });

      // Sort activities descending
      activities.sort((a, b) => b.time - a.time);

      const itemsToDisplay = activities.slice(0, 5);

      if (itemsToDisplay.length === 0) {
        feedContainer.innerHTML = '<div class="text-muted text-center py-3">No activity logged yet.</div>';
        return;
      }

      feedContainer.innerHTML = itemsToDisplay.map(act => `
        <div class="feed-item">
          <div class="feed-bullet ${act.class}"><i class="fas ${act.icon}"></i></div>
          <div class="feed-content">
            <div class="feed-text">${act.text}</div>
            <div class="feed-time">${act.timeStr}</div>
          </div>
        </div>
      `).join('');
    }
  };

  window.DashboardModule = DashboardModule;
})();
