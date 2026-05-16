"use client";

import React, { useState, useEffect, useRef } from "react";
import { CUResults } from "@/hooks/useCurrentUnderstanding";
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
  const [cooldown, setCooldown] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [lastAvg, setLastAvg] = useState<number | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const savedRef = useRef<string | null>(null);
  const lsKey = `cu_last_avg_${sessionId}`;
  const lsTimeKey = `cu_last_time_${sessionId}`;

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

  // Countdown timer
  useEffect(() => {
    if (!isActive || !startedAt) {
      setRemaining(0);
      return;
    }
    const update = () => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      setRemaining(Math.max(0, Math.round(DURATION_SECONDS - elapsed)));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isActive, startedAt]);

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

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

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
      setCooldown(RETRIGGER_COOLDOWN_SECONDS);
    } catch {
      // best-effort
    } finally {
      setTriggering(false);
    }
  };

  if (!isActive || remaining <= 0) {
    return (
      <>
        {lastAvg !== null && (
          <div className={styles["cu-results"]} style={{ marginBottom: "10px" }}>
            <div className={styles["cu-results-header"]}>
              <span className={styles["cu-results-count"]}>Last check{lastCheckedAt ? ` · ${lastCheckedAt}` : ""}</span>
              <span className={styles["cu-results-avg-value"]} style={{ color: ratingColor(lastAvg) }}>{lastAvg}%</span>
            </div>
            <div className={styles["cu-results-bar-row"]}>
              <div className={styles["cu-results-bar-track"]}>
                <div className={styles["cu-results-bar-fill"]} style={{ width: `${lastAvg}%`, background: ratingColor(lastAvg) }} />
              </div>
            </div>
          </div>
        )}
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
