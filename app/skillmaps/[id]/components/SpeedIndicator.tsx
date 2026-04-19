"use client";

import React, { useState, useEffect } from "react";
import { useApiContext } from "@/context/ApiContext";
import { submitSpeedFeedback, SpeedFeedback } from "@/api/sessionApi";
import { CollaborationSession } from "@/types/session";
import styles from "@/styles/collab.module.css";
import toast from "react-hot-toast";

interface SpeedIndicatorProps {
  isOwner: boolean;
  session: CollaborationSession;
  skillMapId: number;
}

const SPEED_OPTIONS: { value: SpeedFeedback; label: string }[] = [
  { value: "TOO_SLOW", label: "Too Slow" },
  { value: "OK", label: "Just Right" },
  { value: "TOO_FAST", label: "Too Fast" },
];


const SpeedIndicator: React.FC<SpeedIndicatorProps> = ({ isOwner, session: _session, skillMapId }) => {
  const api = useApiContext();
  const [selected, setSelected] = useState<SpeedFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (value: SpeedFeedback) => {
    if (submitting || selected === value) return;
    setSelected(value);
    setSubmitting(true);
    try {
      await submitSpeedFeedback(api, skillMapId, value);
    } catch {
      toast.error("Failed to submit speed feedback.");
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  };

  // TODO: remove mock data — replace counts with aggregated values from session
  const MOCK_SEQUENCE: SpeedFeedback[] = ["TOO_FAST", "TOO_FAST", "TOO_FAST", "TOO_FAST", "OK", "TOO_FAST", "TOO_FAST"];
  const [counts, setCounts] = useState<Record<SpeedFeedback, number>>({ TOO_SLOW: 0, OK: 1, TOO_FAST: 5 });
  const [mockIndex, setMockIndex] = useState(0);

  useEffect(() => {
    if (!isOwner) return;
    if (mockIndex >= MOCK_SEQUENCE.length) return;
    const timer = setTimeout(() => {
      setCounts((c) => ({ ...c, [MOCK_SEQUENCE[mockIndex]]: c[MOCK_SEQUENCE[mockIndex]] + 1 }));
      setMockIndex((i) => i + 1);
    }, 1800);
    return () => clearTimeout(timer);
  }, [isOwner, mockIndex]);

  if (isOwner) {
    const total = counts.TOO_SLOW + counts.OK + counts.TOO_FAST;
    // weighted score: TOO_SLOW=0, OK=50, TOO_FAST=100
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
      {SPEED_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          className={`${styles["speed-btn"]} ${styles[`speed-btn--${value}`]} ${selected === value ? styles["speed-btn--selected"] : ""}`}
          onClick={() => handleSelect(value)}
          disabled={submitting}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default SpeedIndicator;
