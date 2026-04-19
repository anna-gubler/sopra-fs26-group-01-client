"use client";

import React from "react";
import { Skill } from "@/types/skill";
import { RatingAggregate } from "@/hooks/useSessionRatings";
import styles from "@/styles/collab.module.css";

export function ratingColor(avg: number): string {
  if (avg <= 20) return "#f63f50";
  if (avg <= 40) return "#f97706";
  if (avg <= 60) return "#fbbf24";
  if (avg <= 80) return "#a3e635";
  return "#54d596";
}

interface UnderstandingHeatmapProps {
  aggregated: Map<number, RatingAggregate>;
  skills: Skill[];
  totalStudents: number;
  onSkillClick?: (skill: Skill) => void;
}

const UnderstandingHeatmap: React.FC<UnderstandingHeatmapProps> = ({
  aggregated,
  skills,
  totalStudents,
  onSkillClick,
}) => {
  if (aggregated.size === 0) {
    return (
      <p className={styles["collab-panel-placeholder"]}>
        Skill ratings will appear here during the session.
      </p>
    );
  }

  const cards = skills
    .filter((s) => aggregated.has(s.id))
    .map((s) => {
      const { avg, count } = aggregated.get(s.id)!;
      return { id: s.id, name: s.name, avg, count };
    })
    .sort((a, b) => a.avg - b.avg);

  return (
    <div className={styles["heatmap-grid"]}>
      {cards.map((card) => {
        const color = ratingColor(card.avg);
        return (
          <div
            key={card.id}
            className={styles["heatmap-card"]}
            style={onSkillClick ? { cursor: "pointer" } : undefined}
            onClick={() => onSkillClick?.(skills.find((s) => s.id === card.id)!)}
          >
            <div className={styles["heatmap-card__header"]}>
              <span className={styles["heatmap-card__name"]}>{card.name}</span>
              <span className={styles["heatmap-card__avg"]} style={{ color }}>
                {card.avg}%
              </span>
            </div>
            <span className={styles["heatmap-card__count"]}>
              {card.count}/{totalStudents} rated
            </span>
            <div className={styles["heatmap-card__bar-track"]}>
              <div
                className={styles["heatmap-card__bar-fill"]}
                style={{ width: `${card.avg}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UnderstandingHeatmap;
