"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import clsx from "clsx";
import styles from "@/styles/skill-node.module.css";

type SkillNodeData = {
  label: string;
  progress?: number;
  status?: "done" | "active" | "secondary" | "default";
};

const SkillNode: React.FC<NodeProps> = ({ data }) => {
  const { label, progress, status = "default" } = data as SkillNodeData;

  return (
    <div className={clsx(styles["skill-node"], styles[`status-${status}`])}>
      <Handle type="target" position={Position.Top} className={styles["skill-node-handle"]} />
      <span className={styles["skill-node__dot"]} />
      <span className={styles["skill-node__label"]}>{label}</span>
      {progress !== undefined && (
        <span className={styles["skill-node__progress"]}>{progress}%</span>
      )}
      <Handle type="source" position={Position.Bottom} className={styles["skill-node-handle"]} />
    </div>
  );
};

export default SkillNode;
