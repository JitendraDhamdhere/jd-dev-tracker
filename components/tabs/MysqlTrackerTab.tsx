"use client";

import React from "react";
import { Database, CheckCircle2, Circle } from "lucide-react";
import { TechChecklist } from "@/lib/types";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface MysqlTrackerTabProps {
  checklist: TechChecklist;
  onToggleItem: (key: string) => void;
}

export const MysqlTrackerTab: React.FC<MysqlTrackerTabProps> = ({
  checklist,
  onToggleItem,
}) => {
  const topics = [
    { key: "ddl", title: "DDL: CREATE, ALTER, DROP, TRUNCATE tables", group: "SQL Core" },
    { key: "dml", title: "DML: INSERT, UPDATE, DELETE & Transactions", group: "SQL Core" },
    { key: "constraints", title: "Constraints: Primary Key, Foreign Key, UNIQUE, CHECK", group: "SQL Core" },
    { key: "joins", title: "Complex Joins: INNER, LEFT, RIGHT, FULL OUTER, CROSS", group: "Relational Queries" },
    { key: "views", title: "Database Views & Materialized Views", group: "Relational Queries" },
    { key: "normalization", title: "Normalization: 1NF, 2NF, 3NF & BCNF Normal Forms", group: "Relational Queries" },
    { key: "indexes", title: "Indexing: B-Tree Indexes, Composite, Unique & Covering", group: "Performance & Optimization" },
    { key: "tuning", title: "Query Tuning: EXPLAIN execution plans & Slow Query Logs", group: "Performance & Optimization" },
    { key: "transactions", title: "ACID Properties & Transaction Isolation Levels", group: "Transactions & Concurrency" },
    { key: "procedures", title: "Stored Procedures, Functions & Cursors", group: "Advanced DB Objects" },
    { key: "triggers", title: "Database Triggers (BEFORE / AFTER INSERT/UPDATE)", group: "Advanced DB Objects" },
    { key: "backup", title: "Backup & Recovery: mysqldump, Binary Logging", group: "DevOps & DBA" },
    { key: "replication", title: "MySQL Master-Slave & Master-Master Replication", group: "DevOps & DBA" },
  ];

  const completedCount = Object.values(checklist || {}).filter(Boolean).length;
  const percent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  const groups = Array.from(new Set(topics.map((t) => t.group)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <Database size={22} className="text-status-warning" /> MySQL & Database Tracker
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Track database design, indexing strategies, transaction isolation, and query optimization
          </p>
        </div>

        <ProgressRing
          percentage={percent}
          size={74}
          strokeColor="#f59e0b"
          label="MySQL Mastery"
        />
      </div>

      {/* Grouped Checklist */}
      <div className="space-y-6">
        {groups.map((grp) => {
          const grpTopics = topics.filter((t) => t.group === grp);
          const grpDone = grpTopics.filter((t) => checklist?.[t.key]).length;

          return (
            <div key={grp} className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-heading font-bold text-base text-text-primary">{grp}</h3>
                <span className="text-xs text-text-muted">
                  {grpDone}/{grpTopics.length} mastered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grpTopics.map((item) => {
                  const isDone = !!checklist?.[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => onToggleItem(item.key)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                        isDone
                          ? "bg-status-warning/10 border-status-warning/30"
                          : "bg-white/[0.01] border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CheckCircle2 size={18} className="text-status-success shrink-0" />
                        ) : (
                          <Circle size={18} className="text-text-muted shrink-0" />
                        )}
                        <span
                          className={`text-xs font-semibold ${
                            isDone ? "text-text-primary" : "text-text-secondary"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
