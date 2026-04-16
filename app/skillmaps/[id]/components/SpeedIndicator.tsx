"use client";

import React, { useState } from "react";
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

const SPEED_LABEL: Record<SpeedFeedback, string> = {
  TOO_SLOW: "Too Slow",
  OK: "Just Right",
  TOO_FAST: "Too Fast",
};

const SpeedIndicator: React.FC<SpeedIndicatorProps> = ({ isOwner, session, skillMapId }) => {
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

  if (isOwner) {
    const feedback = session.speedFeedback as SpeedFeedback | null;
    return (
      <div className={styles["speed-display"]}>
        {feedback ? (
          <span className={`${styles["speed-badge"]} ${styles[`speed-badge--${feedback}`]}`}>
            {SPEED_LABEL[feedback]}
          </span>
        ) : (
          <p className={styles["collab-panel-placeholder"]}>No speed feedback yet.</p>
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
