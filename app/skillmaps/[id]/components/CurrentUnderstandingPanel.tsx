"use client";

import React, { useState, useEffect, useRef } from "react";
import { CUResults } from "@/hooks/useCurrentUnderstanding";
import { useCountdown } from "@/hooks/useCountdown";
import { useCooldown } from "@/hooks/useCooldown";
import { ratingColor } from "./UnderstandingHeatmap";
import styles from "@/styles/collab.module.css";

const DURATION_SECONDS = 180;
const RETRIGGER_COOLDOWN_SECONDS = 30;

interface CurrentUnderstandingPanelProps {
  sessionId: number;
  isActive: boolean;
  startedAt: string | null;
  results: CUResults | null;
  totalStudents: number;
  onTrigger: () => Promise<void>;
  onLastAvgChange?: (avg: number | null) => void;
}

const LastCheckResult: React.FC<{ avg: number; checkedAt: string | null }> = ({ avg, checkedAt }) => (
  <div className={styles["cu-results"]} style={{ marginBottom: "10px" }}>
    <div className={styles["cu-results-header"]}>
      <span className={styles["cu-results-count"]}>Last check{checkedAt ? ` · ${checkedAt}` : ""}</span>
      <span className={styles["cu-results-avg-value"]} style={{ color: ratingColor(avg) }}>{avg}%</span>
    </div>
    <div className={styles["cu-results-bar-row"]}>
      <div className={styles["cu-results-bar-track"]}>
        <div className={styles["cu-results-bar-fill"]} style={{ width: `${avg}%`, background: ratingColor(avg) }} />
      </div>
    </div>
  </div>
);

const CurrentUnderstandingPanel: React.FC<CurrentUnderstandingPanelProps> = ({
  sessionId,
  isActive,
  startedAt,
  results,
  totalStudents,
  onTrigger,
  onLastAvgChange,
}) => {
  const [triggering, setTriggering] = useState(false);
  const [lastAvg, setLastAvg] = useState<number | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const savedRef = useRef<string | null>(null);
  const lsKey = `cu_last_avg_${sessionId}`;
  const lsTimeKey = `cu_last_time_${sessionId}`;

  const remaining = useCountdown(isActive ? startedAt : null, DURATION_SECONDS);
  const [cooldown, startCooldown] = useCooldown(RETRIGGER_COOLDOWN_SECONDS);

  // Load persisted last-check result on mount
  useEffect(() => {
    const stored = localStorage.getItem(lsKey);
    if (stored !== null) {
      const val = Number(stored);
      if (!Number.isNaN(val)) {
        setLastAvg(val);
        onLastAvgChange?.(val);
      }
    }
    const storedTime = localStorage.getItem(lsTimeKey);
    if (storedTime) setLastCheckedAt(storedTime);
  }, [sessionId]);

  // Persist last avg + timestamp when timer expires
  useEffect(() => {
    if (!isActive && remaining === 0 && startedAt && savedRef.current !== startedAt && results && results.count > 0) {
      savedRef.current = startedAt;
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      localStorage.setItem(lsKey, String(results.avg));
      localStorage.setItem(lsTimeKey, now);
      setLastAvg(results.avg);
      setLastCheckedAt(now);
      onLastAvgChange?.(results.avg);
    }
  }, [isActive, remaining, startedAt, results]);

  const handleTrigger = async () => {
    setTriggering(true);
    savedRef.current = null;
    localStorage.removeItem(lsKey);
    localStorage.removeItem(lsTimeKey);
    setLastAvg(null);
    setLastCheckedAt(null);
    onLastAvgChange?.(null);
    try {
      await onTrigger();
      startCooldown();
    } catch {
      // best-effort
    } finally {
      setTriggering(false);
    }
  };

  if (!isActive || remaining <= 0) {
    return (
      <>
        {lastAvg !== null && <LastCheckResult avg={lastAvg} checkedAt={lastCheckedAt} />}
        <button
          className={styles["btn-collab-filled"]}
          onClick={handleTrigger}
          disabled={triggering || cooldown > 0}
        >
          {triggering ? "Requesting…" : cooldown > 0 ? `Request Class Understanding Check (${cooldown}s)` : "Request Class Understanding Check"}
        </button>
      </>
    );
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className={styles["cu-results"]}>
      <div className={styles["cu-results-header"]}>
        <span className={styles["cu-timer"]}>{timeStr} remaining</span>
        <span className={styles["cu-results-count"]}>
          {results
            ? `${results.count}${totalStudents > 0 ? ` / ${totalStudents}` : ""} responded`
            : "Waiting…"}
        </span>
      </div>
      {results && results.count > 0 ? (
        <div className={styles["cu-results-bar-row"]}>
          <div className={styles["cu-results-bar-track"]}>
            <div
              className={styles["cu-results-bar-fill"]}
              style={{ width: `${results.avg}%`, background: ratingColor(results.avg) }}
            />
          </div>
          <span
            className={styles["cu-results-avg-value"]}
            style={{ color: ratingColor(results.avg) }}
          >
            {results.avg}%
          </span>
        </div>
      ) : (
        <p className={styles["collab-panel-placeholder"]}>No responses yet.</p>
      )}
    </div>
  );
};

export default CurrentUnderstandingPanel;
