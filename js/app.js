/* App JS - Application Navigation, Theme Manager, and Global Search engine */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
  const App = {
    init: async function () {
      this.initAuth();
      if (sessionStorage.getItem('devtrack_logged_in') === 'true') {
        document.documentElement.classList.add('logged-in');
        Utils.showToast('Welcome back, Jitu!', 'Lets write some code today!', 'success');
      }

      this.initTheme();
      await this.initNavigation();
      this.initMobileSidebar();
      this.initGlobalSearch();
      await this.initProfileFooter();
      // Initialize sub-modules if loaded
      await this.initializeModules();



      window.isAppLoaded = true;

      const loader = document.getElementById('supabase-loader');
      if (loader) loader.remove();

      console.log('[DevTrack] App loading finished.');
    },

    // Theme Manager
    initTheme: async function () {
      const themeToggle = document.getElementById('theme-toggle-btn');
      const savedTheme = localStorage.getItem('devtrack_theme') || 'dark';

      document.documentElement.setAttribute('data-theme', savedTheme);
      this.updateThemeIcon(savedTheme);

      if (themeToggle) {
        themeToggle.addEventListener('click', async () => {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('devtrack_theme', newTheme);
          this.updateThemeIcon(newTheme);
          Utils.showToast('Theme Changed', `Switched to ${newTheme} mode.`, 'info');

          // Re-render charts in dashboard and analytics if they exist
          if (window.DashboardModule && window.DashboardModule.charts) {
            window.DashboardModule.renderCharts();
          }
          if (window.AnalyticsModule && window.AnalyticsModule.charts) {
            window.AnalyticsModule.renderCharts();
          }
        });
      }
    },

    updateThemeIcon: async function (theme) {
      const icon = document.querySelector('#theme-toggle-btn i');
      if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
      }
    },

    // Navigation and Routing
    initNavigation: async function () {
      const links = document.querySelectorAll('.sidebar-link');
      const panels = document.querySelectorAll('.view-panel');
      const pageTitle = document.querySelector('.page-title');

      links.forEach(link => {
        link.addEventListener('click', async (e) => {
          e.preventDefault();
          const targetTab = link.getAttribute('data-target');
          if (!targetTab) return;

          // Update active links
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');

          // Toggle View Panels
          for (const p of panels) {
            if (p.id === `view-${targetTab}`) {
              p.classList.add('active-view');
              // Trigger sub-module specific render updates
              await this.onViewChanged(targetTab);
            } else {
              p.classList.remove('active-view');
            }
          }

          // Update Header Title
          if (pageTitle) {
            pageTitle.textContent = link.textContent.trim();
          }

          // Close sidebar on mobile
          document.body.classList.remove('sidebar-open');
        });
      });
    },

    // View change listener triggers rendering logic
    onViewChanged: async function (tab) {
      if (tab === 'dashboard' && window.DashboardModule) {
        await window.DashboardModule.render();
      } else if (tab === 'study' && window.StudyModule) {
        await window.StudyModule.render();
      } else if (tab === 'notes' && window.NotesModule) {
        await window.NotesModule.render();
      } else if (tab === 'tasks' && window.TasksModule) {
        await window.TasksModule.render();
      } else if (tab === 'roadmap' && window.RoadmapModule) {
        await window.RoadmapModule.render();
      } else if (tab === 'projects' && window.ProjectsModule) {
        await window.ProjectsModule.render();
      } else if (tab === 'interviews' && window.InterviewsModule) {
        await window.InterviewsModule.render();
      } else if (tab === 'jobs' && window.JobsModule) {
        await window.JobsModule.render();
      } else if (tab === 'analytics' && window.AnalyticsModule) {
        await window.AnalyticsModule.render();
      } else if (tab === 'routine' && window.RoutineModule) {
        await window.RoutineModule.render();
      } else if (tab === 'settings' && window.SettingsModule) {
        await window.SettingsModule.render();
      } else if (tab.includes('-tracker') || ['java', 'spring', 'mysql', 'dsa'].some(t => tab.includes(t))) {
        if (window.TrackerModule) {
          await window.TrackerModule.render(tab);
        }
      }
    },

    // Switch view externally
    navigateToTab: async function (tabId) {
      const targetLink = document.querySelector(`.sidebar-link[data-target="${tabId}"]`);
      if (targetLink) {
        targetLink.click();
      }
    },

    // Mobile Hamburger Sidebar Toggle
    initMobileSidebar: async function () {
      const toggleBtn = document.getElementById('sidebar-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', async () => {
          document.body.classList.toggle('sidebar-open');
        });
      }

      // Close when clicking overlay (clicking outside sidebar on mobile)
      document.addEventListener('click', async (e) => {
        if (document.body.classList.contains('sidebar-open')) {
          const sidebar = document.getElementById('sidebar');
          const toggleBtn = document.getElementById('sidebar-toggle');
          if (sidebar && !sidebar.contains(e.target) && toggleBtn && !toggleBtn.contains(e.target)) {
            document.body.classList.remove('sidebar-open');
          }
        }
      });
    },

    // Global Search Engine
    initGlobalSearch: async function () {
      const searchInput = document.getElementById('global-search-input');
      const searchResults = document.createElement('div');
      searchResults.id = 'search-results-overlay';
      searchResults.className = 'search-results-overlay';

      // Append to the header search container
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer) {
        searchContainer.appendChild(searchResults);
      }

      if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
          const query = e.target.value.toLowerCase().trim();
          if (!query) {
            searchResults.style.display = 'none';
            return;
          }

          const results = await this.performGlobalSearch(query);
          this.renderSearchResults(results, searchResults);
        });

        // Close search list on clicking outside
        document.addEventListener('click', async (e) => {
          if (searchContainer && !searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
          }
        });

        // Re-focus open
        searchInput.addEventListener('focus', async (e) => {
          if (e.target.value) {
            searchResults.style.display = 'block';
          }
        });
      }
    },

    performGlobalSearch: async function (query) {
      const results = [];

      // 1. Search Notes
      const notes = await StorageService.get('notes') || [];
      notes.forEach(note => {
        if (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) {
          results.push({
            type: 'Note',
            title: note.title,
            desc: note.category,
            tab: 'notes',
            icon: 'fa-sticky-note',
            id: note.id
          });
        }
      });

      // 2. Search Tasks
      const tasks = await StorageService.get('tasks') || [];
      tasks.forEach(task => {
        if (task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)) {
          results.push({
            type: 'Task',
            title: task.title,
            desc: `Status: ${task.status} | Priority: ${task.priority}`,
            tab: 'tasks',
            icon: 'fa-tasks',
            id: task.id
          });
        }
      });

      // 3. Search Projects
      const projects = await StorageService.get('projects') || [];
      projects.forEach(project => {
        if (project.name.toLowerCase().includes(query) || project.description.toLowerCase().includes(query)) {
          results.push({
            type: 'Project',
            title: project.name,
            desc: project.technologies,
            tab: 'projects',
            icon: 'fa-folder-open',
            id: project.id
          });
        }
      });

      // 4. Search Applications
      const jobs = await StorageService.get('jobs') || [];
      jobs.forEach(job => {
        if (job.company.toLowerCase().includes(query) || job.role.toLowerCase().includes(query)) {
          results.push({
            type: 'Job',
            title: `${job.role} at ${job.company}`,
            desc: `ATS Status: ${job.status}`,
            tab: 'jobs',
            icon: 'fa-briefcase',
            id: job.id
          });
        }
      });

      // Limit results
      return results.slice(0, 7);
    },

    renderSearchResults: async function (results, container) {
      if (results.length === 0) {
        container.innerHTML = '<div class="search-no-results">No matches found.</div>';
      } else {
        container.innerHTML = results.map(item => `
          <div class="search-result-item" data-tab="${item.tab}" data-id="${item.id}">
            <i class="fas ${item.icon} search-item-icon"></i>
            <div class="search-item-info">
              <div class="search-item-title">${item.title}</div>
              <div class="search-item-desc">${item.type} &bull; ${item.desc}</div>
            </div>
          </div>
        `).join('');

        const items = container.querySelectorAll('.search-result-item');
        items.forEach(item => {
          item.addEventListener('click', async () => {
            const tab = item.getAttribute('data-tab');
            const id = item.getAttribute('data-id');
            container.style.display = 'none';
            document.getElementById('global-search-input').value = '';

            // Navigate to appropriate panel
            this.navigateToTab(tab);

            // Pulse active element in that view
            setTimeout(() => {
              const element = document.getElementById(id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('anim-pulse-glow');
                setTimeout(() => element.classList.remove('anim-pulse-glow'), 3000);
              }
            }, 500);
          });
        });
      }
      container.style.display = 'block';
    },

    // Modals Controller
    openModal: async function (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeModal: async function (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    initProfileFooter: async function () {
      console.log("profile footer 1"); let profile = await StorageService.get('profile'); console.log("profile footer 2", profile);
      if (profile) {
        if (profile.name === 'Alex Mercer') {
          profile.name = 'Jitendra Dhamdhere';
          await StorageService.set('profile', profile);
        }
        if (profile.avatar === 'AM') {
          profile.avatar = 'JD';
          await StorageService.set('profile', profile);
        }
        const nameEl = document.querySelector('.profile-name');
        const roleEl = document.querySelector('.profile-role');
        const avatarEl = document.querySelector('.profile-avatar');

        if (nameEl) nameEl.textContent = profile.name;
        if (roleEl) roleEl.textContent = profile.role;
        if (avatarEl) avatarEl.textContent = profile.avatar || profile.name.split(' ').map(n => n[0]).join('');
      }
    },

    // Local Screen Lock / UI Gate (NOT Real Authentication)
    // NOTE: This is purely a local frontend screen lock. It provides NO real security.
    // Real access control, security, and sensitive data protection are enforced exclusively 
    // by Google OAuth and Google Sheets API permissions. This screen is just a UI blocker.
    initAuth: async function () {
      const loginForm = document.getElementById('login-form');
      const logoutBtn = document.getElementById('logout-btn');
      const errorMsg = document.getElementById('login-error');

      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const usernameInput = document.getElementById('login-username');
          const passwordInput = document.getElementById('login-password');

          const username = usernameInput.value.trim();
          const password = passwordInput.value.trim();

          // LOCAL SCREEN UNLOCK LOGIC
          if (username === 'Jitu' && password === '6462') {
            // Local screen unlocked
            sessionStorage.setItem('devtrack_logged_in', 'true');
            document.documentElement.classList.add('logged-in');
            if (errorMsg) errorMsg.style.display = 'none';

            // Clear inputs
            usernameInput.value = '';
            passwordInput.value = '';

            // Show welcome message
            Utils.showToast('Unlocked', 'Welcome back, Jitu! Dashboard loaded.', 'success');
          } else {
            // Credentials incorrect
            if (errorMsg) errorMsg.style.display = 'flex';
            const card = document.querySelector('.login-card');
            if (card) {
              card.style.animation = 'none';
              card.offsetHeight; /* trigger reflow */
              card.style.animation = 'shake 0.4s ease-in-out';
            }
          }
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          sessionStorage.removeItem('devtrack_logged_in');
          document.documentElement.classList.remove('logged-in');
          Utils.showToast('Signed Out', 'You have been signed out successfully.', 'info');
        });
      }
    },

    initializeModules: async function () {
      if (window.StorageService && window.StorageService.initPromise) {
        await window.StorageService.initPromise;
      }

      // Trigger modules initial paint
      if (window.DashboardModule) await window.DashboardModule.init();
      if (window.StudyModule) await window.StudyModule.init();
      if (window.NotesModule) await window.NotesModule.init();
      if (window.TasksModule) await window.TasksModule.init();
      if (window.RoadmapModule) await window.RoadmapModule.init();
      if (window.TrackerModule) await window.TrackerModule.init();
      if (window.ProjectsModule) await window.ProjectsModule.init();
      if (window.InterviewsModule) await window.InterviewsModule.init();
      if (window.JobsModule) await window.JobsModule.init();
      if (window.AnalyticsModule) await window.AnalyticsModule.init();
      if (window.RoutineModule) await window.RoutineModule.init();
      if (window.SettingsModule) await window.SettingsModule.init();
    }
  };

  // Add stylesheet rules dynamically for search box overlays
  const style = document.createElement('style');
  style.innerHTML = `
    .search-results-overlay {
      position: absolute;
      top: 45px;
      left: 0;
      width: 100%;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 200;
      display: none;
      max-height: 350px;
      overflow-y: auto;
    }
    .search-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid var(--border-light);
      transition: background-color 0.2s ease;
    }
    .search-result-item:hover {
      background-color: var(--bg-tertiary);
    }
    .search-item-icon {
      font-size: 16px;
      color: var(--primary);
      width: 20px;
      text-align: center;
    }
    .search-item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .search-item-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .search-item-desc {
      font-size: 11px;
      color: var(--text-muted);
    }
    .search-no-results {
      padding: 16px;
      text-align: center;
      font-size: 13px;
      color: var(--text-muted);
    }
  `;
  document.head.appendChild(style);

  window.App = App;
})();
