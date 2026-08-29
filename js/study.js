/* Study JS - Handles Study Sessions log and Pomodoro Timer engine */

(function () {
  const StudyModule = {
    // Pomodoro Timer state
    timerInterval: null,
    timerSeconds: 25 * 60,
    timerMode: 'work', // 'work' or 'break'
    timerRunning: false,
    customWorkMin: 25,
    customBreakMin: 5,

    init: async function () {
      this.initEventListeners();
      this.render();
    },

    render: async function () {
      this.renderSessionsList();
      this.renderStats();
      this.updateTimerDisplay();
    },

    initEventListeners: async function () {
      // Pomodoro controls
      const startBtn = document.getElementById('pomo-start');
      const pauseBtn = document.getElementById('pomo-pause');
      const resetBtn = document.getElementById('pomo-reset');
      
      const workTab = document.getElementById('pomo-mode-work');
      const breakTab = document.getElementById('pomo-mode-break');
      
      const customApply = document.getElementById('pomo-custom-apply');

      if (startBtn) startBtn.addEventListener('click', async () => this.startTimer());
      if (pauseBtn) pauseBtn.addEventListener('click', async () => this.pauseTimer());
      if (resetBtn) resetBtn.addEventListener('click', async () => this.resetTimer());

      if (workTab) {
        workTab.addEventListener('click', async () => {
          this.setTimerMode('work');
          workTab.classList.add('active-tab');
          if (breakTab) breakTab.classList.remove('active-tab');
        });
      }
      if (breakTab) {
        breakTab.addEventListener('click', async () => {
          this.setTimerMode('break');
          breakTab.classList.add('active-tab');
          if (workTab) workTab.classList.remove('active-tab');
        });
      }

      if (customApply) {
        customApply.addEventListener('click', async () => {
          const wMin = parseInt(document.getElementById('pomo-custom-work').value) || 25;
          const bMin = parseInt(document.getElementById('pomo-custom-break').value) || 5;
          this.customWorkMin = wMin;
          this.customBreakMin = bMin;
          this.setTimerMode(this.timerMode);
          Utils.showToast('Timer Updated', `Custom timer configured: ${wMin}m work / ${bMin}m break.`, 'info');
        });
      }

      // Session Modal Add Trigger
      const addSessionBtn = document.getElementById('btn-add-study-session');
      if (addSessionBtn) {
        addSessionBtn.addEventListener('click', async () => {
          this.resetSessionForm();
          document.getElementById('modal-session-title').textContent = 'Add Study Session';
          App.openModal('modal-study-session');
        });
      }

      // Session Save Form Submit
      const sessionForm = document.getElementById('study-session-form');
      if (sessionForm) {
        sessionForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          this.saveSession();
        });
      }
    },

    // Timer Logic
    startTimer: async function () {
      if (this.timerRunning) return;
      this.timerRunning = true;
      
      // Update UI buttons
      document.getElementById('pomo-start').style.display = 'none';
      document.getElementById('pomo-pause').style.display = 'inline-flex';

      // Request desktop notifications permissions proactively
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      this.timerInterval = setInterval(() => {
        this.timerSeconds--;
        this.updateTimerDisplay();

        if (this.timerSeconds <= 0) {
          this.timerFinished();
        }
      }, 1000);
    },

    pauseTimer: async function () {
      if (!this.timerRunning) return;
      this.timerRunning = false;
      clearInterval(this.timerInterval);
      
      document.getElementById('pomo-start').style.display = 'inline-flex';
      document.getElementById('pomo-pause').style.display = 'none';
    },

    resetTimer: async function () {
      this.pauseTimer();
      this.setTimerMode(this.timerMode);
    },

    setTimerMode: async function (mode) {
      this.timerMode = mode;
      this.timerSeconds = (mode === 'work' ? this.customWorkMin : this.customBreakMin) * 60;
      this.updateTimerDisplay();
    },

    updateTimerDisplay: async function () {
      const minutes = Math.floor(this.timerSeconds / 60);
      const seconds = this.timerSeconds % 60;
      const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      const timerValEl = document.getElementById('pomo-time-display');
      if (timerValEl) {
        timerValEl.textContent = timeStr;
      }

      // Update Browser Document Title
      document.title = `[${timeStr}] DevTrack Pro`;
    },

    timerFinished: async function () {
      this.pauseTimer();
      
      const isWork = this.timerMode === 'work';
      Utils.playChime(isWork ? 'alarm' : 'break');

      const title = isWork ? 'Focus Work Finished!' : 'Break Time Finished!';
      const msg = isWork ? 'Take a well-deserved break.' : 'Time to get back to writing clean code.';
      
      Utils.showToast(title, msg, isWork ? 'success' : 'info');

      // Send System Notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(title, { body: msg, icon: 'assets/icons/favicon.png' });
      }

      // If work ended, auto pop session logger or append study tracker progress
      if (isWork) {
        // Increment study stats or auto load Study dialog with duration pre-filled
        document.getElementById('session-duration').value = this.customWorkMin;
        document.getElementById('session-topic').value = 'Focused Pomodoro Session';
        document.getElementById('session-desc').value = 'Automated log from Pomodoro timer.';
        document.getElementById('modal-session-title').textContent = 'Log Pomodoro Session';
        App.openModal('modal-study-session');
      }

      // Auto switch timer mode
      this.setTimerMode(isWork ? 'break' : 'work');
      
      // Update UI active labels
      const workTab = document.getElementById('pomo-mode-work');
      const breakTab = document.getElementById('pomo-mode-break');
      if (workTab && breakTab) {
        if (this.timerMode === 'work') {
          workTab.classList.add('active-tab');
          breakTab.classList.remove('active-tab');
        } else {
          breakTab.classList.add('active-tab');
          workTab.classList.remove('active-tab');
        }
      }
    },

    // Session CRUD Logic
    renderSessionsList: async function () {
      const listContainer = document.getElementById('study-history-list');
      if (!listContainer) return;

      const sessions = await StorageService.get('study_sessions') || [];
      // Sort sessions descending by date
      sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (sessions.length === 0) {
        listContainer.innerHTML = '<div class="text-muted text-center py-4">No study sessions logged. Start logging sessions above!</div>';
        return;
      }

      listContainer.innerHTML = sessions.map(s => `
        <div class="session-item" id="${s.id}">
          <div class="session-header-details">
            <span class="badge ${s.completed ? 'badge-low' : 'badge-high'}">${s.category}</span>
            <span class="session-difficulty text-muted">${s.difficulty}</span>
          </div>
          <h4 class="session-topic">${s.topic}</h4>
          <p class="session-desc">${s.description || 'No description provided.'}</p>
          <div class="session-footer-details">
            <span class="session-time"><i class="far fa-calendar"></i> ${Utils.formatDate(s.date)} (${s.startTime || '--:--'})</span>
            <span class="session-duration"><i class="far fa-clock"></i> ${s.duration} mins</span>
          </div>
          <div class="session-actions-wrapper">
            <button onclick="StudyModule.editSessionPrompt('${s.id}')" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></button>
            <button onclick="StudyModule.deleteSession('${s.id}')" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      `).join('');
    },

    renderStats: async function () {
      const sessions = await StorageService.get('study_sessions') || [];
      const totalHrs = sessions.filter(s => s.completed).reduce((acc, curr) => acc + (curr.duration / 60), 0);
      const totalSessions = sessions.length;

      const statsHrsEl = document.getElementById('study-stats-hours');
      if (statsHrsEl) statsHrsEl.textContent = `${totalHrs.toFixed(1)}h`;

      const statsCountEl = document.getElementById('study-stats-count');
      if (statsCountEl) statsCountEl.textContent = totalSessions;
    },

    resetSessionForm: async function () {
      const form = document.getElementById('study-session-form');
      if (form) form.reset();
      document.getElementById('session-id').value = '';
      
      // Default to current date and time
      const now = new Date();
      document.getElementById('session-date').value = now.toISOString().split('T')[0];
      document.getElementById('session-time').value = now.toTimeString().split(' ')[0].substring(0, 5);
    },

    saveSession: async function () {
      const id = document.getElementById('session-id').value;
      const topic = document.getElementById('session-topic').value;
      const duration = parseInt(document.getElementById('session-duration').value) || 0;
      const category = document.getElementById('session-category').value;
      const difficulty = document.getElementById('session-difficulty').value;
      const priority = document.getElementById('session-priority').value;
      const date = document.getElementById('session-date').value;
      const startTime = document.getElementById('session-time').value;
      const description = document.getElementById('session-desc').value;
      const completed = document.getElementById('session-completed').checked;

      const sessions = await StorageService.get('study_sessions') || [];

      if (id) {
        // Edit Mode
        const idx = sessions.findIndex(s => s.id === id);
        if (idx !== -1) {
          sessions[idx] = { id, topic, duration, category, difficulty, priority, date, startTime, description, completed };
          Utils.showToast('Session Updated', 'Study session updated successfully.', 'success');
        }
      } else {
        // Create Mode
        const newSession = {
          id: Utils.generateId(),
          topic, duration, category, difficulty, priority, date, startTime, description, completed
        };
        sessions.push(newSession);
        Utils.showToast('Session Added', 'Study session logged successfully.', 'success');
      }

      await StorageService.set('study_sessions', sessions);
      App.closeModal('modal-study-session');
      this.render();
      
      // Refresh Dashboard if visible
      if (window.DashboardModule) window.DashboardModule.render();
    },

    editSessionPrompt: async function (id) {
      const sessions = await StorageService.get('study_sessions') || [];
      const session = sessions.find(s => s.id === id);
      if (!session) return;

      document.getElementById('session-id').value = session.id;
      document.getElementById('session-topic').value = session.topic;
      document.getElementById('session-duration').value = session.duration;
      document.getElementById('session-category').value = session.category;
      document.getElementById('session-difficulty').value = session.difficulty;
      document.getElementById('session-priority').value = session.priority;
      document.getElementById('session-date').value = session.date;
      document.getElementById('session-time').value = session.startTime || '';
      document.getElementById('session-desc').value = session.description || '';
      document.getElementById('session-completed').checked = session.completed;

      document.getElementById('modal-session-title').textContent = 'Edit Study Session';
      App.openModal('modal-study-session');
    },

    deleteSession: async function (id) {
      if (!confirm('Are you sure you want to delete this session?')) return;

      const sessions = await StorageService.get('study_sessions') || [];
      const filtered = sessions.filter(s => s.id !== id);
      
      await StorageService.set('study_sessions', filtered);
      Utils.showToast('Session Deleted', 'Study session deleted.', 'warning');
      this.render();

      if (window.DashboardModule) window.DashboardModule.render();
    }
  };

  // Inject study session styling rules dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .session-item {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
      position: relative;
      transition: all 0.2s ease;
    }
    .session-item:hover {
      border-color: rgba(255,255,255,0.15);
      transform: translateX(4px);
    }
    .session-header-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .session-topic {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .session-desc {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .session-footer-details {
      display: flex;
      gap: 16px;
      font-size: 11px;
      color: var(--text-muted);
    }
    .session-actions-wrapper {
      position: absolute;
      right: 12px;
      bottom: 12px;
      display: flex;
      gap: 6px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .session-item:hover .session-actions-wrapper {
      opacity: 1;
    }
    /* Pomodoro customization styles */
    .pomo-timer-card {
      text-align: center;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .pomo-mode-tabs {
      display: flex;
      background-color: var(--bg-tertiary);
      border-radius: 20px;
      padding: 4px;
      gap: 4px;
    }
    .pomo-tab {
      padding: 6px 16px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      color: var(--text-secondary);
    }
    .pomo-tab.active-tab {
      background-color: var(--primary);
      color: white;
    }
    .pomo-timer-value {
      font-family: var(--font-heading);
      font-size: 64px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      line-height: 1;
    }
  `;
  document.head.appendChild(style);

  window.StudyModule = StudyModule;
})();
