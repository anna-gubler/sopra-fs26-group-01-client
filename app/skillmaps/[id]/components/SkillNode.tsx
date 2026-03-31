"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

type SkillNodeData = {
  label: string;
  progress?: number;
  status?: "done" | "active" | "secondary" | "default";
};

const borderColor: Record<string, string> = {
  done:      "var(--accent)",
  active:    "var(--primary)",
  secondary: "var(--secondary)",
  default:   "var(--border-color)",
};

const glowColor: Record<string, string> = {
  done:      "hsla(160, 60%, 52%, 0.35)",
  active:    "hsla(263, 70%, 58%, 0.35)",
  secondary: "hsla(330, 70%, 56%, 0.35)",
  default:   "transparent",
};

const SkillNode: React.FC<NodeProps> = ({ data }) => {
  const { label, progress, status = "default" } = data as SkillNodeData;
  const color = borderColor[status];
  const glow = glowColor[status];

  return (
    <div
      className="skill-node"
      style={{
        "--skill-node-color": color,
        "--skill-node-glow": glow,
      } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Top} className="skill-node-handle" />
      <span className="skill-node__dot" />
      <span className="skill-node__label">{label}</span>
      {progress !== undefined && (
        <span className="skill-node__progress">{progress}%</span>
      )}
      <Handle type="source" position={Position.Bottom} className="skill-node-handle" />
    </div>
  );
};

export default SkillNode;
