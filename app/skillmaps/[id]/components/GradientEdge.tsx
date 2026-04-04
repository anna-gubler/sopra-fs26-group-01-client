"use client";

import React from "react";
import { EdgeProps, getSmoothStepPath, useNodes } from "@xyflow/react";

const colorMap: Record<string, string> = {
  done:      "hsl(160, 60%, 52%)",
  active:    "hsl(263, 70%, 58%)",
  secondary: "hsl(330, 70%, 56%)",
  default:   "hsl(258, 24%, 22%)",
};

const GradientEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, source, target }) => {
  const nodes = useNodes();
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  const sourceStatus = (sourceNode?.data as { status?: string })?.status ?? "default";
  const targetStatus = (targetNode?.data as { status?: string })?.status ?? "default";

  const sourceColor = colorMap[sourceStatus];
  const targetColor = colorMap[targetStatus];

  const gradientId = `gradient-${id}`;

  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, borderRadius: 0 });

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={sourceColor} />
          <stop offset="100%" stopColor={targetColor} />
        </linearGradient>
      </defs>
      <path d={edgePath} stroke={`url(#${gradientId})`} strokeWidth={1.5} fill="none" />
    </>
  );
};

export default GradientEdge;
