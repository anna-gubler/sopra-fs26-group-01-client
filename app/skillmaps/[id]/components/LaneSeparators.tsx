"use client";

import React from "react";
import { useStore } from "@xyflow/react";
import styles from "@/styles/skillmaps.module.css";

type LaneSeparatorsProps = {
  levels: number;
  laneHeight: number;
};

const LaneSeparators: React.FC<LaneSeparatorsProps> = ({ levels, laneHeight }) => {
  const [, ty, zoom] = useStore((s) => s.transform);

  return (
    <svg className={styles["lane-svg"]}>
      {Array.from({ length: levels }, (_, i) => {
        const lineY = i * laneHeight * zoom + ty;
        return (
          <g key={i}>
            <line
              x1={0}
              y1={lineY}
              x2="100%"
              y2={lineY}
              stroke="var(--border-color)"
              strokeWidth={1}
            />
            <text
              x={16}
              y={lineY + 14}
              fill="var(--text-muted)"
              fontSize={10}
              fontWeight={600}
              letterSpacing={1}
              className={styles["lane-label"]}
            >
              Level {levels - i}
            </text>
          </g>
        );
      })}
      <line
        x1={0}
        y1={levels * laneHeight * zoom + ty}
        x2="100%"
        y2={levels * laneHeight * zoom + ty}
        stroke="var(--border-color)"
        strokeWidth={1}
      />
    </svg>
  );
};

export default LaneSeparators;
