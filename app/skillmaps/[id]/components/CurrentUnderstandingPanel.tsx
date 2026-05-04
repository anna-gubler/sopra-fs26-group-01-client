"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CollaborationSession } from "@/types/session";
import {
  triggerCurrentUnderstanding,
  getCurrentUnderstandingResults,
  CurrentUnderstandingResult,
} from "@/api/sessionApi";
import { useApiContext } from "@/context/ApiContext";
import { ratingColor } from "./UnderstandingHeatmap";
import styles from "@/styles/collab.module.css";

const DURATION_SECONDS = 180;
const POLL_INTERVAL_MS = 3000;
const RETRIGGER_COOLDOWN_SECONDS = 30;

interface CurrentUnderstandingPanelProps {
  session: CollaborationSession;
}

const CurrentUnderstandingPanel: React.FC<CurrentUnderstandingPanelProps> = ({ session }) => {
  const api = useApiContext();
  const [triggering, setTriggering] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [results, setResults] = useState<CurrentUnderstandingResult | null>(null);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isActive = session.currentUnderstandingActive ?? false;
  const startedAt = session.currentUnderstandingStartedAt ?? null;

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

  // Poll results while active
  const fetchResults = useCallback(async () => {
    try {
      const r = await getCurrentUnderstandingResults(api, session.id);
      setResults(r);
    } catch {
      // silently ignore
    }
  }, [api, session.id]);

  useEffect(() => {
    if (!isActive || remaining <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    fetchResults();
    intervalRef.current = setInterval(fetchResults, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, remaining, fetchResults]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleTrigger = async () => {
    setTriggering(true);
    setResults(null);
    try {
      await triggerCurrentUnderstanding(api, session.id);
      setCooldown(RETRIGGER_COOLDOWN_SECONDS);
    } catch {
      // best-effort
    } finally {
      setTriggering(false);
    }
  };

  if (!isActive || remaining <= 0) {
    return (
      <button
        className={styles["btn-collab-filled"]}
        onClick={handleTrigger}
        disabled={triggering || cooldown > 0}
      >
        {triggering ? "Requesting…" : cooldown > 0 ? `Request Class Understanding Check (${cooldown}s)` : "Request Class Understanding Check"}
      </button>
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
          {results ? `${results.count} / ${results.totalStudents} responded` : "Waiting…"}
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
