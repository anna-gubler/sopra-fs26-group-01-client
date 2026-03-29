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
    <div style={{
      background: "var(--bg-surface)",
      border: `1.5px solid ${color}`,
      borderRadius: 8,
      padding: "8px 14px",
      width: 160,
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "var(--text-bright)",
      fontSize: 12,
      fontFamily: "var(--font-inter), sans-serif",
      boxShadow: `0 0 10px ${glow}, inset 0 0 8px ${glow}`,
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {progress !== undefined && (
        <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 8, flexShrink: 0 }}>{progress}%</span>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

export default SkillNode;
