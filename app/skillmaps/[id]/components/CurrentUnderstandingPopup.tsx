"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CollaborationSession } from "@/types/session";
import { submitCurrentUnderstanding } from "@/api/sessionApi";
import { useApiContext } from "@/context/ApiContext";
import UnderstandingSlider from "./UnderstandingSlider";
import styles from "@/styles/collab.module.css";

const DURATION_SECONDS = 180;

interface CurrentUnderstandingPopupProps {
  session: CollaborationSession;
}

const CurrentUnderstandingPopup: React.FC<CurrentUnderstandingPopupProps> = ({ session }) => {
  const api = useApiContext();
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_SECONDS);
  const lastStartedAtRef = useRef<string | null | undefined>(undefined);

  const isActive = session.currentUnderstandingActive ?? false;
  const startedAt = session.currentUnderstandingStartedAt ?? null;

  // Reset state whenever a new request is triggered
  useEffect(() => {
    if (startedAt !== lastStartedAtRef.current) {
      lastStartedAtRef.current = startedAt;
      setSubmitted(false);
      setRating(0);
    }
  }, [startedAt]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || !startedAt) return;
    const update = () => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      setRemaining(Math.max(0, Math.round(DURATION_SECONDS - elapsed)));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isActive, startedAt]);

  const handleSubmit = useCallback(async () => {
    try {
      await submitCurrentUnderstanding(api, session.id, rating);
      setSubmitted(true);
    } catch {
      // best-effort
    }
  }, [api, session.id, rating]);

  if (!isActive || remaining <= 0) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className={styles["cu-popup"]}>
      <div className={styles["cu-popup-inner"]}>
        <div className={styles["cu-popup-header"]}>
          <span className={styles["cu-popup-title"]}>Understanding Check</span>
          <span className={styles["cu-timer"]}>{timeStr}</span>
        </div>
        <p className={styles["cu-popup-subtitle"]}>
          {submitted
            ? "Response submitted. You can update it before time runs out."
            : "How well are you following the class overall?"}
        </p>
        <UnderstandingSlider value={rating} onChange={setRating} />
        <button
          className={styles["cu-submit-btn"]}
          onClick={handleSubmit}
          disabled={rating === 0}
        >
          {submitted ? "Update" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default CurrentUnderstandingPopup;
