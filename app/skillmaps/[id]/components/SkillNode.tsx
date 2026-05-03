"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import clsx from "clsx";
import styles from "@/styles/skill-node.module.css";

type SkillNodeData = {
  label: string;
  progress?: number;
  status?: "done" | "active" | "secondary" | "default";
  glowColor?: string;
  heatPercent?: number;
  isLocked?: boolean;
};

const SkillNode: React.FC<NodeProps> = ({ data }) => {
  const { label, progress, status = "default", glowColor, heatPercent, isLocked } = data as SkillNodeData;
  const resolvedStatus = isLocked ? "locked" : status;

  const glowStyle = glowColor
    ? { boxShadow: `0 0 22px 7px ${glowColor}88, 0 0 7px 2px ${glowColor}bb` }
    : undefined;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {heatPercent !== undefined && glowColor && (
        <div style={{
          position: "absolute",
          top: "-22px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "11px",
          fontWeight: 700,
          color: glowColor,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          textShadow: `0 0 8px ${glowColor}99`,
        }}>
          {heatPercent}%
        </div>
      )}
      <div className={clsx(styles["skill-node"], styles[`status-${resolvedStatus}`])} style={glowStyle}>
        <Handle type="source" position={Position.Top} className={styles["skill-node-handle"]} />
        <span className={styles["skill-node__dot"]} />
        <span className={styles["skill-node__label"]}>{label}</span>
        {progress !== undefined && (
          <span className={styles["skill-node__progress"]}>{progress}%</span>
        )}
        <Handle type="target" position={Position.Bottom} className={styles["skill-node-handle"]} />
      </div>
    </div>
  );
};

export default SkillNode;
