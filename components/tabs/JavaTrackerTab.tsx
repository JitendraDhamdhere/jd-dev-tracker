"use client";

import React from "react";
import { Code2, CheckCircle2, Circle, Award } from "lucide-react";
import { TechChecklist } from "@/lib/types";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface JavaTrackerTabProps {
  checklist: TechChecklist;
  onToggleItem: (key: string) => void;
}

export const JavaTrackerTab: React.FC<JavaTrackerTabProps> = ({
  checklist,
  onToggleItem,
}) => {
  const topics = [
    { key: "basics", title: "Java Syntax, Types & Control Flow", group: "Language Fundamentals" },
    { key: "oop", title: "OOP: Polymorphism, Inheritance & Abstraction", group: "Language Fundamentals" },
    { key: "collections", title: "Collections: List, Set, Map, HashMap Internals", group: "Collections & Generics" },
    { key: "generics", title: "Generics: Type Erasure & Wildcards", group: "Collections & Generics" },
    { key: "exceptions", title: "Exceptions: Checked vs Unchecked & Try-with-Resources", group: "Collections & Generics" },
    { key: "streams", title: "Streams API: map, filter, flatMap, reduce, collectors", group: "Modern Java (8-21)" },
    { key: "lambdas", title: "Functional Interfaces & Method References", group: "Modern Java (8-21)" },
    { key: "annotations", title: "Custom Annotations & Reflection API", group: "Modern Java (8-21)" },
    { key: "multithreading", title: "Thread Lifecycle, Runnable & Callable", group: "Concurrency & JVM" },
    { key: "executor", title: "ExecutorService, ThreadPools & CompletableFuture", group: "Concurrency & JVM" },
    { key: "concurrency", title: "Locks, Synchronized & ConcurrentHashMap", group: "Concurrency & JVM" },
    { key: "jvm", title: "JVM Architecture: ClassLoader, Bytecode Execution", group: "Concurrency & JVM" },
    { key: "memory", title: "Memory Model: Heap vs Stack, Metaspace", group: "Concurrency & JVM" },
    { key: "gc", title: "Garbage Collection: G1, ZGC, Memory Leaks", group: "Concurrency & JVM" },
    { key: "design_patterns", title: "Design Patterns: Singleton, Factory, Builder, Observer", group: "Architecture" },
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
            <Code2 size={22} className="text-brand-primary" /> Java Core Skill Tracker
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Track deep mastery over Java language mechanics, concurrency, and JVM architecture
          </p>
        </div>

        <ProgressRing
          percentage={percent}
          size={74}
          strokeColor="#3b82f6"
          label="Java Mastery"
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
                          ? "bg-brand-primary/10 border-brand-primary/30"
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
