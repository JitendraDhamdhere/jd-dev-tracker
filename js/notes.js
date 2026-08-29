/* Notes JS - Full Notes Manager with Markdown Support & Autosave */

(function () {
  const NotesModule = {
    activeNoteId: null,
    autosaveTimer: null,
    editorMode: 'write', // 'write' or 'preview'

    init: async function () {
      this.initEventListeners();
      this.render();
    },

    render: async function () {
      this.renderNotesList();
      this.renderActiveNote();
    },

    initEventListeners: async function () {
      // Create Note Button
      const createBtn = document.getElementById('btn-create-note');
      if (createBtn) {
        createBtn.addEventListener('click', async () => this.createNewNote());
      }

      // Note Actions
      const deleteBtn = document.getElementById('note-action-delete');
      const pinBtn = document.getElementById('note-action-pin');
      const favBtn = document.getElementById('note-action-fav');
      const archiveBtn = document.getElementById('note-action-archive');
      const duplicateBtn = document.getElementById('note-action-duplicate');

      if (deleteBtn) deleteBtn.addEventListener('click', async () => this.deleteActiveNote());
      if (pinBtn) pinBtn.addEventListener('click', async () => this.toggleActiveNoteProp('pinned'));
      if (favBtn) favBtn.addEventListener('click', async () => this.toggleActiveNoteProp('favorite'));
      if (archiveBtn) archiveBtn.addEventListener('click', async () => this.toggleActiveNoteProp('archived'));
      if (duplicateBtn) duplicateBtn.addEventListener('click', async () => this.duplicateActiveNote());

      // Editor Tabs (Write vs Preview)
      const tabWrite = document.getElementById('note-tab-write');
      const tabPreview = document.getElementById('note-tab-preview');
      const textEditor = document.getElementById('note-body-editor');
      const previewArea = document.getElementById('note-body-preview');

      if (tabWrite && tabPreview && textEditor && previewArea) {
        tabWrite.addEventListener('click', async () => {
          this.editorMode = 'write';
          tabWrite.classList.add('active-tab');
          tabPreview.classList.remove('active-tab');
          textEditor.style.display = 'block';
          previewArea.style.display = 'none';
        });

        tabPreview.addEventListener('click', async () => {
          this.editorMode = 'preview';
          tabPreview.classList.add('active-tab');
          tabWrite.classList.remove('active-tab');
          textEditor.style.display = 'none';
          previewArea.style.display = 'block';
          // Render markdown
          previewArea.innerHTML = Utils.parseMarkdown(textEditor.value);
        });
      }

      // Input changes trigger autosave
      const titleInput = document.getElementById('note-title-input');
      const catSelect = document.getElementById('note-category-select');
      const tagsInput = document.getElementById('note-tags-input');
      const colorSelect = document.getElementById('note-color-select');

      const triggerAutosave = () => this.triggerAutosave();

      if (titleInput) titleInput.addEventListener('input', triggerAutosave);
      if (catSelect) catSelect.addEventListener('change', triggerAutosave);
      if (tagsInput) tagsInput.addEventListener('input', triggerAutosave);
      if (colorSelect) colorSelect.addEventListener('change', triggerAutosave);
      if (textEditor) textEditor.addEventListener('input', triggerAutosave);

      // Search & Filters on Left Pane
      const searchBox = document.getElementById('notes-search');
      const filterCat = document.getElementById('notes-filter-category');
      const sortBy = document.getElementById('notes-sort-by');

      if (searchBox) searchBox.addEventListener('input', async () => this.renderNotesList());
      if (filterCat) filterCat.addEventListener('change', async () => this.renderNotesList());
      if (sortBy) sortBy.addEventListener('change', async () => this.renderNotesList());

      // Export/Import notes buttons
      const exportBtn = document.getElementById('notes-export');
      const importInput = document.getElementById('notes-import-input');

      if (exportBtn) {
        exportBtn.addEventListener('click', async () => this.exportNotes());
      }
      if (importInput) {
        importInput.addEventListener('change', async (e) => this.importNotes(e));
      }
    },

    // Rendering notes list
    renderNotesList: async function () {
      const listContainer = document.getElementById('notes-sidebar-list');
      if (!listContainer) return;

      const notes = await StorageService.get('notes') || [];
      const searchQuery = document.getElementById('notes-search')?.value.toLowerCase() || '';
      const filterCategory = document.getElementById('notes-filter-category')?.value || 'All';
      const sortOrder = document.getElementById('notes-sort-by')?.value || 'modified';

      // Filter
      let filtered = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery) || note.content.toLowerCase().includes(searchQuery);
        const matchesCategory = filterCategory === 'All' || note.category === filterCategory;
        return matchesSearch && matchesCategory;
      });

      // Sort
      filtered.sort((a, b) => {
        if (sortOrder === 'modified') {
          return new Date(b.dateModified) - new Date(a.dateModified);
        } else if (sortOrder === 'created') {
          return new Date(b.dateCreated) - new Date(a.dateCreated);
        } else if (sortOrder === 'alpha') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });

      // Separate Pinned and Unpinned
      const pinned = filtered.filter(n => n.pinned && !n.archived);
      const normal = filtered.filter(n => !n.pinned && !n.archived);
      const archived = filtered.filter(n => n.archived);

      let finalHtml = '';

      if (pinned.length > 0) {
        finalHtml += '<div class="notes-list-section-header">PINNED</div>';
        finalHtml += this.buildListHtml(pinned);
      }

      if (normal.length > 0) {
        finalHtml += pinned.length > 0 ? '<div class="notes-list-section-header">ALL NOTES</div>' : '';
        finalHtml += this.buildListHtml(normal);
      }

      if (archived.length > 0 && filterCategory === 'Archive') {
        finalHtml += '<div class="notes-list-section-header">ARCHIVED</div>';
        finalHtml += this.buildListHtml(archived);
      }

      if (filtered.length === 0) {
        finalHtml = '<div class="text-muted text-center py-4">No notes found.</div>';
      }

      listContainer.innerHTML = finalHtml;

      // Select active note on click
      const items = listContainer.querySelectorAll('.notes-sidebar-item');
      items.forEach(item => {
        item.addEventListener('click', async () => {
          this.activeNoteId = item.getAttribute('data-id');
          this.render();
        });
      });

      // Automatically select first note if none selected
      if (!this.activeNoteId && filtered.length > 0) {
        this.activeNoteId = filtered[0].id;
        this.renderActiveNote();
      }
    },

    buildListHtml: async function (notesList) {
      return notesList.map(n => {
        const isActive = n.id === this.activeNoteId ? 'active' : '';
        const tagsHtml = n.tags.map(t => `<span class="note-tag-pill">${t}</span>`).join('');
        const previewText = n.content.replace(/[#*`\n-]/g, ' ').substring(0, 60);

        return `
          <div class="notes-sidebar-item ${isActive}" data-id="${n.id}" style="border-left-color: ${n.color || 'var(--primary)'}">
            <div class="note-item-header">
              <span class="note-item-title">${n.title || 'Untitled Note'}</span>
              <div class="note-item-badges">
                ${n.pinned ? '<i class="fas fa-thumbtack text-primary"></i>' : ''}
                ${n.favorite ? '<i class="fas fa-star text-warning"></i>' : ''}
              </div>
            </div>
            <div class="note-item-preview">${previewText}...</div>
            <div class="note-item-footer">
              <span class="note-item-date">${Utils.timeAgo(n.dateModified)}</span>
              <div class="note-item-tags">${tagsHtml}</div>
            </div>
          </div>
        `;
      }).join('');
    },

    renderActiveNote: async function () {
      const notes = await StorageService.get('notes') || [];
      const note = notes.find(n => n.id === this.activeNoteId);

      const editorPanel = document.getElementById('notes-editor-pane');
      if (!editorPanel) return;

      if (!note) {
        editorPanel.style.display = 'none';
        return;
      }

      editorPanel.style.display = 'flex';

      // Update values in inputs
      document.getElementById('note-title-input').value = note.title || '';
      document.getElementById('note-category-select').value = note.category || 'General';
      document.getElementById('note-tags-input').value = note.tags.join(', ') || '';
      document.getElementById('note-color-select').value = note.color || '#3b82f6';
      
      const textEditor = document.getElementById('note-body-editor');
      textEditor.value = note.content || '';

      // Update state indicators in action headers
      const pinBtn = document.getElementById('note-action-pin');
      const favBtn = document.getElementById('note-action-fav');
      const archiveBtn = document.getElementById('note-action-archive');

      if (pinBtn) pinBtn.querySelector('i').className = note.pinned ? 'fas fa-thumbtack active' : 'fas fa-thumbtack';
      if (favBtn) favBtn.querySelector('i').className = note.favorite ? 'fas fa-star text-warning' : 'far fa-star';
      if (archiveBtn) archiveBtn.querySelector('i').className = note.archived ? 'fas fa-archive text-danger' : 'fas fa-archive';

      // Update saved/unsaved status indicator
      const saveStatus = document.getElementById('note-save-status');
      if (saveStatus) saveStatus.innerHTML = '<i class="fas fa-check"></i> Saved';

      // If in preview mode, update preview html
      if (this.editorMode === 'preview') {
        document.getElementById('note-body-preview').innerHTML = Utils.parseMarkdown(note.content);
      }
    },

    // Autosave functionality
    triggerAutosave: async function () {
      const saveStatus = document.getElementById('note-save-status');
      if (saveStatus) saveStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

      if (this.autosaveTimer) clearTimeout(this.autosaveTimer);

      this.autosaveTimer = setTimeout(() => {
        this.saveActiveNote();
      }, 800);
    },

    saveActiveNote: async function () {
      if (!this.activeNoteId) return;

      const notes = await StorageService.get('notes') || [];
      const idx = notes.findIndex(n => n.id === this.activeNoteId);
      if (idx === -1) return;

      const title = document.getElementById('note-title-input').value;
      const category = document.getElementById('note-category-select').value;
      const tagsStr = document.getElementById('note-tags-input').value;
      const color = document.getElementById('note-color-select').value;
      const content = document.getElementById('note-body-editor').value;

      const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t !== '');

      notes[idx].title = title;
      notes[idx].category = category;
      notes[idx].tags = tags;
      notes[idx].color = color;
      notes[idx].content = content;
      notes[idx].dateModified = new Date().toISOString();

      await StorageService.set('notes', notes);
      
      // Quietly reload notes left list items without breaking editing cursor
      this.updateNotesListSilently();

      const saveStatus = document.getElementById('note-save-status');
      if (saveStatus) saveStatus.innerHTML = '<i class="fas fa-check"></i> Saved';
    },

    updateNotesListSilently: async function () {
      // Just redraw list without re-selecting to keep focus in input
      const listContainer = document.getElementById('notes-sidebar-list');
      if (!listContainer) return;

      const notes = await StorageService.get('notes') || [];
      const searchQuery = document.getElementById('notes-search')?.value.toLowerCase() || '';
      const filterCategory = document.getElementById('notes-filter-category')?.value || 'All';
      const sortOrder = document.getElementById('notes-sort-by')?.value || 'modified';

      let filtered = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery) || note.content.toLowerCase().includes(searchQuery);
        const matchesCategory = filterCategory === 'All' || note.category === filterCategory;
        return matchesSearch && matchesCategory;
      });

      filtered.sort((a, b) => {
        if (sortOrder === 'modified') return new Date(b.dateModified) - new Date(a.dateModified);
        if (sortOrder === 'created') return new Date(b.dateCreated) - new Date(a.dateCreated);
        if (sortOrder === 'alpha') return a.title.localeCompare(b.title);
        return 0;
      });

      const pinned = filtered.filter(n => n.pinned && !n.archived);
      const normal = filtered.filter(n => !n.pinned && !n.archived);
      const archived = filtered.filter(n => n.archived);

      let finalHtml = '';
      if (pinned.length > 0) {
        finalHtml += '<div class="notes-list-section-header">PINNED</div>' + this.buildListHtml(pinned);
      }
      if (normal.length > 0) {
        finalHtml += (pinned.length > 0 ? '<div class="notes-list-section-header">ALL NOTES</div>' : '') + this.buildListHtml(normal);
      }
      if (archived.length > 0 && filterCategory === 'Archive') {
        finalHtml += '<div class="notes-list-section-header">ARCHIVED</div>' + this.buildListHtml(archived);
      }
      if (filtered.length === 0) {
        finalHtml = '<div class="text-muted text-center py-4">No notes found.</div>';
      }

      listContainer.innerHTML = finalHtml;

      // Re-hook listeners
      const items = listContainer.querySelectorAll('.notes-sidebar-item');
      items.forEach(item => {
        item.addEventListener('click', async () => {
          this.activeNoteId = item.getAttribute('data-id');
          this.render();
        });
      });
    },

    // Note Control Methods
    createNewNote: async function () {
      const notes = await StorageService.get('notes') || [];
      const newNote = {
        id: Utils.generateId(),
        title: 'New Note',
        category: 'General',
        tags: [],
        content: '# New Note\n\nWrite your thoughts here...',
        favorite: false,
        pinned: false,
        archived: false,
        color: '#3b82f6',
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };

      notes.push(newNote);
      await StorageService.set('notes', notes);
      
      this.activeNoteId = newNote.id;
      this.render();
      Utils.showToast('Note Created', 'Start writing in markdown.', 'success');
    },

    deleteActiveNote: async function () {
      if (!this.activeNoteId) return;
      if (!confirm('Are you sure you want to delete this note?')) return;

      const notes = await StorageService.get('notes') || [];
      const filtered = notes.filter(n => n.id !== this.activeNoteId);

      await StorageService.set('notes', filtered);
      this.activeNoteId = filtered[0] ? filtered[0].id : null;
      this.render();
      Utils.showToast('Note Deleted', 'Note was permanently deleted.', 'warning');
    },

    toggleActiveNoteProp: async function (prop) {
      if (!this.activeNoteId) return;

      const notes = await StorageService.get('notes') || [];
      const idx = notes.findIndex(n => n.id === this.activeNoteId);
      if (idx === -1) return;

      notes[idx][prop] = !notes[idx][prop];
      await StorageService.set('notes', notes);
      
      this.render();
      const statusText = notes[idx][prop] ? `Note ${prop}` : `Note un-${prop}`;
      Utils.showToast(statusText, '', 'info');
    },

    duplicateActiveNote: async function () {
      if (!this.activeNoteId) return;

      const notes = await StorageService.get('notes') || [];
      const note = notes.find(n => n.id === this.activeNoteId);
      if (!note) return;

      const duplicate = {
        ...note,
        id: Utils.generateId(),
        title: `${note.title} (Copy)`,
        pinned: false,
        favorite: false,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };

      notes.push(duplicate);
      await StorageService.set('notes', notes);
      this.activeNoteId = duplicate.id;
      this.render();
      Utils.showToast('Note Duplicated', '', 'success');
    },

    exportNotes: async function () {
      const notes = await StorageService.get('notes') || [];
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "devtrack_notes_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      Utils.showToast('Export Completed', 'Notes file downloaded.', 'success');
    },

    importNotes: async function (event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedNotes = JSON.parse(e.target.result);
          if (Array.isArray(importedNotes)) {
            const currentNotes = await StorageService.get('notes') || [];
            // Merge matching IDs, append new IDs
            importedNotes.forEach(imp => {
              const matchIdx = currentNotes.findIndex(c => c.id === imp.id);
              if (matchIdx !== -1) {
                currentNotes[matchIdx] = imp;
              } else {
                currentNotes.push(imp);
              }
            });
            await StorageService.set('notes', currentNotes);
            this.render();
            Utils.showToast('Import Succeeded', `${importedNotes.length} notes merged.`, 'success');
          } else {
            Utils.showToast('Import Failed', 'Invalid notes file structure.', 'danger');
          }
        } catch (err) {
          Utils.showToast('Import Error', 'Failed to parse JSON file.', 'danger');
        }
      };
      reader.readAsText(file);
    }
  };

  // Inject notes styling dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .notes-container-layout {
      display: flex;
      height: 100%;
      gap: 20px;
    }
    .notes-sidebar-pane {
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex-shrink: 0;
    }
    .notes-editor-pane {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }
    .notes-sidebar-list {
      flex-grow: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .notes-sidebar-item {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--primary);
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .notes-sidebar-item:hover {
      border-color: rgba(255,255,255,0.15);
      background-color: var(--bg-tertiary);
    }
    .notes-sidebar-item.active {
      background-color: var(--bg-tertiary);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .note-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .note-item-title {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 80%;
    }
    .note-item-badges i {
      font-size: 11px;
      margin-left: 4px;
    }
    .note-item-preview {
      font-size: 11px;
      color: var(--text-secondary);
      margin-bottom: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .note-item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: var(--text-muted);
    }
    .note-item-tags {
      display: flex;
      gap: 4px;
    }
    .note-tag-pill {
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      padding: 1px 6px;
      border-radius: 4px;
    }
    .notes-list-section-header {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin: 8px 0 4px 4px;
    }
    /* Editor styling */
    .note-editor-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: rgba(0,0,0,0.1);
    }
    .note-editor-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .note-editor-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 16px;
      transition: color 0.2s ease;
    }
    .note-editor-btn:hover {
      color: var(--text-primary);
    }
    .note-editor-inputs {
      padding: 20px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 16px;
      border-bottom: 1px solid var(--border-light);
    }
    .note-textarea-container {
      flex-grow: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    .note-body-textarea {
      width: 100%;
      height: 100%;
      min-height: 250px;
      background: none;
      border: none;
      color: var(--text-primary);
      font-family: 'Fira Code', 'Courier New', Courier, monospace;
      font-size: 14px;
      line-height: 1.6;
      resize: none;
    }
    .note-preview-div {
      width: 100%;
      height: 100%;
      min-height: 250px;
      overflow-y: auto;
      display: none;
      line-height: 1.6;
      font-size: 14px;
      color: var(--text-primary);
    }
    .note-preview-div h1, .note-preview-div h2, .note-preview-div h3 {
      font-family: var(--font-heading);
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .note-preview-div code {
      background-color: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
    .note-preview-div pre {
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
    }
    .note-preview-div pre code {
      background: none;
      padding: 0;
    }
    .note-preview-div ul {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    .note-write-preview-toggle {
      display: flex;
      background-color: var(--bg-tertiary);
      border-radius: 12px;
      padding: 2px;
      gap: 2px;
    }
    .note-save-indicator {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `;
  document.head.appendChild(style);

  window.NotesModule = NotesModule;
})();
