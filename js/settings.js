/* Settings JS - Configuration, profile details, backups, resume version manager, certifications log, habits checklist, and daily reflections */

(function () {
  const SettingsModule = {
    init: async function () {
      this.initEventListeners();
      this.render();
    },

    render: async function () {
      this.renderProfileSettings();
      this.renderResumes();
      this.renderCertifications();
      this.renderHabits();
      this.renderDailyPlanner();
    },

    initEventListeners: async function () {


      // Profile form submission
      const profileForm = document.getElementById('profile-settings-form');
      if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          this.saveProfile();
        });
      }

      // Backup controls
      const btnExport = document.getElementById('btn-export-backup');
      const inputImport = document.getElementById('input-import-backup');
      const btnReset = document.getElementById('btn-reset-dashboard');

      if (btnExport) btnExport.addEventListener('click', async () => this.exportBackup());
      if (inputImport) inputImport.addEventListener('change', async (e) => this.importBackup(e));
      if (btnReset) btnReset.addEventListener('click', async () => this.resetDashboard());


      // Resume Editor triggers
      const addResumeBtn = document.getElementById('btn-add-resume');
      if (addResumeBtn) {
        addResumeBtn.addEventListener('click', async () => {
          this.resetResumeForm();
          document.getElementById('modal-resume-title').textContent = 'Add Resume Version';
          App.openModal('modal-resume-editor');
        });
      }
      const resumeForm = document.getElementById('resume-editor-form');
      if (resumeForm) {
        resumeForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          this.saveResume();
        });
      }

      // Certifications Editor triggers
      const addCertBtn = document.getElementById('btn-add-cert');
      if (addCertBtn) {
        addCertBtn.addEventListener('click', async () => {
          this.resetCertForm();
          document.getElementById('modal-cert-title').textContent = 'Add Certification';
          App.openModal('modal-cert-editor');
        });
      }
      const certForm = document.getElementById('cert-editor-form');
      if (certForm) {
        certForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          this.saveCert();
        });
      }

      // Daily Planner save trigger
      const savePlannerBtn = document.getElementById('btn-save-daily-planner');
      if (savePlannerBtn) {
        savePlannerBtn.addEventListener('click', async () => this.saveDailyPlanner());
      }
    },

    // 1. Profile Settings
    renderProfileSettings: async function () {
      const profile = await StorageService.get('profile') || {};
      
      const inputName = document.getElementById('set-profile-name');
      const inputRole = document.getElementById('set-profile-role');
      const inputHours = document.getElementById('set-profile-hours');
      const inputGithub = document.getElementById('set-profile-github');

      if (inputName) inputName.value = profile.name || '';
      if (inputRole) inputRole.value = profile.role || '';
      if (inputHours) inputHours.value = profile.dailyTargetHours || 4;
      if (inputGithub) inputGithub.value = profile.githubGoal || 3;
    },

    saveProfile: async function () {
      const name = document.getElementById('set-profile-name').value;
      const role = document.getElementById('set-profile-role').value;
      const dailyTargetHours = parseFloat(document.getElementById('set-profile-hours').value) || 4;
      const githubGoal = parseInt(document.getElementById('set-profile-github').value) || 3;

      const profile = await StorageService.get('profile') || {};
      
      profile.name = name;
      profile.role = role;
      profile.dailyTargetHours = dailyTargetHours;
      profile.githubGoal = githubGoal;
      profile.avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      await StorageService.set('profile', profile);
      Utils.showToast('Profile Saved', 'Personal settings updated successfully.', 'success');

      // Update global header & footer UI
      App.initProfileFooter();
      if (window.DashboardModule) window.DashboardModule.render();
    },

    // 2. Resume Version Manager
    renderResumes: async function () {
      const container = document.getElementById('resumes-list-container');
      if (!container) return;

      const resumes = await StorageService.get('resumes') || [];

      if (resumes.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No resumes uploaded. Add a version below!</td></tr>';
        return;
      }

      container.innerHTML = resumes.map(r => `
        <tr>
          <td><strong>${r.name}</strong></td>
          <td><span class="badge badge-low">${r.version}</span></td>
          <td>${r.targetRole}</td>
          <td>${r.targetCompany || 'Generic'}</td>
          <td><strong style="color:var(--success);">${r.atsScore}/100</strong></td>
          <td>${Utils.formatDate(r.updatedDate)}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button onclick="SettingsModule.editResumePrompt('${r.id}')" class="btn btn-secondary btn-sm" style="padding:4px 8px;"><i class="fas fa-edit"></i></button>
              <button onclick="SettingsModule.deleteResume('${r.id}')" class="btn btn-danger btn-sm" style="padding:4px 8px;"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    resetResumeForm: async function () {
      const form = document.getElementById('resume-editor-form');
      if (form) form.reset();
      document.getElementById('resume-id').value = '';
    },

    saveResume: async function () {
      const id = document.getElementById('resume-id').value;
      const name = document.getElementById('resume-name').value;
      const version = document.getElementById('resume-version').value;
      const targetRole = document.getElementById('resume-target-role').value;
      const targetCompany = document.getElementById('resume-target-company').value;
      const atsScore = parseInt(document.getElementById('resume-ats').value) || 0;
      const notes = document.getElementById('resume-notes').value;

      const resumes = await StorageService.get('resumes') || [];
      const today = new Date().toISOString().split('T')[0];

      if (id) {
        // Edit
        const idx = resumes.findIndex(r => r.id === id);
        if (idx !== -1) {
          resumes[idx] = { ...resumes[idx], name, version, targetRole, targetCompany, atsScore, notes, updatedDate: today };
          Utils.showToast('Resume Updated', '', 'success');
        }
      } else {
        // Create
        const newRes = { id: Utils.generateId(), name, version, targetRole, targetCompany, atsScore, notes, createdDate: today, updatedDate: today };
        resumes.push(newRes);
        Utils.showToast('Resume Logged', '', 'success');
      }

      await StorageService.set('resumes', resumes);
      App.closeModal('modal-resume-editor');
      this.renderResumes();
      if (window.DashboardModule) window.DashboardModule.render();
    },

    editResumePrompt: async function (id) {
      const resumes = await StorageService.get('resumes') || [];
      const r = resumes.find(r => r.id === id);
      if (!r) return;

      document.getElementById('resume-id').value = r.id;
      document.getElementById('resume-name').value = r.name;
      document.getElementById('resume-version').value = r.version;
      document.getElementById('resume-target-role').value = r.targetRole;
      document.getElementById('resume-target-company').value = r.targetCompany || '';
      document.getElementById('resume-ats').value = r.atsScore;
      document.getElementById('resume-notes').value = r.notes || '';

      document.getElementById('modal-resume-title').textContent = 'Edit Resume Version';
      App.openModal('modal-resume-editor');
    },

    deleteResume: async function (id) {
      if (!confirm('Are you sure you want to delete this resume version?')) return;

      const resumes = await StorageService.get('resumes') || [];
      const filtered = resumes.filter(r => r.id !== id);

      await StorageService.set('resumes', filtered);
      Utils.showToast('Resume Deleted', '', 'warning');
      this.renderResumes();
      if (window.DashboardModule) window.DashboardModule.render();
    },

    // 3. Certifications Log
    renderCertifications: async function () {
      const container = document.getElementById('certs-list-container');
      if (!container) return;

      const certs = await StorageService.get('certifications') || [];

      if (certs.length === 0) {
        container.innerHTML = '<div class="text-muted text-center py-4">No certifications logged. Set goals and claim your trophies!</div>';
        return;
      }

      container.innerHTML = certs.map(c => `
        <div class="cert-card glass-card" id="${c.id}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <h4 style="font-family:var(--font-heading); font-size:15px; font-weight:700;">${c.name}</h4>
              <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">Provided by <strong>${c.provider}</strong></div>
            </div>
            <span class="badge badge-low">${c.status}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:11px; color:var(--text-secondary); margin-bottom:14px;">
            <span>Credential ID: <strong>${c.credentialId || 'N/A'}</strong></span>
            <span>Issued: <strong>${Utils.formatDate(c.issueDate)}</strong> ${c.expiryDate ? `&bull; Expires: <strong>${Utils.formatDate(c.expiryDate)}</strong>` : '&bull; No expiry'}</span>
            <span>Skills tested: <em>${c.skills}</em></span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); padding-top:12px; margin-top:auto;">
            ${c.verificationLink ? `<a href="${c.verificationLink}" target="_blank" class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:10px;"><i class="fas fa-external-link-alt"></i> Verify</a>` : '<div></div>'}
            <div style="display:flex; gap:6px;">
              <button onclick="SettingsModule.editCertPrompt('${c.id}')" class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:10px;"><i class="fas fa-edit"></i></button>
              <button onclick="SettingsModule.deleteCert('${c.id}')" class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:10px;"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
        </div>
      `).join('');
    },

    resetCertForm: async function () {
      const form = document.getElementById('cert-editor-form');
      if (form) form.reset();
      document.getElementById('cert-id').value = '';
    },

    saveCert: async function () {
      const id = document.getElementById('cert-id').value;
      const name = document.getElementById('cert-name').value;
      const provider = document.getElementById('cert-provider').value;
      const issueDate = document.getElementById('cert-issue').value;
      const expiryDate = document.getElementById('cert-expiry').value;
      const credentialId = document.getElementById('cert-cred-id').value;
      const verificationLink = document.getElementById('cert-link').value;
      const skills = document.getElementById('cert-skills').value;
      const status = document.getElementById('cert-status').value;
      const notes = document.getElementById('cert-notes').value;

      const certs = await StorageService.get('certifications') || [];

      if (id) {
        // Edit
        const idx = certs.findIndex(c => c.id === id);
        if (idx !== -1) {
          certs[idx] = { id, name, provider, issueDate, expiryDate, credentialId, verificationLink, skills, status, notes };
          Utils.showToast('Certificate Updated', '', 'success');
        }
      } else {
        // Create
        const newCert = { id: Utils.generateId(), name, provider, issueDate, expiryDate, credentialId, verificationLink, skills, status, notes };
        certs.push(newCert);
        Utils.showToast('Certificate Added', '', 'success');
      }

      await StorageService.set('certifications', certs);
      App.closeModal('modal-cert-editor');
      this.renderCertifications();
    },

    editCertPrompt: async function (id) {
      const certs = await StorageService.get('certifications') || [];
      const c = certs.find(c => c.id === id);
      if (!c) return;

      document.getElementById('cert-id').value = c.id;
      document.getElementById('cert-name').value = c.name;
      document.getElementById('cert-provider').value = c.provider;
      document.getElementById('cert-issue').value = c.issueDate;
      document.getElementById('cert-expiry').value = c.expiryDate || '';
      document.getElementById('cert-cred-id').value = c.credentialId || '';
      document.getElementById('cert-link').value = c.verificationLink || '';
      document.getElementById('cert-skills').value = c.skills || '';
      document.getElementById('cert-status').value = c.status;
      document.getElementById('cert-notes').value = c.notes || '';

      document.getElementById('modal-cert-title').textContent = 'Edit Certification';
      App.openModal('modal-cert-editor');
    },

    deleteCert: async function (id) {
      if (!confirm('Are you sure you want to delete this certificate?')) return;

      const certs = await StorageService.get('certifications') || [];
      const filtered = certs.filter(c => c.id !== id);

      await StorageService.set('certifications', filtered);
      Utils.showToast('Certificate Removed', '', 'warning');
      this.renderCertifications();
    },

    // 4. Habits Tracker
    renderHabits: async function () {
      const wrapper = document.getElementById('habits-grid-wrapper');
      if (!wrapper) return;

      const habits = await StorageService.get('habits') || {};
      const habitNames = {
        wake_up: 'Wake Up early',
        workout: 'Workout / Gym',
        study: 'Study Sessions',
        reading: 'Reading Technicals',
        coding: 'Daily Coding',
        dsa: 'DSA Problems Solved',
        water: 'Water Intake (3L)',
        sleep: '8h Deep Sleep',
        meditation: 'Mindfulness / Meditation'
      };

      // Past 7 dates
      const dates = [];
      const now = Date.now();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000);
        dates.push(d.toISOString().split('T')[0]);
      }

      // Draw table columns headers
      let html = `<table class="habits-table"><thead><tr><th>Habits Goal</th>`;
      dates.forEach(d => {
        const dayLabel = new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        html += `<th>${dayLabel}</th>`;
      });
      html += `</tr></thead><tbody>`;

      Object.keys(habitNames).forEach(key => {
        html += `<tr><td><strong>${habitNames[key]}</strong></td>`;
        
        dates.forEach(dStr => {
          const checked = (habits[dStr] && habits[dStr][key]) ? 'checked' : '';
          html += `
            <td class="text-center">
              <input type="checkbox" ${checked} onchange="SettingsModule.toggleHabit('${dStr}', '${key}')">
            </td>
          `;
        });
        
        html += '</tr>';
      });

      html += '</tbody></table>';
      wrapper.innerHTML = html;
    },

    toggleHabit: async function (dateStr, habitKey) {
      const habits = await StorageService.get('habits') || {};
      if (!habits[dateStr]) habits[dateStr] = {};
      
      habits[dateStr][habitKey] = !habits[dateStr][habitKey];
      
      await StorageService.set('habits', habits);
      this.renderHabits();
      Utils.showToast('Habits Updated', '', 'success');
    },

    // 5. Daily Reflections / Planner
    renderDailyPlanner: async function () {
      const planner = await StorageService.get('daily_planner') || {};
      
      const morn = document.getElementById('plan-morning');
      const todayPlan = document.getElementById('plan-today');
      const eve = document.getElementById('plan-evening');
      const tomorrowPlan = document.getElementById('plan-tomorrow');
      const winsPlan = document.getElementById('plan-wins');
      const mistakesPlan = document.getElementById('plan-mistakes');
      const improvementsPlan = document.getElementById('plan-improvements');

      if (morn) morn.value = planner.morningGoals || '';
      if (todayPlan) todayPlan.value = planner.todayGoals || '';
      if (eve) eve.value = planner.eveningReview || '';
      if (tomorrowPlan) tomorrowPlan.value = planner.tomorrowPlan || '';
      if (winsPlan) winsPlan.value = planner.wins || '';
      if (mistakesPlan) mistakesPlan.value = planner.mistakes || '';
      if (improvementsPlan) improvementsPlan.value = planner.improvements || '';
    },

    saveDailyPlanner: async function () {
      const planner = {
        date: new Date().toISOString().split('T')[0],
        morningGoals: document.getElementById('plan-morning').value,
        todayGoals: document.getElementById('plan-today').value,
        eveningReview: document.getElementById('plan-evening').value,
        tomorrowPlan: document.getElementById('plan-tomorrow').value,
        wins: document.getElementById('plan-wins').value,
        mistakes: document.getElementById('plan-mistakes').value,
        improvements: document.getElementById('plan-improvements').value
      };

      await StorageService.set('daily_planner', planner);
      Utils.showToast('Reflections Saved', 'Daily planner updated successfully.', 'success');
    },

    // 6. Backups Export/Import/Reset
    exportBackup: async function () {
      const dump = await StorageService.exportData();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(dump);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "devtrack_pro_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      Utils.showToast('Backup Completed', 'Settings export saved successfully.', 'success');
    },

    importBackup: async function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const success = await StorageService.importData(event.target.result);
        if (success) {
          Utils.showToast('Restore Completed', 'Reloading DevTrack dashboard...', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          Utils.showToast('Restore Failed', 'Failed to parse JSON file.', 'danger');
        }
      };
      reader.readAsText(file);
    },

    resetDashboard: async function () {
      if (!confirm('Are you sure you want to completely RESET all dashboard statistics and data? This will permanently wipe all your custom records and return the application to a clean, empty state.')) return;

      await StorageService.resetAll();
      Utils.showToast('Dashboard Resetting', 'Clearing all custom data...', 'warning');
      setTimeout(() => window.location.reload(), 1500);
    },


  };

  // Inject settings/habits table styling rules dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .habits-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 13px;
    }
    .habits-table th, .habits-table td {
      border: 1px solid var(--border-color);
      padding: 12px;
      text-align: left;
    }
    .habits-table th {
      background-color: var(--bg-tertiary);
      font-family: var(--font-heading);
      font-weight: 700;
    }
    .habits-table tr:hover {
      background-color: rgba(255,255,255,0.01);
    }
    .text-center {
      text-align: center !important;
    }
    .habits-table input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .cert-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .cert-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    /* Settings layout tabs */
    .settings-grid-cols {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 32px;
    }
    @media screen and (max-width: 768px) {
      .settings-grid-cols {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);

  window.SettingsModule = SettingsModule;
})();
