"use client";

import React from "react";
import { Question } from "@/types/question";
import { Skill } from "@/types/skill";
import styles from "@/styles/collab.module.css";

interface LiveQuestionsPanelProps {
  questions: Question[];
  skills: Skill[];
}

const LiveQuestionsPanel: React.FC<LiveQuestionsPanelProps> = ({ questions, skills }) => {
  const active = questions.filter((q) => !q.isAddressed);

  if (active.length === 0) {
    return <p className={styles["collab-panel-placeholder"]}>No questions yet.</p>;
  }

  const skillNameMap = Object.fromEntries(skills.map((s) => [s.id, s.name]));

  const grouped = active.reduce<Record<number, Question[]>>((acc, q) => {
    if (!acc[q.skillId]) acc[q.skillId] = [];
    acc[q.skillId].push(q);
    return acc;
  }, {});

  const sortedSkillIds = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => {
      const levelA = skills.find((s) => s.id === a)?.level ?? 0;
      const levelB = skills.find((s) => s.id === b)?.level ?? 0;
      return levelA - levelB;
    });

  return (
    <div className={styles["qa-list"]}>
      {sortedSkillIds.map((skillId) => {
        const group = grouped[skillId].slice().sort((a, b) => b.upvotes - a.upvotes);
        return (
          <div key={skillId} className={styles["qa-skill-group"]}>
            <div className={styles["qa-skill-name"]}>
              {skillNameMap[skillId] ?? `Skill #${skillId}`}
            </div>
            {group.map((q) => (
              <div key={q.id} className={styles["qa-item"]}>
                <span className={styles["qa-upvotes"]}>{q.upvotes}</span>
                <span className={styles["qa-text"]}>{q.text}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default LiveQuestionsPanel;
