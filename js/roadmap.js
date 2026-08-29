/* Roadmap JS - Java Backend Developer Learning Roadmap & progress engine */

(function () {
  const RoadmapModule = {
    // List of roadmap nodes in sequential learning order
    nodes: [
      { id: 'java_basics', label: 'Java Basics', desc: 'Syntax, Variables, Operators, Control Flow' },
      { id: 'oop', label: 'Object-Oriented Programming (OOP)', desc: 'Inheritance, Polymorphism, Encapsulation, Abstraction' },
      { id: 'collections', label: 'Java Collections Framework', desc: 'List, Set, Map, Queue, Collections class APIs' },
      { id: 'generics', label: 'Generics & Wildcards', desc: 'Type safety, Generic classes/methods, Upper/Lower bounds' },
      { id: 'exception_handling', label: 'Exception Handling', desc: 'Try-catch, checked/unchecked exceptions, custom exceptions' },
      { id: 'streams', label: 'Java Streams API', desc: 'Functional-style programming, map, filter, collect' },
      { id: 'lambda', label: 'Lambda Expressions', desc: 'Functional interfaces, method references' },
      { id: 'multithreading', label: 'Multithreading & Concurrency', desc: 'Thread class, Runnable, synchronized, Volatile, Lock APIs' },
      { id: 'concurrency', label: 'Java Concurrency Utilities', desc: 'Executor Framework, Callable, Future, CountDownLatch' },
      { id: 'jvm_internals', label: 'JVM Internals', desc: 'ClassLoaders, JVM Memory Model (Heap/Stack), Garbage Collectors' },
      { id: 'spring_core', label: 'Spring Core Framework', desc: 'Bean lifecycle, Bean scopes, ApplicationContext configuration' },
      { id: 'ioc_di', label: 'Inversion of Control & DI', desc: 'Autowired, Qualifier, constructor/setter injection' },
      { id: 'spring_mvc', label: 'Spring MVC & Web', desc: 'Controllers, RequestMapping, JSON serializers/deserializers' },
      { id: 'jpa_hibernate', label: 'JPA & Hibernate', desc: 'ORM concepts, Entity mappings, Lazy/Eager loading, JPQL/HQL' },
      { id: 'spring_security', label: 'Spring Security', desc: 'Security filters, authentication vs authorization, JWT, OAuth2' },
      { id: 'rest_api', label: 'REST APIs', desc: 'HTTP methods, Status codes, Content Negotiation, Swagger API docs' },
      { id: 'microservices', label: 'Microservices Architecture', desc: 'Eureka Discovery, Spring Cloud Gateway, Feign Clients, Config Server' },
      { id: 'docker', label: 'Docker Containerization', desc: 'Writing Dockerfiles, multi-stage builds, docker-compose configuration' },
      { id: 'kubernetes', label: 'Kubernetes Orchestration', desc: 'Pods, Deployments, Services, ConfigMaps, Secrets' },
      { id: 'aws_basics', label: 'AWS Cloud Services', desc: 'EC2 instance creation, S3 storage buckets, RDS databases, Lambda functions' },
      { id: 'system_design_lld', label: 'Low Level Design (LLD)', desc: 'SOLID design principles, Design Patterns (Singleton, Factory, Builder)' },
      { id: 'system_design_hld', label: 'High Level Design (HLD)', desc: 'Scalability, Load balancers, Caching, Databases (SQL vs NoSQL), Queues' }
    ],

    init: async function () {
      this.render();
    },

    render: async function () {
      this.renderRoadmap();
    },

    renderRoadmap: async function () {
      const container = document.getElementById('roadmap-timeline-flow');
      if (!container) return;

      const roadmapState = await StorageService.get('roadmap') || {};
      const completedCount = this.nodes.filter(n => roadmapState[n.id] === true).length;
      const progressPercent = Math.round((completedCount / this.nodes.length) * 100);

      // Render progress header
      const statsEl = document.getElementById('roadmap-progress-stats');
      if (statsEl) {
        statsEl.innerHTML = `
          <div style="margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; font-weight:600; font-size:14px; margin-bottom:8px;">
              <span>Roadmap Completion Progress</span>
              <span>${progressPercent}% (${completedCount}/${this.nodes.length} Topics Completed)</span>
            </div>
            <div class="progress-bar-bg" style="height:12px; border-radius:6px;">
              <div class="progress-bar-fill" style="width:${progressPercent}%; border-radius:6px;"></div>
            </div>
          </div>
        `;
      }

      // Draw chronological steps
      container.innerHTML = this.nodes.map((node, index) => {
        const isDone = roadmapState[node.id] === true;
        const statusClass = isDone ? 'completed-node' : 'pending-node';
        const checkboxState = isDone ? 'checked' : '';
        const arrowHtml = index < this.nodes.length - 1 ? `<div class="roadmap-arrow"><i class="fas fa-chevron-down"></i></div>` : '';

        return `
          <div class="roadmap-step-card ${statusClass}" id="node_${node.id}">
            <div class="roadmap-step-control">
              <input type="checkbox" id="chk_${node.id}" ${checkboxState} onchange="RoadmapModule.toggleNode('${node.id}')">
            </div>
            <div class="roadmap-step-info">
              <h4 class="roadmap-step-title">${node.label}</h4>
              <p class="roadmap-step-desc">${node.desc}</p>
            </div>
            <div class="roadmap-step-badge">
              <span class="badge ${isDone ? 'badge-low' : 'badge-high'}">${isDone ? 'Completed' : 'Pending'}</span>
            </div>
          </div>
          ${arrowHtml}
        `;
      }).join('');
    },

    toggleNode: async function (nodeId) {
      const roadmapState = await StorageService.get('roadmap') || {};
      roadmapState[nodeId] = !roadmapState[nodeId];
      
      await StorageService.set('roadmap', roadmapState);
      
      // Update trackers state to keep them in sync
      this.syncNodeToTrackers(nodeId, roadmapState[nodeId]);

      this.render();

      Utils.showToast(
        roadmapState[nodeId] ? 'Topic Mastered!' : 'Topic reset',
        `${this.nodes.find(n => n.id === nodeId).label} status updated.`,
        'success'
      );

      // Refresh other sub-views
      if (window.DashboardModule) window.DashboardModule.render();
      if (window.TrackerModule) window.TrackerModule.renderActiveTracker();
    },

    // Quietly sync roadmap actions with trackers
    syncNodeToTrackers: async function (nodeId, isCompleted) {
      const trackers = await StorageService.get('trackers') || {};
      
      // Java Syncs
      if (nodeId === 'java_basics' && trackers.java) trackers.java.basics = isCompleted;
      if (nodeId === 'oop' && trackers.java) trackers.java.oop = isCompleted;
      if (nodeId === 'collections' && trackers.java) trackers.java.collections = isCompleted;
      if (nodeId === 'generics' && trackers.java) trackers.java.generics = isCompleted;
      if (nodeId === 'exception_handling' && trackers.java) trackers.java.exceptions = isCompleted;
      if (nodeId === 'streams' && trackers.java) trackers.java.streams = isCompleted;
      if (nodeId === 'lambda' && trackers.java) trackers.java.lambdas = isCompleted;
      if (nodeId === 'multithreading' && trackers.java) trackers.java.multithreading = isCompleted;
      if (nodeId === 'concurrency' && trackers.java) trackers.java.concurrency = isCompleted;
      if (nodeId === 'jvm_internals' && trackers.java) trackers.java.jvm = isCompleted;

      // Spring Syncs
      if (nodeId === 'spring_core' && trackers.spring) trackers.spring.core = isCompleted;
      if (nodeId === 'ioc_di' && trackers.spring) trackers.spring.ioc = isCompleted;
      if (nodeId === 'spring_mvc' && trackers.spring) trackers.spring.mvc = isCompleted;
      if (nodeId === 'jpa_hibernate' && trackers.spring) {
        trackers.spring.jpa = isCompleted;
        if (trackers.mysql) trackers.mysql.joins = isCompleted;
      }
      if (nodeId === 'spring_security' && trackers.spring) trackers.spring.security = isCompleted;
      if (nodeId === 'rest_api' && trackers.spring) trackers.spring.rest = isCompleted;
      if (nodeId === 'microservices' && trackers.spring) trackers.spring.microservices = isCompleted;
      if (nodeId === 'docker' && trackers.spring) trackers.spring.docker = isCompleted;

      await StorageService.set('trackers', trackers);
    }
  };

  // Inject Roadmap timeline styling rules dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .roadmap-timeline-wrapper {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .roadmap-step-card {
      display: flex;
      align-items: center;
      width: 100%;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px 20px;
      gap: 20px;
      transition: all 0.2s ease;
    }
    .roadmap-step-card:hover {
      border-color: rgba(255,255,255,0.15);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .roadmap-step-card.completed-node {
      border-left: 5px solid var(--success);
    }
    .roadmap-step-card.pending-node {
      border-left: 5px solid var(--warning);
    }
    .roadmap-step-control input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .roadmap-step-info {
      flex-grow: 1;
    }
    .roadmap-step-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .roadmap-step-desc {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .roadmap-arrow {
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  window.RoadmapModule = RoadmapModule;
})();
