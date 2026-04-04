"use client";

import React from "react";
import { useStore } from "@xyflow/react";

type Props = {
  levels: number;
  laneHeight: number;
};

const LaneSeparators: React.FC<Props> = ({ levels, laneHeight }) => {
  const [, ty, zoom] = useStore((s) => s.transform);

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 0,
      }}
    >
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
              style={{ textTransform: "uppercase", fontFamily: "inherit" }}
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
