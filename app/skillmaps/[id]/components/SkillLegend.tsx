"use client";

import React from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { Maximize2 } from "lucide-react";
import styles from "@/styles/skillmaps.module.css";

const ENTRIES = [
  { label: "Locked",  color: "var(--border-color)" },
  { label: "Easy",    color: "hsl(160, 60%, 52%)" },
  { label: "Medium",  color: "hsl(263, 70%, 58%)" },
  { label: "Hard",    color: "hsl(330, 70%, 56%)" },
];

const SkillLegend: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <Panel position="bottom-right">
      <button className={styles["recenter-btn"]} onClick={() => fitView({ padding: 0.3 })} aria-label="Recenter">
        <Maximize2 size={14} />
        Recenter
      </button>
      <div className={styles["zoom-controls"]}>
        <button className={styles["zoom-btn"]} onClick={() => zoomOut()} aria-label="Zoom out">−</button>
        <button className={styles["zoom-btn"]} onClick={() => zoomIn()} aria-label="Zoom in">+</button>
      </div>
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
};

export default SkillLegend;
