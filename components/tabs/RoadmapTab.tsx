"use client";

import React from "react";
import { Milestone, CheckCircle2, Circle, ArrowDown, Award } from "lucide-react";
import { RoadmapNode } from "@/lib/types";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface RoadmapTabProps {
  nodes: RoadmapNode[];
  onToggleNode: (id: string) => void;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ nodes, onToggleNode }) => {
  const completedCount = nodes.filter((n) => n.completed).length;
  const percent = nodes.length > 0 ? Math.round((completedCount / nodes.length) * 100) : 0;

  const categories = Array.from(new Set(nodes.map((n) => n.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary flex items-center gap-2">
            <Milestone size={22} className="text-brand-primary" /> Backend Developer Career Roadmap
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Standard sequential progression from Java Core to Enterprise Distributed Systems
          </p>
        </div>

        <div className="flex items-center gap-6">
          <ProgressRing
            percentage={percent}
            size={74}
            strokeColor="#3b82f6"
            label="Roadmap Done"
          />
        </div>
      </div>

      {/* Grouped Roadmap Stages */}
      <div className="space-y-6">
        {categories.map((cat, catIdx) => {
          const catNodes = nodes.filter((n) => n.category === cat);
          const catCompleted = catNodes.filter((n) => n.completed).length;

          return (
            <div key={cat} className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-brand-primary/20 text-brand-primary font-bold text-xs flex items-center justify-center">
                    0{catIdx + 1}
                  </span>
                  <h3 className="font-heading font-bold text-base text-text-primary">{cat}</h3>
                </div>
                <span className="text-xs text-text-muted">
                  {catCompleted}/{catNodes.length} completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catNodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => onToggleNode(node.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                      node.completed
                        ? "bg-brand-primary/10 border-brand-primary/30 shadow-glow"
                        : "bg-white/[0.01] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {node.completed ? (
                        <CheckCircle2 size={18} className="text-status-success shrink-0" />
                      ) : (
                        <Circle size={18} className="text-text-muted shrink-0" />
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          node.completed ? "text-text-primary" : "text-text-secondary"
                        }`}
                      >
                        {node.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
