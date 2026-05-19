"use client";

import React from "react";
import { RatingAggregate } from "@/hooks/useSessionRatings";
import styles from "@/styles/collab.module.css";

interface SessionStatsBarProps {
  aggregated: Map<number, RatingAggregate>;
  totalStudents: number;
  lastCuAvg?: number | null;
}

const SessionStatsBar: React.FC<SessionStatsBarProps> = ({ aggregated, totalStudents, lastCuAvg }) => {
  const values = Array.from(aggregated.values());

  const classAvg =
    values.length > 0
      ? Math.round(values.reduce((sum, v) => sum + v.avg, 0) / values.length)
      : null;

  const totalRatings = values.reduce((sum, v) => sum + v.count, 0);

  return (
    <div className={styles["stats-bar"]}>
      <div className={styles["stat-card"]}>
        <span className={styles["stat-card__label"]}>Students</span>
        <span className={styles["stat-card__value"]}>{totalStudents}</span>
        <span className={styles["stat-card__sub"]}>in session</span>
      </div>

      <div className={styles["stat-card"]}>
        <span className={styles["stat-card__label"]}>Class Average</span>
        <span className={styles["stat-card__value"]}>
          {classAvg !== null ? `${classAvg}%` : "—"}
        </span>
        <span className={styles["stat-card__sub"]}>across all skills</span>
      </div>

      <div className={styles["stat-card"]}>
        <span className={styles["stat-card__label"]}>Last current understanding average</span>
        <span className={styles["stat-card__value"]}>
          {lastCuAvg != null ? `${Math.round(lastCuAvg)}%` : "—"}
        </span>
        <span className={styles["stat-card__sub"]}>&nbsp;</span>
      </div>

      <div className={styles["stat-card"]}>
        <span className={styles["stat-card__label"]}>Total Ratings</span>
        <span className={styles["stat-card__value"]}>{totalRatings > 0 ? totalRatings : "—"}</span>
        <span className={styles["stat-card__sub"]}>received so far</span>
      </div>
    </div>
  );
};

export default SessionStatsBar;
