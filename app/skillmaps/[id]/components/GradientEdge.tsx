"use client";

import React, { useState } from "react";
import { EdgeProps, getSmoothStepPath, useNodes } from "@xyflow/react";

const colorMap: Record<string, string> = {
  done:      "#34d399",
  active:    "#f472b6",
  secondary: "#a78bfa",
  default:   "#252540",
};

const GradientEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, source, target }) => {
  const [hovered, setHovered] = useState(false);
  const nodes = useNodes();
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  const sourceStatus = (sourceNode?.data as { status?: string })?.status ?? "default";
  const targetStatus = (targetNode?.data as { status?: string })?.status ?? "default";

  const sourceColor = colorMap[sourceStatus];
  const targetColor = colorMap[targetStatus];

  const gradientId = `gradient-${id}`;

  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 0 });

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <defs>
        <linearGradient id={gradientId} x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={sourceColor} />
          <stop offset="100%" stopColor={targetColor} />
        </linearGradient>
      </defs>
      <path d={edgePath} stroke="transparent" strokeWidth={16} fill="none" />
      <path
        d={edgePath}
        stroke={`url(#${gradientId})`}
        strokeWidth={hovered ? 2.5 : 1.5}
        fill="none"
        style={{ filter: hovered ? `drop-shadow(0 0 5px ${sourceColor})` : undefined, transition: "stroke-width 0.15s" }}
      />
    </g>
  );
};

export default GradientEdge;
