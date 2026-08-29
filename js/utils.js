/* Utils JS - Shared helper functions, markdown parser, sound synthesizer, and toasts */

(function () {
  window.Utils = {
    // Generate simple UUID
    generateId: async function () {
      return 'dt_' + Math.random().toString(36).substr(2, 9);
    },

    // Simple markdown-to-HTML compiler
    parseMarkdown: async function (text) {
      if (!text) return '';
      
      let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Headers
      html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
      html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
      html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');

      // Bold & Italics
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Fenced Code Blocks
      html = html.replace(/```(?:[a-zA-Z]*)\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');

      // Inline Code
      html = html.replace(/`(.*?)`/g, '<code>$1</code>');

      // Bullet Lists
      html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
      html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
      // Wrap lists
      html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
      // Clean up adjacent <ul> lists
      html = html.replace(/<\/ul>\s*<ul>/g, '');

      // Line Breaks
      html = html.replace(/\n/g, '<br>');

      return html;
    },

    // Date formatting helpers
    formatDate: async function (dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    timeAgo: async function (dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days}d ago`;
      return this.formatDate(dateStr);
    },

    // Toast Notifications Engine
    showToast: async function (title, message, type = 'success') {
      const container = document.getElementById('toast-wrapper');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      let icon = 'fa-check-circle';
      if (type === 'warning') icon = 'fa-exclamation-triangle';
      if (type === 'danger') icon = 'fa-exclamation-circle';
      if (type === 'info') icon = 'fa-info-circle';

      toast.innerHTML = `
        <i class="fas ${icon} toast-icon"></i>
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
      `;

      container.appendChild(toast);
      
      // Slide-in anim trigger
      setTimeout(() => toast.classList.add('show'), 50);

      const closeBtn = toast.querySelector('.toast-close');
      const dismissToast = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      };

      closeBtn.addEventListener('click', dismissToast);

      // Auto dismiss after 4.5 seconds
      setTimeout(dismissToast, 4500);
    },

    // Synthesized alarm sound using Web Audio API
    playChime: async function (soundType = 'success') {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        if (soundType === 'success') {
          // Double note chime
          this._synthBeep(ctx, 523.25, 0.15, 'sine'); // C5
          setTimeout(() => this._synthBeep(ctx, 659.25, 0.25, 'sine'), 150); // E5
        } else if (soundType === 'break') {
          // Calm downward interval
          this._synthBeep(ctx, 587.33, 0.2, 'sine'); // D5
          setTimeout(() => this._synthBeep(ctx, 440.00, 0.35, 'sine'), 200); // A4
        } else if (soundType === 'alarm') {
          // Repeating sharp notification tones
          this._synthBeep(ctx, 880.00, 0.1, 'triangle'); // A5
          setTimeout(() => this._synthBeep(ctx, 880.00, 0.1, 'triangle'), 150);
          setTimeout(() => this._synthBeep(ctx, 880.00, 0.25, 'triangle'), 300);
        }
      } catch (e) {
        console.warn('Audio Context block or unsupported browser', e);
      }
    },

    _synthBeep: async function (ctx, freq, duration, type) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    }
  };
})();
