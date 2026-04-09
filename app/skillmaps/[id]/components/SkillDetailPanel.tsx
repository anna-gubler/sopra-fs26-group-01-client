"use client";

import React from "react";
import { X } from "lucide-react";
import { Skill } from "@/types/skill";
import styles from "@/styles/skillmaps.module.css";

type Props = {
  skill: Skill;
  dependencies: Skill[];
  onClose: () => void;
};

const difficultyLabel: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const SkillDetailPanel: React.FC<Props> = ({ skill, dependencies, onClose }) => {
  return (
    <div className={styles["detail-panel"]}>
      <div className={styles["detail-panel-header"]}>
        <h2 className={styles["detail-panel-title"]}>{skill.name}</h2>
        <button
          className={styles["detail-panel-close"]}
          onClick={onClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {skill.difficulty && (
        <span className={`${styles["detail-panel-badge"]} ${styles[`badge-${skill.difficulty}`]}`}>
          {difficultyLabel[skill.difficulty] ?? skill.difficulty}
        </span>
      )}

      {skill.description && (
        <section className={styles["detail-panel-section"]}>
          <h3 className={styles["detail-panel-label"]}>Description</h3>
          <p className={styles["detail-panel-text"]}>{skill.description}</p>
        </section>
      )}

      {skill.resources && (
        <section className={styles["detail-panel-section"]}>
          <h3 className={styles["detail-panel-label"]}>Resources</h3>
          <p className={styles["detail-panel-text"]}>{skill.resources}</p>
        </section>
      )}

      {dependencies.length > 0 && (
        <section className={styles["detail-panel-section"]}>
          <h3 className={styles["detail-panel-label"]}>Depends on</h3>
          <ul className={styles["detail-panel-dep-list"]}>
            {dependencies.map((dep) => (
              <li key={dep.id} className={styles["detail-panel-dep-item"]}>
                {dep.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default SkillDetailPanel;
