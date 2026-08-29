# DevTrack Pro

### Premium Personal Developer Study & Career Management Dashboard

**DevTrack Pro** is a production-quality, fully responsive static web application designed specifically for Java Backend developers (and software engineers generally) looking to coordinate study habits, roadmap metrics, and job application tracking. 

Built using purely semantic HTML5, modern modular CSS3, and Vanilla JavaScript (ES6+), the application works completely offline with instant browser state saving using `LocalStorage`.

---

## 🚀 Key Features

* **Professional Developer Dashboard**: Unified widgets highlighting streak counters, study hours, active Kanban tasks, ATS job hunt pipelines, and progress rings.
* **Focus Pomodoro Timer**: Custom focus intervals with synthesized warning alerts (built with the Web Audio API to prevent external audio downloads) and desktop notifications support.
* **Daily Planner & reflections log**: Record morning goals, daily targets, wins, mistakes, and actionable adjustments.
* **Habits Consistency Matrix**: Visual grid representing Wake Up, Workout, Study, Reading, Coding, DSA, and Water Intake targets over a rolling 7-day period.
* **Markdown Notes Manager**: Structured editor with tag categorizations, pinned/favorite switches, and real-time Markdown preview compilation.
* **Kanban Task Board**: Native HTML5 drag-and-drop columns (Todo, In Progress, Testing, Completed) with inline subtask checklists.
* **Interactive Calendar View**: Group tasks dynamically and display colored deadline indicators on a monthly calendar grid.
* **Interactive Learning Roadmap**: Visual dependency tree indicating the standard path from Core Java to Enterprise Spring Boot and Microservices.
* **Modular Technology Trackers**: Skills checklists targeting Java Core, Spring Boot, and MySQL. DSA Tracker tracks easy/medium/hard question totals against target thresholds.
* **Project Portfolio Showcase**: Monitor projects targets, link GitHub repository directories, and checklist features milestones.
* **Recruiters ATS Tracker**: Log applications, salary estimations, interview rounds (Coding, HR, System Design), and calculate success rates.
* **Backups Management**: Full data safety. Export a complete JSON representation of all data or import backups to restore states.

---

## 🛠️ Technology Stack & Dependencies

* **Core Structure**: HTML5 (Semantic elements)
* **Design Styling**: Custom CSS Variables, CSS Grid, Flexbox, Glassmorphism, and responsive media query drawers.
* **Logic Controller**: Vanilla ES6+ JavaScript modules.
* **Analytics**: [Chart.js (v4.x)](https://www.chartjs.org/) via CDN.
* **Icons**: [Font Awesome (v6.x)](https://fontawesome.com/) via CDN.
* **Offline Storage**: Browser `LocalStorage` (`devtrack_` namespace).
* **Audio Alerts**: Web Audio API (Synthesized square and triangle wave chimes).

---

## 📂 Folder Structure

```
d:\dev-tracker/
│
├── index.html            # Core HTML layout, structure, and modals wrapper
│
├── css/
│   ├── style.css          # Color variables, theme modes, navigation sidebar, and scrollbars
│   ├── components.css     # Buttons, inputs, modals, toasts, kanban, and progress rings
│   ├── dashboard.css      # KPI grids and widget card distributions
│   ├── animations.css     # Pulse glows, fade-ins, slide-ins, and keyframes
│   └── responsive.css     # Breakpoint overrides for tablets and mobiles
│
└── js/
    ├── storage.js         # LocalStorage read/write and default mock data seeds
    ├── utils.js           # Markdown parser, Web Audio chime synthesizer, and toast alerts
    ├── app.js             # Route/Tab toggler, global search, mobile menu drawer
    ├── dashboard.js       # Stats aggregates and dashboard Chart.js setups
    ├── study.js           # Study sessions logs and Pomodoro timers
    ├── notes.js           # Markdown notes filters, tag inputs, and export triggers
    ├── tasks.js           # Drag-and-drop Kanban, subtask metrics, and calendar grids
    ├── roadmap.js         # Sequential timelines checklist nodes
    ├── tracker.js         # Java, Spring Boot, MySQL, and DSA checklist metrics
    ├── projects.js        # Showcase logs, repositories, and inline subtasks
    ├── interviews.js      # Interview dates and round question logs
    ├── jobs.js            # Recruiter ATS log and pipeline success rates
    ├── analytics.js       # Detailed monthly trend lines and polar radar charts
    └── settings.js        # Profile goals, resume control, and backups JSON parser
```

---

## 💾 Storage & Data Seeding

DevTrack Pro automatically initializes a **comprehensive developer profile** on initial load. It pre-populates:
1. Four active study sessions.
2. Three highly detailed Markdown notes (Java Streams API, Spring Boot Main Annotations, System Design Rate Limiting).
3. Active Kanban boards (JWT filter development, Eureka setup, multi-stage Docker tests).
4. Synchronized Java/Spring Boot roadmap metrics.
5. Interview schedules (Stripe, Amazon) and ATS job pipelines (Capital One, Netflix).
6. rolling 7 days habits checkmarks.

To reset data or test clean setups:
* Navigate to **Settings** and click **Reset Dashboard Data**.
* Alternatively, perform a JSON export to save your progress locally.
