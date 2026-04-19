"use client";

import React, { useState } from "react";
import { useApiContext } from "@/context/ApiContext";
import { submitSkillRating } from "@/api/sessionApi";
import { CollaborationSession } from "@/types/session";
import styles from "@/styles/collab.module.css";
import toast from "react-hot-toast";

interface RatingIndicatorProps {
  isOwner: boolean;
  session: CollaborationSession;
  skillId: number;
}

const RatingIndicator: React.FC<RatingIndicatorProps> = ({ isOwner, session, skillId }) => {
  const api = useApiContext();
  const [rating, setRating] = useState(50);
  const [submitted, setSubmitted] = useState(false);    //only submit once per skill, per session
  const [submitting, setSubmitting] = useState(false);  //for case of slow connection, so feedback not sent twice

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitSkillRating(api, session.id, skillId, rating);
      setSubmitted(true);
      toast.success("Rating submitted!");
    } catch {
      toast.error("Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isOwner) {
    return (
      <div className={styles["rating-gauge"]}>
        <div className={styles["rating-gauge-track"]}>
          <div className={styles["rating-gauge-fill"]} style={{ width: `${session.ratingSummary ?? 0}%` }} />
          <div className={styles["rating-gauge-needle"]} style={{ left: `${session.ratingSummary ?? 0}%` }} />
        </div>
        <div className={styles["rating-gauge-labels"]}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        {session.ratingSummary !== null && (
          <p className={styles["rating-gauge-count"]}>Avg: {session.ratingSummary}%</p>
        )}
      </div>
    );
  }

  if (!session.isActive) {
    return null;
  }

  return (
    <div className={styles["rating-slider"]}>
      <input
        type="range"
        min={0}
        max={100}
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        disabled={submitted || submitting}
        className={styles["rating-slider-input"]}
      />
      <div className={styles["rating-slider-footer"]}>
        <span className={styles["rating-slider-value"]}>{rating}%</span>
        <button
          className={styles["rating-submit-btn"]}
          onClick={handleSubmit}
          disabled={submitted || submitting}
        >
          {submitted ? "Submitted ✓" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default RatingIndicator;
