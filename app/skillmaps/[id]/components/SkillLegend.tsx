"use client";

import React from "react";
import { Panel } from "@xyflow/react";
import styles from "@/styles/skillmaps.module.css";

const ENTRIES = [
  { label: "Locked",  color: "var(--border-color)" },
  { label: "Easy",    color: "hsl(160, 60%, 52%)" },
  { label: "Medium",  color: "hsl(263, 70%, 58%)" },
  { label: "Hard",    color: "hsl(330, 70%, 56%)" },
];

const SkillLegend: React.FC = () => (
  <Panel position="bottom-right">
    <div className={styles["skill-legend"]}>
      {ENTRIES.map(({ label, color }) => (
        <div key={label} className={styles["skill-legend-item"]}>
          <span className={styles["skill-legend-dot"]} style={{ background: color }} />
          <span className={styles["skill-legend-label"]}>{label}</span>
        </div>
      ))}
    </div>
  </Panel>
);

export default SkillLegend;
