"use client";

import React from "react";
import { Skill } from "@/types/skill";
import { DashboardQuizSummary } from "@/types/quiz";
import { ratingColor } from "./UnderstandingHeatmap";
import styles from "@/styles/collab.module.css";

interface QuizResultsPanelProps {
  results: DashboardQuizSummary[];
  skills: Skill[];
}

const QuizResultsPanel: React.FC<QuizResultsPanelProps> = ({ results, skills }) => {
  if (results.length === 0) {
    return (
      <p className={styles["collab-panel-placeholder"]}>
        Quiz results will appear here as students submit.
      </p>
    );
  }

  const cards = results
    .map((r) => ({
      ...r,
      skillName: skills.find((s) => s.id === r.skillId)?.name ?? `Skill ${r.skillId}`,
    }))
    .sort((a, b) => a.averageScore - b.averageScore);

  return (
    <div className={styles["heatmap-grid"]}>
      {cards.map((card) => {
        const color = ratingColor(card.averageScore);
        return (
          <div key={card.quizId} className={styles["heatmap-card"]}>
            <div className={styles["heatmap-card__header"]}>
              <span className={styles["heatmap-card__name"]}>{card.skillName}</span>
              <span className={styles["heatmap-card__avg"]} style={{ color }}>
                {Math.round(card.averageScore)}%
              </span>
            </div>
            <span className={styles["heatmap-card__count"]}>
              {card.totalAttempts} attempt{card.totalAttempts !== 1 ? "s" : ""}
            </span>
            <div className={styles["heatmap-card__bar-track"]}>
              <div
                className={styles["heatmap-card__bar-fill"]}
                style={{ width: `${card.averageScore}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuizResultsPanel;
