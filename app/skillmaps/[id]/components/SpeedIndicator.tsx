"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApiContext } from "@/context/ApiContext";
import { submitSpeedFeedback, getSpeedCounts, SpeedCounts, SpeedFeedback } from "@/api/sessionApi";
import { CollaborationSession } from "@/types/session";
import styles from "@/styles/collab.module.css";
import toast from "react-hot-toast";

interface SpeedIndicatorProps {
  isOwner: boolean;
  session: CollaborationSession;
}

const SPEED_OPTIONS: { value: SpeedFeedback; label: string }[] = [
  { value: "TOO_SLOW", label: "Too Slow" },
  { value: "OK", label: "Just Right" },
  { value: "TOO_FAST", label: "Too Fast" },
];

const POLL_INTERVAL_MS = 3000;

const SpeedIndicator: React.FC<SpeedIndicatorProps> = ({ isOwner, session }) => {
  const api = useApiContext();
  const [selected, setSelected] = useState<SpeedFeedback | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [speedCounts, setSpeedCounts] = useState<SpeedCounts | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOwner) return;
    const fetch = () => getSpeedCounts(api, session.id).then(setSpeedCounts).catch(() => {});
    fetch();
    intervalRef.current = setInterval(fetch, POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [api, isOwner, session.id]);

  const handleSelect = async (value: SpeedFeedback) => {
    if (submitting || selected === value) return;
    setSelected(value);
    setSubmitted(false);
    setSubmitting(true);
    try {
      await submitSpeedFeedback(api, session.id, value);
      setSubmitted(true);
      toast.success("Speed feedback submitted!");
    } catch {
      toast.error("Failed to submit speed feedback.");
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  };

  const counts: Record<SpeedFeedback, number> = {
    TOO_SLOW: speedCounts?.tooSlow ?? 0,
    TOO_FAST: speedCounts?.tooFast ?? 0,
    OK: speedCounts ? speedCounts.totalResponses - speedCounts.tooSlow - speedCounts.tooFast : 0,
  };

  if (isOwner) {
    const total = counts.TOO_SLOW + counts.OK + counts.TOO_FAST;
    const score = total === 0 ? 50 : (counts.OK * 50 + counts.TOO_FAST * 100) / total;
    const isWarn = score > 75 || score < 25;
    const fillLeft = Math.min(50, score);
    const fillWidth = Math.abs(score - 50);
    return (
      <div className={styles["speed-gauge"]}>
        <div className={styles["speed-gauge-track"]}>
          <div
            className={`${styles["speed-gauge-fill"]} ${isWarn ? styles["speed-gauge-fill--warn"] : ""}`}
            style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
          />
          <div className={styles["speed-gauge-marker"]} style={{ left: "25%" }} />
          <div className={styles["speed-gauge-marker"]} style={{ left: "75%" }} />
          <div className={styles["speed-gauge-needle"]} style={{ left: `${score}%` }} />
        </div>
        <div className={styles["speed-gauge-labels"]}>
          <span>Too Slow</span>
          <span>Just Right</span>
          <span>Too Fast</span>
        </div>
        {total > 0 && (
          <p className={styles["speed-gauge-count"]}>{total} response{total !== 1 ? "s" : ""}</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles["speed-buttons"]}>
      {SPEED_OPTIONS.map(({ value, label }) => {
        const isSelected = selected === value;
        return (
          <button
            key={value}
            className={`${styles["speed-btn"]} ${styles[`speed-btn--${value}`]} ${isSelected ? styles["speed-btn--selected"] : ""} ${isSelected && submitted ? styles["speed-btn--submitted"] : ""}`}
            onClick={() => handleSelect(value)}
            disabled={submitting}
          >
            {isSelected && submitted ? `✓ ${label}` : label}
          </button>
        );
      })}
    </div>
  );
};

export default SpeedIndicator;
