"use client";

import React from "react";
import { Leaf, CheckCircle2, Circle } from "lucide-react";
import { TechChecklist } from "@/lib/types";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface SpringTrackerTabProps {
  checklist: TechChecklist;
  onToggleItem: (key: string) => void;
}

export const SpringTrackerTab: React.FC<SpringTrackerTabProps> = ({
  checklist,
  onToggleItem,
}) => {
  const topics = [
    { key: "core", title: "Spring Core, ApplicationContext & Bean Lifecycle", group: "Framework Basics" },
    { key: "ioc", title: "IoC Container & Inversion of Control Principles", group: "Framework Basics" },
    { key: "di", title: "Dependency Injection: Field vs Constructor Injection", group: "Framework Basics" },
    { key: "mvc", title: "Spring MVC: Controller, RequestMapping, Model & View", group: "Web & REST APIs" },
    { key: "rest", title: "REST APIs: HTTP Methods, Status Codes, ResponseEntity", group: "Web & REST APIs" },
    { key: "validation", title: "Bean Validation (@Valid, Custom Validators)", group: "Web & REST APIs" },
    { key: "jpa", title: "Spring Data JPA, Hibernate, JPQL & Repositories", group: "Persistence & Data" },
    { key: "security", title: "Spring Security Filters & SecurityFilterChain", group: "Security" },
    { key: "jwt", title: "JWT Stateless Authentication & Refresh Tokens", group: "Security" },
    { key: "redis", title: "Distributed Caching with Redis & @Cacheable", group: "Enterprise Caching & Events" },
    { key: "rabbitmq", title: "RabbitMQ Message Broker & AMQP Protocol", group: "Enterprise Caching & Events" },
    { key: "kafka", title: "Apache Kafka: Producers, Consumers & Consumer Groups", group: "Enterprise Caching & Events" },
    { key: "gateway", title: "Spring Cloud Gateway, Routing & Global Filters", group: "Microservices" },
    { key: "eureka", title: "Netflix Eureka Service Discovery & Registry", group: "Microservices" },
    { key: "feign", title: "OpenFeign Declarative REST Client & Circuit Breakers", group: "Microservices" },
    { key: "docker", title: "Docker Containerization & Multi-Stage Builds", group: "DevOps & Production" },
    { key: "testing", title: "Testing: JUnit 5, Mockito & @SpringBootTest", group: "DevOps & Production" },
    { key: "actuator", title: "Spring Boot Actuator: Health, Metrics & Prometheus", group: "DevOps & Production" },
    { key: "swagger", title: "OpenAPI / Swagger API Documentation", group: "DevOps & Production" },
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
            <Leaf size={22} className="text-status-success" /> Spring Boot & Microservices Tracker
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Enterprise backend checklist for Spring Cloud, distributed caching, and microservices
          </p>
        </div>

        <ProgressRing
          percentage={percent}
          size={74}
          strokeColor="#10b981"
          label="Spring Mastery"
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
                          ? "bg-status-success/10 border-status-success/30"
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
