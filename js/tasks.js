/* Tasks JS - Professional Kanban Board, Drag & Drop, and Calendar View */

(function () {
  const TasksModule = {
    draggedTaskId: null,
    viewMode: 'board', // 'board' or 'calendar'
    currentCalendarDate: new Date(),

    init: async function () {
      this.initEventListeners();
      this.render();
    },

    render: async function () {
      if (this.viewMode === 'board') {
        document.getElementById('tasks-board-view').style.display = 'flex';
        document.getElementById('tasks-calendar-view').style.display = 'none';
        this.renderBoard();
      } else {
        document.getElementById('tasks-board-view').style.display = 'none';
        document.getElementById('tasks-calendar-view').style.display = 'block';
        this.renderCalendar();
      }
    },

    initEventListeners: async function () {
      // Toggle Views (Board vs Calendar)
      const tabBoard = document.getElementById('task-view-board');
      const tabCalendar = document.getElementById('task-view-calendar');

      if (tabBoard && tabCalendar) {
        tabBoard.addEventListener('click', async () => {
          this.viewMode = 'board';
          tabBoard.classList.add('active-tab');
          tabCalendar.classList.remove('active-tab');
          this.render();
        });

        tabCalendar.addEventListener('click', async () => {
          this.viewMode = 'calendar';
          tabCalendar.classList.add('active-tab');
          tabBoard.classList.remove('active-tab');
          this.render();
        });
      }

      // Quick Add buttons
      const addBtns = document.querySelectorAll('.btn-quick-add-task');
      addBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
          const colStatus = btn.getAttribute('data-status');
          this.openTaskModalForCreate(colStatus);
        });
      });

      // Task modal form submission
      const taskForm = document.getElementById('task-editor-form');
      if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          this.saveTask();
        });
      }

      // Add Subtask button in modal
      const addSubtaskBtn = document.getElementById('btn-add-subtask');
      if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', async () => this.addSubtaskFromInput());
      }

      // Search & Filters
      const searchInput = document.getElementById('task-search');
      const filterPriority = document.getElementById('task-filter-priority');
      const filterCategory = document.getElementById('task-filter-category');

      if (searchInput) searchInput.addEventListener('input', async () => this.render());
      if (filterPriority) filterPriority.addEventListener('change', async () => this.render());
      if (filterCategory) filterCategory.addEventListener('change', async () => this.render());

      // Calendar Navigation
      const prevMonth = document.getElementById('cal-prev-month');
      const nextMonth = document.getElementById('cal-next-month');

      if (prevMonth && nextMonth) {
        prevMonth.addEventListener('click', async () => {
          this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
          this.renderCalendar();
        });
        nextMonth.addEventListener('click', async () => {
          this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
          this.renderCalendar();
        });
      }
    },

    // Rendering Kanban Board
    renderBoard: async function () {
      const tasks = await StorageService.get('tasks') || [];
      
      const searchQuery = document.getElementById('task-search')?.value.toLowerCase() || '';
      const priorityFilter = document.getElementById('task-filter-priority')?.value || 'All';
      const categoryFilter = document.getElementById('task-filter-category')?.value || 'All';

      // Filter tasks
      const filtered = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery) || task.description.toLowerCase().includes(searchQuery);
        const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
        const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
        return matchesSearch && matchesPriority && matchesCategory;
      });

      const columns = ['todo', 'in_progress', 'testing', 'completed'];
      
      columns.forEach(col => {
        const colList = document.getElementById(`kanban-list-${col}`);
        if (!colList) return;

        const colTasks = filtered.filter(t => t.status === col);
        
        // Update column counts
        const countBadge = document.querySelector(`.kanban-column[data-status="${col}"] .kanban-column-count`);
        if (countBadge) countBadge.textContent = colTasks.length;

        if (colTasks.length === 0) {
          colList.innerHTML = `<div class="kanban-empty-msg">No tasks here</div>`;
        } else {
          colList.innerHTML = colTasks.map(t => {
            const progress = this.calculateChecklistProgress(t);
            const prioBadge = `badge-${t.priority.toLowerCase()}`;
            const isOverdue = t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date().setHours(0,0,0,0);
            
            return `
              <div class="kanban-card" id="${t.id}" draggable="true">
                <div class="kanban-card-tags">
                  <span class="badge ${prioBadge}">${t.priority}</span>
                  <span class="badge badge-low" style="background-color:rgba(255,255,255,0.03);">${t.category}</span>
                </div>
                <div class="kanban-card-title">${t.title}</div>
                <p class="kanban-card-desc">${t.description || 'No description.'}</p>
                
                ${t.checklist.length > 0 ? `
                  <div class="kanban-progress-wrapper" style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-secondary); margin-bottom:4px;">
                      <span>Checklist</span>
                      <span>${progress}%</span>
                    </div>
                    <div class="progress-bar-bg" style="height:5px;">
                      <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                    </div>
                  </div>
                ` : ''}

                <div class="kanban-card-meta">
                  <span style="${isOverdue ? 'color:var(--danger); font-weight:600;' : ''}">
                    <i class="far fa-calendar"></i> ${t.dueDate ? Utils.formatDate(t.dueDate) : 'No due date'}
                  </span>
                  <span><i class="far fa-clock"></i> ${t.estTime || 0}h</span>
                </div>
                
                <div style="display:flex; justify-content: flex-end; gap:8px; margin-top:10px; border-top:1px solid var(--border-light); padding-top:8px;">
                  <button onclick="TasksModule.editTaskPrompt('${t.id}')" class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:10px;"><i class="fas fa-edit"></i></button>
                  <button onclick="TasksModule.deleteTask('${t.id}')" class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:10px;"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
            `;
          }).join('');
        }

        // Add Drag and Drop listeners to cards and containers
        this.bindDragEvents(colList);
      });
    },

    bindDragEvents: async function (colList) {
      const cards = colList.querySelectorAll('.kanban-card');
      cards.forEach(card => {
        card.addEventListener('dragstart', async (e) => {
          this.draggedTaskId = card.id;
          card.style.opacity = '0.5';
          e.dataTransfer.setData('text/plain', card.id);
        });

        card.addEventListener('dragend', async () => {
          card.style.opacity = '1';
          this.draggedTaskId = null;
        });
      });

      colList.addEventListener('dragover', async (e) => {
        e.preventDefault();
        colList.classList.add('dragover');
      });

      colList.addEventListener('dragleave', async () => {
        colList.classList.remove('dragover');
      });

      colList.addEventListener('drop', async (e) => {
        e.preventDefault();
        colList.classList.remove('dragover');
        const taskId = e.dataTransfer.getData('text/plain') || this.draggedTaskId;
        const colStatus = colList.closest('.kanban-column').getAttribute('data-status');
        
        if (taskId && colStatus) {
          this.updateTaskStatus(taskId, colStatus);
        }
      });
    },

    updateTaskStatus: async function (taskId, newStatus) {
      const tasks = await StorageService.get('tasks') || [];
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        tasks[idx].status = newStatus;
        
        // If completed, check off actual times
        if (newStatus === 'completed' && tasks[idx].actTime === 0) {
          tasks[idx].actTime = tasks[idx].estTime;
        }

        await StorageService.set('tasks', tasks);
        Utils.showToast('Task Updated', `Moved to ${newStatus.replace('_', ' ').toUpperCase()}`, 'info');
        this.render();
        
        // Refresh dashboard statistics
        if (window.DashboardModule) window.DashboardModule.render();
      }
    },

    // Rendering Calendar View
    renderCalendar: async function () {
      const container = document.getElementById('tasks-calendar-container');
      if (!container) return;

      const date = this.currentCalendarDate;
      const year = date.getFullYear();
      const month = date.getMonth();

      // Set month title
      const titleEl = document.getElementById('cal-month-title');
      if (titleEl) {
        titleEl.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      // First day of month
      const firstDayIdx = new Date(year, month, 1).getDay();
      // Total days in month
      const totalDays = new Date(year, month + 1, 0).getDate();
      // Total days in previous month
      const prevTotalDays = new Date(year, month, 0).getDate();

      const tasks = await StorageService.get('tasks') || [];

      let calendarGridHtml = '';

      // Render cells for previous month padding days
      for (let i = firstDayIdx - 1; i >= 0; i--) {
        const prevDay = prevTotalDays - i;
        calendarGridHtml += `<div class="calendar-day day-padding"><div class="day-num">${prevDay}</div></div>`;
      }

      // Render actual month cells
      for (let day = 1; day <= totalDays; day++) {
        const dStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Filter tasks due on this date
        const dayTasks = tasks.filter(t => t.dueDate === dStr);
        const dayTasksHtml = dayTasks.map(t => `
          <div class="calendar-task-tag badge-${t.priority.toLowerCase()}" onclick="TasksModule.editTaskPrompt('${t.id}')">
            ${t.title}
          </div>
        `).join('');

        const isToday = new Date().toISOString().split('T')[0] === dStr ? 'today' : '';

        calendarGridHtml += `
          <div class="calendar-day ${isToday}">
            <div class="day-num">${day}</div>
            <div class="calendar-tasks-list">${dayTasksHtml}</div>
          </div>
        `;
      }

      // Render total cells padding (up to 42 cells)
      const totalCells = firstDayIdx + totalDays;
      const nextMonthPadding = 42 - totalCells;
      for (let day = 1; day <= nextMonthPadding; day++) {
        calendarGridHtml += `<div class="calendar-day day-padding"><div class="day-num">${day}</div></div>`;
      }

      container.innerHTML = calendarGridHtml;
    },

    // Subtask Manager
    renderSubtasks: async function (subtasks = []) {
      const wrapper = document.getElementById('modal-subtask-list');
      if (!wrapper) return;

      if (subtasks.length === 0) {
        wrapper.innerHTML = '<div class="text-muted text-center py-2" style="font-size:12px;">No subtasks yet. Add one below!</div>';
        return;
      }

      wrapper.innerHTML = subtasks.map((st, idx) => `
        <div class="subtask-row-item">
          <input type="checkbox" ${st.done ? 'checked' : ''} onchange="TasksModule.toggleSubtaskDone(${idx})">
          <span style="${st.done ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${st.text}</span>
          <button type="button" onclick="TasksModule.deleteSubtask(${idx})" class="btn-clear-task" style="color:var(--danger); cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
        </div>
      `).join('');
    },

    tempSubtasks: [],

    toggleSubtaskDone: async function (idx) {
      this.tempSubtasks[idx].done = !this.tempSubtasks[idx].done;
      this.renderSubtasks(this.tempSubtasks);
    },

    deleteSubtask: async function (idx) {
      this.tempSubtasks.splice(idx, 1);
      this.renderSubtasks(this.tempSubtasks);
    },

    addSubtaskFromInput: async function () {
      const input = document.getElementById('new-subtask-input');
      const text = input?.value.trim();
      if (!text) return;

      this.tempSubtasks.push({ text, done: false });
      input.value = '';
      this.renderSubtasks(this.tempSubtasks);
    },

    // Task CRUD Helpers
    calculateChecklistProgress: async function (task) {
      if (task.checklist.length === 0) return 0;
      const completed = task.checklist.filter(c => c.done).length;
      return Math.round((completed / task.checklist.length) * 100);
    },

    openTaskModalForCreate: async function (colStatus = 'todo') {
      const form = document.getElementById('task-editor-form');
      if (form) form.reset();
      
      document.getElementById('task-id').value = '';
      document.getElementById('task-status').value = colStatus;
      document.getElementById('task-due').value = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
      
      this.tempSubtasks = [];
      this.renderSubtasks([]);
      
      document.getElementById('modal-task-title').textContent = 'Add Task';
      App.openModal('modal-task-editor');
    },

    saveTask: async function () {
      const id = document.getElementById('task-id').value;
      const title = document.getElementById('task-title').value;
      const description = document.getElementById('task-desc').value;
      const priority = document.getElementById('task-priority').value;
      const category = document.getElementById('task-category').value;
      const status = document.getElementById('task-status').value;
      const dueDate = document.getElementById('task-due').value;
      const estTime = parseFloat(document.getElementById('task-est').value) || 0;
      const actTime = parseFloat(document.getElementById('task-act').value) || 0;
      const reminder = document.getElementById('task-reminder').checked;

      const tasks = await StorageService.get('tasks') || [];

      if (id) {
        // Edit Mode
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          tasks[idx] = { id, title, description, priority, category, status, dueDate, estTime, actTime, reminder, checklist: this.tempSubtasks };
          Utils.showToast('Task Updated', 'Changes saved successfully.', 'success');
        }
      } else {
        // Create Mode
        const newTask = {
          id: Utils.generateId(),
          title, description, priority, category, status, dueDate, estTime, actTime, reminder, checklist: this.tempSubtasks
        };
        tasks.push(newTask);
        Utils.showToast('Task Added', 'New task added to Kanban board.', 'success');
      }

      await StorageService.set('tasks', tasks);
      App.closeModal('modal-task-editor');
      this.render();

      if (window.DashboardModule) window.DashboardModule.render();
    },

    editTaskPrompt: async function (id) {
      const tasks = await StorageService.get('tasks') || [];
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      document.getElementById('task-id').value = task.id;
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-desc').value = task.description || '';
      document.getElementById('task-priority').value = task.priority;
      document.getElementById('task-category').value = task.category;
      document.getElementById('task-status').value = task.status;
      document.getElementById('task-due').value = task.dueDate || '';
      document.getElementById('task-est').value = task.estTime || '';
      document.getElementById('task-act').value = task.actTime || '';
      document.getElementById('task-reminder').checked = task.reminder || false;

      this.tempSubtasks = [...task.checklist];
      this.renderSubtasks(this.tempSubtasks);

      document.getElementById('modal-task-title').textContent = 'Edit Task';
      App.openModal('modal-task-editor');
    },

    deleteTask: async function (id) {
      if (!confirm('Are you sure you want to delete this task?')) return;

      const tasks = await StorageService.get('tasks') || [];
      const filtered = tasks.filter(t => t.id !== id);

      await StorageService.set('tasks', filtered);
      Utils.showToast('Task Deleted', 'Task was deleted.', 'warning');
      this.render();

      if (window.DashboardModule) window.DashboardModule.render();
    }
  };

  // Inject Task & Calendar Specific CSS Rules dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .kanban-empty-msg {
      border: 1px dashed var(--border-color);
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 12px;
    }
    .subtask-row-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0;
      border-bottom: 1px solid var(--border-light);
    }
    .subtask-row-item input[type="checkbox"] {
      cursor: pointer;
    }
    .subtask-row-item span {
      font-size: 13px;
      flex-grow: 1;
    }
    .btn-clear-task {
      background: none;
      border: none;
    }
    /* Calendar styles */
    .calendar-container {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
    }
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .calendar-month-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
    }
    .calendar-nav-btn {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      color: var(--text-primary);
    }
    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-weight: 600;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 10px;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-auto-rows: minmax(100px, auto);
      gap: 1px;
      background-color: var(--border-color);
    }
    .calendar-day {
      background-color: var(--bg-tertiary);
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .calendar-day.day-padding {
      opacity: 0.3;
    }
    .calendar-day.today {
      background-color: rgba(59, 130, 246, 0.08);
      border: 1px solid var(--primary);
    }
    .day-num {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-secondary);
    }
    .calendar-tasks-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
      max-height: 80px;
    }
    .calendar-task-tag {
      font-size: 9px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
  document.head.appendChild(style);

  window.TasksModule = TasksModule;
})();
