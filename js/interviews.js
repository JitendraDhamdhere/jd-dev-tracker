/* Interviews JS - Interview schedules, logs, questions met, and feedback reports */

(function () {
  const InterviewsModule = {
    init: async function () {
      this.initEventListeners();
      this.render();
    },

    render: async function () {
      this.renderInterviews();
    },

    initEventListeners: async function () {
      // Add Interview Trigger
      const addBtn = document.getElementById('btn-add-interview');
      if (addBtn) {
        addBtn.addEventListener('click', async () => {
          this.resetInterviewForm();
          document.getElementById('modal-interview-title').textContent = 'Schedule Interview Round';
          App.openModal('modal-interview-editor');
        });
      }

      // Save Interview Form
      const form = document.getElementById('interview-editor-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          this.saveInterview();
        });
      }
    },

    renderInterviews: async function () {
      const container = document.getElementById('interviews-list-container');
      if (!container) return;

      const interviews = await StorageService.get('interviews') || [];

      if (interviews.length === 0) {
        container.innerHTML = '<div class="text-muted text-center py-4">No interviews scheduled yet. Log upcoming sessions to track progress!</div>';
        return;
      }

      // Sort chronological: upcoming first, then past
      interviews.sort((a, b) => new Date(b.date) - new Date(a.date));

      container.innerHTML = interviews.map(i => {
        const isScheduled = i.status === 'Scheduled';
        const isPassed = i.result === 'Passed';
        const isFailed = i.result === 'Failed';
        
        let resultBadgeClass = 'badge-medium';
        if (isPassed) resultBadgeClass = 'badge-low'; // Green
        if (isFailed) resultBadgeClass = 'badge-high'; // Red

        return `
          <div class="interview-card glass-card" id="${i.id}">
            <div class="interview-card-header">
              <div>
                <h4 class="interview-company">${i.company}</h4>
                <div class="interview-role">${i.position} &bull; <span class="text-muted" style="font-size:11px;">${i.round}</span></div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                <span class="badge ${isScheduled ? 'badge-medium' : 'badge-low'}">${i.status}</span>
                ${i.result && i.result !== 'Pending' ? `<span class="badge ${resultBadgeClass}">${i.result}</span>` : ''}
              </div>
            </div>

            <div class="interview-details-grid">
              <div>
                <div class="detail-label">Schedule</div>
                <div class="detail-val"><i class="far fa-calendar-alt"></i> ${Utils.formatDate(i.date)} at ${i.time || 'TBD'}</div>
              </div>
              <div>
                <div class="detail-label">Interviewer</div>
                <div class="detail-val"><i class="far fa-user"></i> ${i.interviewer || 'TBD'}</div>
              </div>
            </div>

            <div class="interview-qa-section">
              <h5 class="qa-section-title">Topics & Questions Asked</h5>
              
              <div class="qa-block">
                <strong><i class="fas fa-code text-primary"></i> Coding/DSA:</strong>
                <div class="qa-text">${i.questionsAsked?.coding || 'No coding questions logged.'}</div>
              </div>
              
              <div class="qa-block">
                <strong><i class="fas fa-sitemap text-secondary"></i> System Design:</strong>
                <div class="qa-text">${i.questionsAsked?.sysDesign || 'No system design questions logged.'}</div>
              </div>
              
              <div class="qa-block">
                <strong><i class="fas fa-comments text-info"></i> HR/Behavioral:</strong>
                <div class="qa-text">${i.questionsAsked?.hr || 'No HR questions logged.'}</div>
              </div>
            </div>

            ${i.feedback ? `
              <div class="interview-feedback-note">
                <strong>Feedback/Outcome Note:</strong>
                <p>${i.feedback}</p>
              </div>
            ` : ''}

            <div class="interview-actions-row">
              <div style="display:flex; gap:8px;">
                ${i.offer ? `<span class="badge badge-low" style="background-color:rgba(16, 185, 129, 0.15); color:var(--success);"><i class="fas fa-gift"></i> Offer Received</span>` : ''}
              </div>
              <div style="display:flex; gap:6px;">
                <button onclick="InterviewsModule.editInterviewPrompt('${i.id}')" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="InterviewsModule.deleteInterview('${i.id}')" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    resetInterviewForm: async function () {
      const form = document.getElementById('interview-editor-form');
      if (form) form.reset();
      document.getElementById('interview-id').value = '';
      
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('interview-date').value = today;
    },

    saveInterview: async function () {
      const id = document.getElementById('interview-id').value;
      const company = document.getElementById('interview-company').value;
      const position = document.getElementById('interview-role').value;
      const date = document.getElementById('interview-date').value;
      const time = document.getElementById('interview-time').value;
      const round = document.getElementById('interview-round').value;
      const interviewer = document.getElementById('interview-interviewer').value;
      const coding = document.getElementById('interview-q-coding').value;
      const sysDesign = document.getElementById('interview-q-system').value;
      const hr = document.getElementById('interview-q-hr').value;
      const feedback = document.getElementById('interview-feedback').value;
      const status = document.getElementById('interview-status').value;
      const result = document.getElementById('interview-result').value;
      const offer = document.getElementById('interview-offer').checked;

      const interviews = await StorageService.get('interviews') || [];

      const questionsAsked = { coding, sysDesign, hr };

      if (id) {
        // Edit Mode
        const idx = interviews.findIndex(i => i.id === id);
        if (idx !== -1) {
          interviews[idx] = { id, company, position, date, time, round, interviewer, questionsAsked, feedback, status, result, offer };
          Utils.showToast('Interview Updated', 'Logs successfully updated.', 'success');
        }
      } else {
        // Create Mode
        const newInt = {
          id: Utils.generateId(),
          company, position, date, time, round, interviewer, questionsAsked, feedback, status, result, offer
        };
        interviews.push(newInt);
        Utils.showToast('Interview Logged', 'Round added to schedule list.', 'success');
      }

      await StorageService.set('interviews', interviews);
      App.closeModal('modal-interview-editor');
      this.render();

      if (window.DashboardModule) window.DashboardModule.render();
    },

    editInterviewPrompt: async function (id) {
      const interviews = await StorageService.get('interviews') || [];
      const i = interviews.find(i => i.id === id);
      if (!i) return;

      document.getElementById('interview-id').value = i.id;
      document.getElementById('interview-company').value = i.company;
      document.getElementById('interview-role').value = i.position;
      document.getElementById('interview-date').value = i.date;
      document.getElementById('interview-time').value = i.time || '';
      document.getElementById('interview-round').value = i.round;
      document.getElementById('interview-interviewer').value = i.interviewer || '';
      document.getElementById('interview-q-coding').value = i.questionsAsked?.coding || '';
      document.getElementById('interview-q-system').value = i.questionsAsked?.sysDesign || '';
      document.getElementById('interview-q-hr').value = i.questionsAsked?.hr || '';
      document.getElementById('interview-feedback').value = i.feedback || '';
      document.getElementById('interview-status').value = i.status;
      document.getElementById('interview-result').value = i.result;
      document.getElementById('interview-offer').checked = i.offer || false;

      document.getElementById('modal-interview-title').textContent = 'Edit Interview Round';
      App.openModal('modal-interview-editor');
    },

    deleteInterview: async function (id) {
      if (!confirm('Are you sure you want to delete this interview record?')) return;

      const interviews = await StorageService.get('interviews') || [];
      const filtered = interviews.filter(i => i.id !== id);

      await StorageService.set('interviews', filtered);
      Utils.showToast('Interview Deleted', 'Record removed from log.', 'warning');
      this.render();

      if (window.DashboardModule) window.DashboardModule.render();
    }
  };

  // Inject Interviews specific styling rules dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .interviews-grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
    }
    .interview-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .interview-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 12px;
    }
    .interview-company {
      font-family: var(--font-heading);
      font-size: 17px;
      font-weight: 700;
    }
    .interview-role {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
      margin-top: 2px;
    }
    .interview-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 12px;
    }
    .detail-label {
      color: var(--text-muted);
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .detail-val {
      color: var(--text-primary);
      font-weight: 500;
    }
    .interview-qa-section {
      background-color: rgba(0,0,0,0.15);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .qa-section-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 6px;
      margin-bottom: 2px;
    }
    .qa-block {
      font-size: 11px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .qa-text {
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .interview-feedback-note {
      font-size: 11px;
      border-left: 2px solid var(--primary);
      padding-left: 10px;
      color: var(--text-secondary);
    }
    .interview-feedback-note p {
      margin-top: 4px;
      line-height: 1.4;
    }
    .interview-actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      border-top: 1px solid var(--border-light);
      padding-top: 12px;
    }
  `;
  document.head.appendChild(style);

  window.InterviewsModule = InterviewsModule;
})();
