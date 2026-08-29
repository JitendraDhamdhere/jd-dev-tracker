/* Analytics JS - Comprehensive analytics charts for detailed progress auditing */

(function () {
  const AnalyticsModule = {
    charts: {},

    init: async function () {
      this.render();
    },

    render: async function () {
      this.renderCharts();
      this.renderAverages();
    },

    renderCharts: async function () {
      if (typeof Chart === 'undefined') return;

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

      // Chart 1: Study hours trend over the last 30 days
      const studyCtx = document.getElementById('chart-analytics-study');
      if (studyCtx) {
        if (this.charts.studyTrend) this.charts.studyTrend.destroy();

        const sessions = await StorageService.get('study_sessions') || [];
        const labels = [];
        const data = [];

        // Build labels for past 10 days
        const now = Date.now();
        for (let i = 9; i >= 0; i--) {
          const d = new Date(now - i * 24 * 60 * 60 * 1000);
          const dStr = d.toISOString().split('T')[0];
          labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          
          let dayHrs = 0;
          sessions.forEach(s => {
            if (s.date === dStr && s.completed) {
              dayHrs += s.duration / 60;
            }
          });
          data.push(dayHrs);
        }

        this.charts.studyTrend = new Chart(studyCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Hours Studied',
              data: data,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.3
            }]
          },
          options: chartOptions
        });
      }

      // Chart 2: Tech Skills Radar Chart
      const techCtx = document.getElementById('chart-analytics-tech');
      if (techCtx) {
        if (this.charts.techStrength) this.charts.techStrength.destroy();

        // Percentages calculation
        const javaPercent = this.getTrackerPercentage('java');
        const springPercent = this.getTrackerPercentage('spring');
        const mysqlPercent = this.getTrackerPercentage('mysql');
        const dsaPercent = this.getDsaPercentage();
        const roadmapPercent = this.getRoadmapPercentage();

        this.charts.techStrength = new Chart(techCtx, {
          type: 'radar',
          data: {
            labels: ['Java Core', 'Spring Boot', 'MySQL DBMS', 'DSA Solved', 'Roadmap Node'],
            datasets: [{
              label: 'Skills Strength %',
              data: [javaPercent, springPercent, mysqlPercent, dsaPercent, roadmapPercent],
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderColor: '#8b5cf6',
              borderWidth: 2,
              pointBackgroundColor: '#8b5cf6'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: textColor, font: { family: 'Inter', size: 11 } }
              }
            },
            scales: {
              r: {
                grid: { color: gridColor },
                angleLines: { color: gridColor },
                pointLabels: { color: textColor, font: { family: 'Outfit', size: 10, weight: 'bold' } },
                ticks: { backdropColor: 'transparent', color: textColor, font: { size: 9 } },
                min: 0,
                max: 100
              }
            }
          }
        });
      }

      // Chart 3: Tasks Completion Rate Bar Chart
      const taskCtx = document.getElementById('chart-analytics-tasks');
      if (taskCtx) {
        if (this.charts.taskStatus) this.charts.taskStatus.destroy();

        const tasks = await StorageService.get('tasks') || [];
        const statusMap = { 'todo': 0, 'in_progress': 0, 'testing': 0, 'completed': 0 };
        tasks.forEach(t => {
          if (statusMap[t.status] !== undefined) statusMap[t.status]++;
        });

        this.charts.taskStatus = new Chart(taskCtx, {
          type: 'bar',
          data: {
            labels: ['To Do', 'In Progress', 'Testing', 'Completed'],
            datasets: [{
              label: 'Task Counts',
              data: [statusMap.todo, statusMap.in_progress, statusMap.testing, statusMap.completed],
              backgroundColor: [
                'rgba(139, 92, 246, 0.65)',
                'rgba(59, 130, 246, 0.65)',
                'rgba(6, 182, 212, 0.65)',
                'rgba(16, 185, 129, 0.65)'
              ],
              borderWidth: 1,
              borderRadius: 4
            }]
          },
          options: chartOptions
        });
      }

      // Chart 4: Job Hunt Funnel Pie Chart
      const jobsCtx = document.getElementById('chart-analytics-jobs');
      if (jobsCtx) {
        if (this.charts.jobsFunnel) this.charts.jobsFunnel.destroy();

        const jobs = await StorageService.get('jobs') || [];
        const dataMap = { 'Wishlist': 0, 'Applied': 0, 'Technical Rounds': 0, 'Offers': 0, 'Rejections': 0 };

        jobs.forEach(j => {
          if (['Technical Round 1', 'Technical Round 2', 'Manager Round', 'HR Round', 'Final Round'].includes(j.status)) {
            dataMap['Technical Rounds']++;
          } else if (['Offer Received', 'Selected'].includes(j.status)) {
            dataMap['Offers']++;
          } else if (j.status === 'Rejected') {
            dataMap['Rejections']++;
          } else if (j.status === 'Wishlist' || j.status === 'Preparing') {
            dataMap['Wishlist']++;
          } else {
            dataMap['Applied']++;
          }
        });

        this.charts.jobsFunnel = new Chart(jobsCtx, {
          type: 'pie',
          data: {
            labels: Object.keys(dataMap),
            datasets: [{
              data: Object.values(dataMap),
              backgroundColor: [
                'rgba(107, 114, 128, 0.6)',
                'rgba(59, 130, 246, 0.6)',
                'rgba(139, 92, 246, 0.6)',
                'rgba(16, 185, 129, 0.6)',
                'rgba(239, 68, 68, 0.6)'
              ],
              borderColor: isDark ? '#121826' : '#ffffff',
              borderWidth: 1
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

    renderAverages: async function () {
      const sessions = await StorageService.get('study_sessions') || [];
      const tasks = await StorageService.get('tasks') || [];

      // Average Study Session length
      const completedSessions = sessions.filter(s => s.completed);
      const avgLen = completedSessions.length > 0 ? 
        completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length : 0;
      
      const avgLenEl = document.getElementById('analytics-avg-session');
      if (avgLenEl) avgLenEl.textContent = `${Math.round(avgLen)} mins`;

      // Task Completion Speed Average (Est vs Act)
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const totalEst = completedTasks.reduce((sum, t) => sum + (t.estTime || 0), 0);
      const totalAct = completedTasks.reduce((sum, t) => sum + (t.actTime || 0), 0);
      const estimationAccuracy = totalAct > 0 ? Math.round((totalEst / totalAct) * 100) : 100;

      const accuracyEl = document.getElementById('analytics-est-accuracy');
      if (accuracyEl) accuracyEl.textContent = `${estimationAccuracy}%`;
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

    getRoadmapPercentage: async function () {
      const roadmap = await StorageService.get('roadmap') || {};
      const keys = Object.keys(roadmap);
      if (keys.length === 0) return 0;
      const completed = keys.filter(k => roadmap[k] === true).length;
      return (completed / keys.length) * 100;
    }
  };

  window.AnalyticsModule = AnalyticsModule;
})();
