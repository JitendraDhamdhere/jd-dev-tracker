/* Jobs JS - ATS-style Job Application Tracker & Career KPI dashboard */

(function () {
  const JobsModule = {
    init: async function () {
      this.initEventListeners();
      this.render();
    },

    render: async function () {
      this.renderKpis();
      this.renderJobsGrid();
    },

    initEventListeners: async function () {
      // Add Job Application Button
      const addBtn = document.getElementById('btn-add-job');
      if (addBtn) {
        addBtn.addEventListener('click', async () => {
          this.resetJobForm();
          document.getElementById('modal-job-title').textContent = 'Add Job Application';
          App.openModal('modal-job-editor');
        });
      }

      // Save Job Form
      const form = document.getElementById('job-editor-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          this.saveJob();
        });
      }

      // Grid filters
      const searchBox = document.getElementById('job-search');
      const filterStatus = document.getElementById('job-filter-status');
      const filterPrio = document.getElementById('job-filter-priority');

      if (searchBox) searchBox.addEventListener('input', async () => this.renderJobsGrid());
      if (filterStatus) filterStatus.addEventListener('change', async () => this.renderJobsGrid());
      if (filterPrio) filterPrio.addEventListener('change', async () => this.renderJobsGrid());
    },

    renderKpis: async function () {
      const jobs = await StorageService.get('jobs') || [];

      const sentCount = jobs.filter(j => j.status !== 'Wishlist' && j.status !== 'Preparing').length;
      
      const interviewCount = jobs.filter(j => 
        ['Technical Round 1', 'Technical Round 2', 'Manager Round', 'HR Round', 'Final Round'].includes(j.status)
      ).length;

      const offerCount = jobs.filter(j => 
        ['Offer Received', 'Selected'].includes(j.status)
      ).length;

      const rejectCount = jobs.filter(j => j.status === 'Rejected').length;

      // Success Rate = (Offers / Applications Sent) * 100
      const successRate = sentCount > 0 ? Math.round((offerCount / sentCount) * 100) : 0;

      // Update UI elements
      const kpiSent = document.getElementById('job-kpi-sent');
      if (kpiSent) kpiSent.textContent = sentCount;

      const kpiInterviews = document.getElementById('job-kpi-interviews');
      if (kpiInterviews) kpiInterviews.textContent = interviewCount;

      const kpiOffers = document.getElementById('job-kpi-offers');
      if (kpiOffers) kpiOffers.textContent = offerCount;

      const kpiRejections = document.getElementById('job-kpi-rejections');
      if (kpiRejections) kpiRejections.textContent = rejectCount;

      const kpiRate = document.getElementById('job-kpi-rate');
      if (kpiRate) kpiRate.textContent = `${successRate}%`;
    },

    renderJobsGrid: async function () {
      const container = document.getElementById('jobs-grid-container');
      if (!container) return;

      const jobs = await StorageService.get('jobs') || [];
      const searchQuery = document.getElementById('job-search')?.value.toLowerCase() || '';
      const statusFilter = document.getElementById('job-filter-status')?.value || 'All';
      const prioFilter = document.getElementById('job-filter-priority')?.value || 'All';

      // Filter
      const filtered = jobs.filter(j => {
        const matchesSearch = j.company.toLowerCase().includes(searchQuery) || j.role.toLowerCase().includes(searchQuery);
        const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
        const matchesPrio = prioFilter === 'All' || j.priority === prioFilter;
        return matchesSearch && matchesStatus && matchesPrio;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="text-muted text-center py-4 w-100">No applications matched. Click Add Application to log one!</div>';
        return;
      }

      container.innerHTML = filtered.map(j => {
        const priorityBadge = `badge-${j.priority.toLowerCase()}`;
        
        // Status classes mappings
        let statusClass = 'status-wishlist';
        if (['Applied', 'Assessment', 'OA'].includes(j.status)) statusClass = 'status-applied';
        if (j.status.includes('Round') || j.status.includes('Technical')) statusClass = 'status-interview';
        if (['Offer Received', 'Selected'].includes(j.status)) statusClass = 'status-offer';
        if (j.status === 'Rejected') statusClass = 'status-rejected';

        // Logo fallback
        const logoLetter = j.company.charAt(0);
        const logoHtml = j.companyLogo ? 
          `<img src="${j.companyLogo}" class="company-logo-img" alt="${j.company} Logo" onerror="this.outerHTML='<div class=company-logo-avatar>${logoLetter}</div>'">` :
          `<div class="company-logo-avatar">${logoLetter}</div>`;

        return `
          <div class="job-card glass-card" id="${j.id}">
            <div class="job-card-header">
              <div style="display:flex; gap:12px; align-items:center;">
                ${logoHtml}
                <div>
                  <h4 class="job-company-title">${j.company}</h4>
                  <div class="job-role-title">${j.role}</div>
                </div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                <span class="badge ${priorityBadge}">${j.priority}</span>
                <span class="badge badge-status ${statusClass}">${j.status}</span>
              </div>
            </div>

            <div class="job-details-list">
              <div class="job-detail-row">
                <span><i class="fas fa-money-bill-wave"></i> Salary</span>
                <strong>${j.salary || 'TBD'}</strong>
              </div>
              <div class="job-detail-row">
                <span><i class="fas fa-map-marker-alt"></i> Location</span>
                <strong>${j.location || 'Remote'} (${j.workMode || 'Remote'})</strong>
              </div>
              <div class="job-detail-row">
                <span><i class="far fa-calendar-alt"></i> Date Applied</span>
                <strong>${Utils.formatDate(j.appDate)}</strong>
              </div>
              <div class="job-detail-row">
                <span><i class="far fa-file-pdf"></i> Resume version</span>
                <strong>${j.resumeVersion || 'v1.0'}</strong>
              </div>
            </div>

            ${j.hrName ? `
              <div class="job-recruiter-box">
                <div class="recruiter-label">HR / Recruiter Contacts</div>
                <div class="recruiter-name"><i class="far fa-user"></i> ${j.hrName} ${j.hrEmail ? `(${j.hrEmail})` : ''}</div>
              </div>
            ` : ''}

            ${j.interviewDate ? `
              <div style="margin-top:12px; padding:8px; background-color:rgba(139, 92, 246, 0.08); border-radius:6px; border:1px solid rgba(139,92,246,0.15); display:flex; gap:8px; align-items:center; font-size:11px; color:#c084fc;">
                <i class="far fa-calendar-check"></i>
                <span>Interview Scheduled: <strong>${Utils.formatDate(j.interviewDate)}</strong></span>
              </div>
            ` : ''}

            <div class="job-actions-row">
              <div class="job-source text-muted">Source: ${j.source || 'LinkedIn'}</div>
              <div style="display:flex; gap:6px;">
                <button onclick="JobsModule.editJobPrompt('${j.id}')" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="JobsModule.deleteJob('${j.id}')" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    resetJobForm: async function () {
      const form = document.getElementById('job-editor-form');
      if (form) form.reset();
      document.getElementById('job-id').value = '';
      
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('job-date').value = today;
    },

    saveJob: async function () {
      const id = document.getElementById('job-id').value;
      const company = document.getElementById('job-company').value;
      const role = document.getElementById('job-role').value;
      const experience = document.getElementById('job-exp').value;
      const salary = document.getElementById('job-salary').value;
      const location = document.getElementById('job-location').value;
      const workMode = document.getElementById('job-work-mode').value;
      const source = document.getElementById('job-source').value;
      const appDate = document.getElementById('job-date').value;
      const resumeVersion = document.getElementById('job-resume').value;
      const portfolioLink = document.getElementById('job-portfolio').value;
      const hrName = document.getElementById('job-hr-name').value;
      const hrEmail = document.getElementById('job-hr-email').value;
      const linkedinUrl = document.getElementById('job-linkedin').value;
      const referral = document.getElementById('job-referral').value;
      const status = document.getElementById('job-status').value;
      const priority = document.getElementById('job-priority').value;
      const interviewDate = document.getElementById('job-interview-date').value;
      const notes = document.getElementById('job-notes').value;

      const jobs = await StorageService.get('jobs') || [];

      // Automatically construct company logo URL using Clearbit Logo API
      const companyDomain = company.toLowerCase().replace(/\s+/g, '') + '.com';
      const companyLogo = `https://logo.clearbit.com/${companyDomain}`;

      if (id) {
        // Edit Mode
        const idx = jobs.findIndex(j => j.id === id);
        if (idx !== -1) {
          jobs[idx] = {
            id, company, companyLogo, role, experience, salary, location, workMode, source, appDate,
            resumeVersion, portfolioLink, hrName, hrEmail, linkedinUrl, referral, status, priority,
            interviewDate, notes
          };
          Utils.showToast('Application Updated', 'Changes saved successfully.', 'success');
        }
      } else {
        // Create Mode
        const newJob = {
          id: Utils.generateId(),
          company, companyLogo, role, experience, salary, location, workMode, source, appDate,
          resumeVersion, portfolioLink, hrName, hrEmail, linkedinUrl, referral, status, priority,
          interviewDate, notes
        };
        jobs.push(newJob);
        Utils.showToast('Application Logged', 'Added to ATS tracker pipeline.', 'success');
      }

      await StorageService.set('jobs', jobs);
      App.closeModal('modal-job-editor');
      this.render();

      if (window.DashboardModule) window.DashboardModule.render();
    },

    editJobPrompt: async function (id) {
      const jobs = await StorageService.get('jobs') || [];
      const j = jobs.find(j => j.id === id);
      if (!j) return;

      document.getElementById('job-id').value = j.id;
      document.getElementById('job-company').value = j.company;
      document.getElementById('job-role').value = j.role;
      document.getElementById('job-exp').value = j.experience || '';
      document.getElementById('job-salary').value = j.salary || '';
      document.getElementById('job-location').value = j.location || '';
      document.getElementById('job-work-mode').value = j.workMode;
      document.getElementById('job-source').value = j.source || '';
      document.getElementById('job-date').value = j.appDate;
      document.getElementById('job-resume').value = j.resumeVersion || '';
      document.getElementById('job-portfolio').value = j.portfolioLink || '';
      document.getElementById('job-hr-name').value = j.hrName || '';
      document.getElementById('job-hr-email').value = j.hrEmail || '';
      document.getElementById('job-linkedin').value = j.linkedinUrl || '';
      document.getElementById('job-referral').value = j.referral || '';
      document.getElementById('job-status').value = j.status;
      document.getElementById('job-priority').value = j.priority;
      document.getElementById('job-interview-date').value = j.interviewDate || '';
      document.getElementById('job-notes').value = j.notes || '';

      document.getElementById('modal-job-title').textContent = 'Edit Job Application';
      App.openModal('modal-job-editor');
    },

    deleteJob: async function (id) {
      if (!confirm('Are you sure you want to delete this job application?')) return;

      const jobs = await StorageService.get('jobs') || [];
      const filtered = jobs.filter(j => j.id !== id);

      await StorageService.set('jobs', filtered);
      Utils.showToast('Application Deleted', 'Removed from ATS logs.', 'warning');
      this.render();

      if (window.DashboardModule) window.DashboardModule.render();
    }
  };

  // Inject Jobs layout custom CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .jobs-kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .jobs-grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .job-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .company-logo-img {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      object-fit: cover;
    }
    .company-logo-avatar {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 18px;
      font-family: var(--font-heading);
    }
    .job-company-title {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 700;
    }
    .job-role-title {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .job-details-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 16px 0;
      font-size: 12px;
    }
    .job-detail-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 6px;
    }
    .job-detail-row span {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .job-recruiter-box {
      background-color: rgba(0,0,0,0.12);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 11px;
      margin-bottom: 12px;
    }
    .recruiter-label {
      color: var(--text-muted);
      font-weight: 600;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-size: 9px;
    }
    .recruiter-name {
      color: var(--text-secondary);
    }
    .job-actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      border-top: 1px solid var(--border-light);
      padding-top: 12px;
    }
    .job-source {
      font-size: 11px;
    }
  `;
  document.head.appendChild(style);

  window.JobsModule = JobsModule;
})();
