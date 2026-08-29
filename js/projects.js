/* Projects JS - Project Manager, repositories URLs, and inline checklists */

(function () {
  const ProjectsModule = {
    init: async function () {
      this.initEventListeners();
      this.render();
    },

    render: async function () {
      this.renderProjectsList();
    },

    initEventListeners: async function () {
      // Add Project trigger
      const addBtn = document.getElementById('btn-add-project');
      if (addBtn) {
        addBtn.addEventListener('click', async () => {
          this.resetProjectForm();
          document.getElementById('modal-project-title').textContent = 'Add Portfolio Project';
          App.openModal('modal-project-editor');
        });
      }

      // Save Project Form
      const form = document.getElementById('project-editor-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          this.saveProject();
        });
      }
    },

    renderProjectsList: async function () {
      const container = document.getElementById('projects-list-container');
      if (!container) return;

      const projects = await StorageService.get('projects') || [];

      if (projects.length === 0) {
        container.innerHTML = '<div class="text-muted text-center py-4">No projects logged yet. Showcase your work by adding one!</div>';
        return;
      }

      container.innerHTML = projects.map(p => {
        const priorityBadge = `badge-${p.priority.toLowerCase()}`;
        const hasGithub = p.github ? `<a href="${p.github}" target="_blank" class="btn btn-secondary btn-sm"><i class="fab fa-github"></i> GitHub</a>` : '';
        const hasLive = p.live ? `<a href="${p.live}" target="_blank" class="btn btn-primary btn-sm"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : '';
        
        // Checklist progress calculations
        const totalTasks = p.tasks.length;
        const doneTasks = p.tasks.filter(t => t.done).length;
        const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : p.progress;

        return `
          <div class="project-card glass-card" id="${p.id}">
            <div class="project-card-header">
              <div>
                <h4 class="project-name">${p.name}</h4>
                <div class="project-tech-tags">${p.technologies.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}</div>
              </div>
              <div class="project-badges">
                <span class="badge ${priorityBadge}">${p.priority}</span>
                <span class="badge badge-low" style="background-color:rgba(255,255,255,0.03);">${p.status}</span>
              </div>
            </div>
            
            <p class="project-desc">${p.description}</p>
            
            <div class="project-meta-row">
              <span><i class="far fa-calendar-alt"></i> Start: ${Utils.formatDate(p.startDate)}</span>
              <span><i class="far fa-calendar-check"></i> Target: ${Utils.formatDate(p.targetDate)}</span>
            </div>

            <div style="margin-bottom:18px;">
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:500; margin-bottom:6px;">
                <span>Project Progress</span>
                <span>${progress}%</span>
              </div>
              <div class="progress-bar-bg" style="height:8px;">
                <div class="progress-bar-fill" style="width: ${progress}%;"></div>
              </div>
            </div>

            <!-- Nesting Project Checklist -->
            <div class="project-checklist-section">
              <h5 class="checklist-title">Development Tasks</h5>
              <div class="project-checklist-items">
                ${p.tasks.map((task, idx) => `
                  <div class="project-task-item">
                    <input type="checkbox" ${task.done ? 'checked' : ''} onchange="ProjectsModule.toggleProjectTask('${p.id}', ${idx})">
                    <span style="${task.done ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${task.text}</span>
                  </div>
                `).join('')}
              </div>
              <div class="project-add-task-row">
                <input type="text" placeholder="Add feature task..." id="input-add-ptask-${p.id}" class="form-control" style="height:32px; font-size:11px;">
                <button type="button" onclick="ProjectsModule.addProjectTask('${p.id}')" class="btn btn-secondary btn-sm" style="padding:0 12px; height:32px;"><i class="fas fa-plus"></i></button>
              </div>
            </div>

            ${p.notes ? `
              <div style="margin-top:16px; padding:10px; background-color:rgba(0,0,0,0.15); border-radius:6px; font-size:11px; color:var(--text-secondary);">
                <strong>Notes:</strong> ${p.notes}
              </div>
            ` : ''}

            <div class="project-actions-row">
              <div class="project-links">
                ${hasGithub}
                ${hasLive}
              </div>
              <div class="project-edit-actions">
                <button onclick="ProjectsModule.editProjectPrompt('${p.id}')" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="ProjectsModule.deleteProject('${p.id}')" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    resetProjectForm: async function () {
      const form = document.getElementById('project-editor-form');
      if (form) form.reset();
      document.getElementById('project-id').value = '';
      
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('project-start').value = today;
      document.getElementById('project-target').value = today;
    },

    saveProject: async function () {
      const id = document.getElementById('project-id').value;
      const name = document.getElementById('project-name').value;
      const description = document.getElementById('project-desc').value;
      const technologies = document.getElementById('project-tech').value;
      const github = document.getElementById('project-github').value;
      const live = document.getElementById('project-live').value;
      const status = document.getElementById('project-status').value;
      const progress = parseInt(document.getElementById('project-progress').value) || 0;
      const startDate = document.getElementById('project-start').value;
      const targetDate = document.getElementById('project-target').value;
      const priority = document.getElementById('project-priority').value;
      const notes = document.getElementById('project-notes').value;

      const projects = await StorageService.get('projects') || [];

      if (id) {
        // Edit Mode
        const idx = projects.findIndex(p => p.id === id);
        if (idx !== -1) {
          projects[idx] = {
            ...projects[idx],
            name, description, technologies, github, live, status, progress, startDate, targetDate, priority, notes
          };
          Utils.showToast('Project Updated', 'Project parameters saved.', 'success');
        }
      } else {
        // Create Mode
        const newProj = {
          id: Utils.generateId(),
          name, description, technologies, github, live, status, progress, startDate, targetDate, priority, notes,
          tasks: []
        };
        projects.push(newProj);
        Utils.showToast('Project Created', 'Project added to portfolio logs.', 'success');
      }

      await StorageService.set('projects', projects);
      App.closeModal('modal-project-editor');
      this.render();
    },

    editProjectPrompt: async function (id) {
      const projects = await StorageService.get('projects') || [];
      const p = projects.find(p => p.id === id);
      if (!p) return;

      document.getElementById('project-id').value = p.id;
      document.getElementById('project-name').value = p.name;
      document.getElementById('project-desc').value = p.description || '';
      document.getElementById('project-tech').value = p.technologies || '';
      document.getElementById('project-github').value = p.github || '';
      document.getElementById('project-live').value = p.live || '';
      document.getElementById('project-status').value = p.status;
      document.getElementById('project-progress').value = p.progress;
      document.getElementById('project-start').value = p.startDate;
      document.getElementById('project-target').value = p.targetDate;
      document.getElementById('project-priority').value = p.priority;
      document.getElementById('project-notes').value = p.notes || '';

      document.getElementById('modal-project-title').textContent = 'Edit Portfolio Project';
      App.openModal('modal-project-editor');
    },

    deleteProject: async function (id) {
      if (!confirm('Are you sure you want to delete this project?')) return;

      const projects = await StorageService.get('projects') || [];
      const filtered = projects.filter(p => p.id !== id);

      await StorageService.set('projects', filtered);
      Utils.showToast('Project Deleted', 'Project permanently deleted.', 'warning');
      this.render();
    },

    // Inline checklist tasks operations
    toggleProjectTask: async function (projId, taskIdx) {
      const projects = await StorageService.get('projects') || [];
      const pIdx = projects.findIndex(p => p.id === projId);
      if (pIdx === -1) return;

      projects[pIdx].tasks[taskIdx].done = !projects[pIdx].tasks[taskIdx].done;
      
      // Update overall progress percentage
      const total = projects[pIdx].tasks.length;
      const done = projects[pIdx].tasks.filter(t => t.done).length;
      projects[pIdx].progress = Math.round((done / total) * 100);

      await StorageService.set('projects', projects);
      this.render();
      Utils.showToast('Task Status Saved', '', 'success');
    },

    addProjectTask: async function (projId) {
      const input = document.getElementById(`input-add-ptask-${projId}`);
      const text = input?.value.trim();
      if (!text) return;

      const projects = await StorageService.get('projects') || [];
      const pIdx = projects.findIndex(p => p.id === projId);
      if (pIdx === -1) return;

      projects[pIdx].tasks.push({ text, done: false });
      
      // Update overall progress
      const total = projects[pIdx].tasks.length;
      const done = projects[pIdx].tasks.filter(t => t.done).length;
      projects[pIdx].progress = Math.round((done / total) * 100);

      await StorageService.set('projects', projects);
      input.value = '';
      this.render();
      Utils.showToast('Task Added', '', 'success');
    }
  };

  // Inject Project specific styles dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .projects-grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
    }
    .project-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .project-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .project-name {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .project-tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }
    .tech-tag {
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--text-secondary);
    }
    .project-desc {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 16px;
      flex-grow: 1;
    }
    .project-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 14px;
    }
    /* Project Checklist styles */
    .project-checklist-section {
      background-color: rgba(0,0,0,0.1);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }
    .checklist-title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-primary);
    }
    .project-checklist-items {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
      max-height: 120px;
      overflow-y: auto;
    }
    .project-task-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
    }
    .project-task-item input[type="checkbox"] {
      cursor: pointer;
    }
    .project-add-task-row {
      display: flex;
      gap: 6px;
    }
    .project-actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid var(--border-light);
    }
    .project-links, .project-edit-actions {
      display: flex;
      gap: 6px;
    }
  `;
  document.head.appendChild(style);

  window.ProjectsModule = ProjectsModule;
})();
