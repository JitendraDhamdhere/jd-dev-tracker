/* Tracker JS - Tech specific sub-trackers: Java, Spring Boot, MySQL, and DSA */

(function () {
  const TrackerModule = {
    activeTab: 'java-tracker',

    init: async function () {
      this.render(this.activeTab);
    },

    render: async function (tabId) {
      this.activeTab = tabId;
      this.renderActiveTracker();
    },

    renderActiveTracker: async function () {
      if (this.activeTab === 'java-tracker') {
        this.renderJavaTracker();
      } else if (this.activeTab === 'springboot-tracker') {
        this.renderSpringTracker();
      } else if (this.activeTab === 'mysql-tracker') {
        this.renderMysqlTracker();
      } else if (this.activeTab === 'dsa-tracker') {
        this.renderDsaTracker();
      }
    },

    // Java Tracker Render
    renderJavaTracker: async function () {
      const container = document.getElementById('java-tracker-container');
      if (!container) return;

      const trackers = await StorageService.get('trackers') || {};
      const java = trackers.java || {};

      const topics = [
        { key: 'basics', label: 'Java Basics', desc: 'Variables, loops, operators, scopes, variables types.' },
        { key: 'oop', label: 'Object-Oriented Programming (OOP)', desc: 'Classes, Objects, Inheritance, Interface, Abstract classes, Polymorphism.' },
        { key: 'collections', label: 'Java Collections Framework', desc: 'Lists, Sets, Maps, Queues, sorting, collections utilities.' },
        { key: 'generics', label: 'Generics & Wildcards', desc: 'Type safety parameterizations, generic methods and bounds.' },
        { key: 'exceptions', label: 'Exception Handling', desc: 'Try-catch blocks, finally block, throwing exceptions, custom exceptions.' },
        { key: 'streams', label: 'Java Streams API', desc: 'Functional programming operations on lists, collect maps.' },
        { key: 'lambdas', label: 'Lambda Expressions', desc: 'Functional interfaces, functional parameters, anonymous delegates.' },
        { key: 'multithreading', label: 'Multithreading Core', desc: 'Thread creations, states, Synchronization blocks, Monitors.' },
        { key: 'executor', label: 'Executor Framework', desc: 'ThreadPoolExecutor, ForkJoinPool, thread reuse, thread scheduling.' },
        { key: 'concurrency', label: 'Advanced Concurrency API', desc: 'Atomic classes, ConcurrentHashMaps, ReentrantLocks, Semaphores.' },
        { key: 'jvm', label: 'JVM Internals', desc: 'Class loader hierarchy, Bytecode executions, JIT compilers.' },
        { key: 'memory', label: 'Memory Management', desc: 'Heap memory spaces, Stack frames allocations, OutOfMemory errors.' },
        { key: 'gc', label: 'Garbage Collection Algorithms', desc: 'G1GC, ZGC, CMS garbage sweep details.' },
        { key: 'reflection', label: 'Reflection API', desc: 'Runtime inspections, dynamic loading, annotations lookups.' },
        { key: 'annotations', label: 'Custom Annotations', desc: 'Defining Retention policies, Targets, custom validations.' },
        { key: 'serialization', label: 'Object Serialization', desc: 'Serializable markers, transient keywords, externalizations.' },
        { key: 'design_patterns', label: 'Gang of Four Design Patterns', desc: 'Creational, Structural, Behavioral patterns in Java.' }
      ];

      const completedCount = topics.filter(t => java[t.key] === true).length;
      const progressPercent = Math.round((completedCount / topics.length) * 100);

      let html = this.buildTrackerHeader('Java Core Skills Progress', progressPercent, completedCount, topics.length);
      
      html += '<div class="tracker-items-grid">';
      html += topics.map(t => {
        const isDone = java[t.key] === true;
        const checkboxState = isDone ? 'checked' : '';
        return `
          <div class="tracker-card ${isDone ? 'completed-card' : ''}">
            <div class="tracker-card-left">
              <input type="checkbox" ${checkboxState} onchange="TrackerModule.toggleItem('java', '${t.key}')">
            </div>
            <div class="tracker-card-content">
              <h5>${t.label}</h5>
              <p>${t.desc}</p>
            </div>
          </div>
        `;
      }).join('');
      html += '</div>';

      container.innerHTML = html;
    },

    // Spring Boot Tracker Render
    renderSpringTracker: async function () {
      const container = document.getElementById('spring-tracker-container');
      if (!container) return;

      const trackers = await StorageService.get('trackers') || {};
      const spring = trackers.spring || {};

      const topics = [
        { key: 'core', label: 'Spring Core', desc: 'IoC Container, Bean Factory, ApplicationContext configuration.' },
        { key: 'ioc', label: 'Dependency Injection (DI)', desc: 'Constructor vs Field dependency bindings.' },
        { key: 'mvc', label: 'Spring MVC', desc: 'DispatcherServlet routing, view mapping controllers.' },
        { key: 'rest', label: 'REST API Controllers', desc: 'RestController response mapping, JSON representations.' },
        { key: 'validation', label: 'Request Validation', desc: 'JSR-380 validation constraints (@Valid, @NotNull).' },
        { key: 'jpa', label: 'Spring Data JPA', desc: 'Repository mappings, Query derivations, entity transactions.' },
        { key: 'security', label: 'Spring Security Base', desc: 'Configuring auth filters, password encoder mechanisms.' },
        { key: 'jwt', label: 'JWT Authentications', desc: 'Generating JWT credentials, security token filters.' },
        { key: 'redis', label: 'Redis Cache Integration', desc: 'Setting RedisTemplate configurations, @Cacheable wrappers.' },
        { key: 'microservices', label: 'Microservices Setup', desc: 'Distributed configurations patterns.' },
        { key: 'gateway', label: 'API Gateway Routing', desc: 'Request routing redirections, gateway rate filters.' },
        { key: 'eureka', label: 'Eureka Discovery', desc: 'Instances configuration registrations.' },
        { key: 'feign', label: 'Feign Clients', desc: 'Declarative HTTP clients client-side load balancing.' },
        { key: 'rabbitmq', label: 'RabbitMQ Messaging', desc: 'AMQP brokers messaging patterns.' },
        { key: 'kafka', label: 'Apache Kafka Pipeline', desc: 'Producers, Consumers, multi-partition messaging.' },
        { key: 'docker', label: 'Dockerize Spring Boot', desc: 'Container builds, environment profile injection.' },
        { key: 'testing', label: 'Spring Boot Testing', desc: 'JUnit 5 mock assertions, MockMvc configurations.' },
        { key: 'actuator', label: 'Spring Boot Actuator', desc: 'Health checks, app metrics endpoints audits.' },
        { key: 'swagger', label: 'Swagger/OpenAPI docs', desc: 'Auto generating API endpoints documentations.' }
      ];

      const completedCount = topics.filter(t => spring[t.key] === true).length;
      const progressPercent = Math.round((completedCount / topics.length) * 100);

      let html = this.buildTrackerHeader('Spring Boot & Cloud Skills Progress', progressPercent, completedCount, topics.length);
      
      html += '<div class="tracker-items-grid">';
      html += topics.map(t => {
        const isDone = spring[t.key] === true;
        const checkboxState = isDone ? 'checked' : '';
        return `
          <div class="tracker-card ${isDone ? 'completed-card' : ''}">
            <div class="tracker-card-left">
              <input type="checkbox" ${checkboxState} onchange="TrackerModule.toggleItem('spring', '${t.key}')">
            </div>
            <div class="tracker-card-content">
              <h5>${t.label}</h5>
              <p>${t.desc}</p>
            </div>
          </div>
        `;
      }).join('');
      html += '</div>';

      container.innerHTML = html;
    },

    // MySQL Tracker Render
    renderMysqlTracker: async function () {
      const container = document.getElementById('mysql-tracker-container');
      if (!container) return;

      const trackers = await StorageService.get('trackers') || {};
      const mysql = trackers.mysql || {};

      const topics = [
        { key: 'ddl', label: 'DDL Statements', desc: 'CREATE, ALTER, DROP tables constraints.' },
        { key: 'dml', label: 'DML Queries', desc: 'SELECT, INSERT, UPDATE, DELETE queries executions.' },
        { key: 'constraints', label: 'Database Constraints', desc: 'Primary key, Foreign key cascade triggers.' },
        { key: 'joins', label: 'Joins Operations', desc: 'Inner, Left, Right, Full joins, Cross product joins.' },
        { key: 'views', label: 'Database Views', desc: 'Virtual tables, materialized views configurations.' },
        { key: 'indexes', label: 'Index Optimization', desc: 'Clustered, Composite indexing structures, indexes tuning.' },
        { key: 'normalization', label: 'Schema Normalization', desc: 'Database designs normal forms (1NF, 2NF, 3NF, BCNF).' },
        { key: 'transactions', label: 'ACID Transactions', desc: 'Concurrency lock isolation modes, Commit rollback states.' },
        { key: 'procedures', label: 'Stored Procedures', desc: 'SQL statements routines scripts.' },
        { key: 'triggers', label: 'Triggers Logging', desc: 'Trigger operations executed on mutations.' },
        { key: 'tuning', label: 'Performance Tuning', desc: 'Explain plan executions, Slow query analysis optimization.' },
        { key: 'backup', label: 'Backup Utilities', desc: 'MySQLdump utilities, recovery import procedures.' },
        { key: 'replication', label: 'Replication Architectures', desc: 'Master-Slave sync replications details.' }
      ];

      const completedCount = topics.filter(t => mysql[t.key] === true).length;
      const progressPercent = Math.round((completedCount / topics.length) * 100);

      let html = this.buildTrackerHeader('MySQL DBMS Skills Progress', progressPercent, completedCount, topics.length);
      
      html += '<div class="tracker-items-grid">';
      html += topics.map(t => {
        const isDone = mysql[t.key] === true;
        const checkboxState = isDone ? 'checked' : '';
        return `
          <div class="tracker-card ${isDone ? 'completed-card' : ''}">
            <div class="tracker-card-left">
              <input type="checkbox" ${checkboxState} onchange="TrackerModule.toggleItem('mysql', '${t.key}')">
            </div>
            <div class="tracker-card-content">
              <h5>${t.label}</h5>
              <p>${t.desc}</p>
            </div>
          </div>
        `;
      }).join('');
      html += '</div>';

      container.innerHTML = html;
    },

    // DSA Tracker Render
    renderDsaTracker: async function () {
      const container = document.getElementById('dsa-tracker-container');
      if (!container) return;

      const trackers = await StorageService.get('trackers') || {};
      const dsa = trackers.dsa || {};

      let totalSolved = 0;
      let totalTarget = 0;

      Object.keys(dsa).forEach(k => {
        totalSolved += (dsa[k].easy || 0) + (dsa[k].medium || 0) + (dsa[k].hard || 0);
        totalTarget += (dsa[k].target || 0);
      });

      const overallPercent = totalTarget > 0 ? Math.min((totalSolved / totalTarget) * 100, 100) : 0;

      let html = this.buildTrackerHeader('Data Structures & Algorithms Tracker', overallPercent, totalSolved, totalTarget, 'problems solved');
      
      html += '<div class="dsa-tracker-grid">';
      
      Object.keys(dsa).forEach(key => {
        const topic = dsa[key];
        const solved = (topic.easy || 0) + (topic.medium || 0) + (topic.hard || 0);
        const percent = topic.target > 0 ? Math.round((solved / topic.target) * 100) : 0;
        const isCompleted = topic.completed === true;

        html += `
          <div class="dsa-card ${isCompleted ? 'completed-card' : ''}">
            <div class="dsa-card-header">
              <h5>${key.toUpperCase().replace('_', ' ')}</h5>
              <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="TrackerModule.toggleDsaCompleted('${key}')">
            </div>
            <div class="dsa-metrics-row">
              <div class="dsa-input-group">
                <label>Easy</label>
                <input type="number" value="${topic.easy}" min="0" onchange="TrackerModule.updateDsaVal('${key}', 'easy', this.value)">
              </div>
              <div class="dsa-input-group">
                <label>Medium</label>
                <input type="number" value="${topic.medium}" min="0" onchange="TrackerModule.updateDsaVal('${key}', 'medium', this.value)">
              </div>
              <div class="dsa-input-group">
                <label>Hard</label>
                <input type="number" value="${topic.hard}" min="0" onchange="TrackerModule.updateDsaVal('${key}', 'hard', this.value)">
              </div>
              <div class="dsa-input-group">
                <label>Target</label>
                <input type="number" value="${topic.target}" min="1" onchange="TrackerModule.updateDsaVal('${key}', 'target', this.value)">
              </div>
            </div>
            <div style="margin-top:12px;">
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:4px;">
                <span>Topic Solved: ${solved}/${topic.target}</span>
                <span>${percent}%</span>
              </div>
              <div class="progress-bar-bg" style="height:6px;">
                <div class="progress-bar-fill" style="width:${Math.min(percent, 100)}%;"></div>
              </div>
            </div>
          </div>
        `;
      });

      html += '</div>';

      container.innerHTML = html;
    },

    buildTrackerHeader: async function (title, percent, count, total, unit = 'skills mastered') {
      return `
        <div style="margin-bottom:28px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="font-family:var(--font-heading); font-size:18px; font-weight:700;">${title}</h4>
            <span style="font-size:13px; font-weight:600; color:var(--text-secondary);">${percent}% (${count}/${total} ${unit})</span>
          </div>
          <div class="progress-bar-bg" style="height:10px; border-radius:5px;">
            <div class="progress-bar-fill" style="width: ${percent}%; border-radius:5px;"></div>
          </div>
        </div>
      `;
    },

    // Interactions
    toggleItem: async function (trackerKey, itemKey) {
      const trackers = await StorageService.get('trackers') || {};
      trackers[trackerKey][itemKey] = !trackers[trackerKey][itemKey];

      await StorageService.set('trackers', trackers);
      this.renderActiveTracker();
      
      // Sync trackers state back to roadmap
      this.syncTrackerToRoadmap(itemKey, trackers[trackerKey][itemKey]);

      Utils.showToast('Progress Saved', '', 'success');

      if (window.DashboardModule) window.DashboardModule.render();
    },

    toggleDsaCompleted: async function (key) {
      const trackers = await StorageService.get('trackers') || {};
      trackers.dsa[key].completed = !trackers.dsa[key].completed;

      await StorageService.set('trackers', trackers);
      this.renderActiveTracker();
      Utils.showToast('Progress Saved', '', 'success');

      if (window.DashboardModule) window.DashboardModule.render();
    },

    updateDsaVal: async function (key, difficulty, val) {
      const trackers = await StorageService.get('trackers') || {};
      const intVal = parseInt(val) || 0;
      
      trackers.dsa[key][difficulty] = intVal;

      await StorageService.set('trackers', trackers);
      this.renderActiveTracker();

      if (window.DashboardModule) window.DashboardModule.render();
    },

    // Quietly sync tracker status back to learning roadmap
    syncTrackerToRoadmap: async function (itemKey, isCompleted) {
      const roadmap = await StorageService.get('roadmap') || {};
      
      let roadmapNode = null;
      if (itemKey === 'basics') roadmapNode = 'java_basics';
      if (itemKey === 'oop') roadmapNode = 'oop';
      if (itemKey === 'collections') roadmapNode = 'collections';
      if (itemKey === 'generics') roadmapNode = 'generics';
      if (itemKey === 'exceptions') roadmapNode = 'exception_handling';
      if (itemKey === 'streams') roadmapNode = 'streams';
      if (itemKey === 'lambdas') roadmapNode = 'lambda';
      if (itemKey === 'multithreading') roadmapNode = 'multithreading';
      if (itemKey === 'concurrency') roadmapNode = 'concurrency';
      if (itemKey === 'jvm') roadmapNode = 'jvm_internals';
      if (itemKey === 'core') roadmapNode = 'spring_core';
      if (itemKey === 'ioc') roadmapNode = 'ioc_di';
      if (itemKey === 'mvc') roadmapNode = 'spring_mvc';
      if (itemKey === 'jpa') roadmapNode = 'jpa_hibernate';
      if (itemKey === 'security') roadmapNode = 'spring_security';
      if (itemKey === 'rest') roadmapNode = 'rest_api';
      if (itemKey === 'microservices') roadmapNode = 'microservices';
      if (itemKey === 'docker') roadmapNode = 'docker';

      if (roadmapNode) {
        roadmap[roadmapNode] = isCompleted;
        await StorageService.set('roadmap', roadmap);
        if (window.RoadmapModule) window.RoadmapModule.render();
      }
    }
  };

  // Inject Tracker grids dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .tracker-items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .tracker-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
      transition: all 0.2s ease;
    }
    .tracker-card:hover {
      border-color: rgba(255,255,255,0.15);
      transform: translateY(-2px);
    }
    .tracker-card.completed-card {
      border-left: 4px solid var(--success);
    }
    .tracker-card-left input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .tracker-card-content h5 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .tracker-card-content p {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    /* DSA Grid */
    .dsa-tracker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .dsa-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }
    .dsa-card:hover {
      border-color: rgba(255,255,255,0.15);
      transform: translateY(-2px);
    }
    .dsa-card.completed-card {
      border-top: 4px solid var(--success);
    }
    .dsa-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .dsa-card-header h5 {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 700;
    }
    .dsa-metrics-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .dsa-input-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .dsa-input-group label {
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .dsa-input-group input {
      width: 100%;
      height: 32px;
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      text-align: center;
      font-size: 12px;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);

  window.TrackerModule = TrackerModule;
})();
