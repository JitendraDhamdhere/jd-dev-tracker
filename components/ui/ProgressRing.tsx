"use client";

import React from "react";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 90,
  strokeWidth = 7,
  strokeColor = "var(--primary)",
  label,
}) => {
  const safePercent = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="rotate-[-90deg] transition-all duration-700 ease-out" width={size} height={size}>
          {/* Background Track */}
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Active Progress */}
          <circle
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              transition: "stroke-dashoffset 0.8s ease",
              filter: `drop-shadow(0 0 6px ${strokeColor})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-heading font-bold text-sm text-text-primary">
          {Math.round(safePercent)}%
        </div>
      </div>
      {label && <span className="text-xs text-text-secondary mt-2 text-center font-medium">{label}</span>}
    </div>
  );
};
