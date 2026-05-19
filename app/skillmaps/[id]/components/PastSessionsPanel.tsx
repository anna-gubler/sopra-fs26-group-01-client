"use client";

import React, { useEffect, useState } from "react";
import { X, RotateCcw, Clock } from "lucide-react";
import { ApiService } from "@/api/apiService";
import { getPastSessions, restartSession } from "@/api/sessionApi";
import { CollaborationSession } from "@/types/session";
import { ApplicationError } from "@/types/error";
import styles from "@/styles/skillmaps.module.css";
import toast from "react-hot-toast";

interface PastSessionsPanelProps {
  skillMapId: number;
  api: ApiService;
  onClose: () => void;
  onRestarted: (session: CollaborationSession) => void;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("de-DE")} · ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatDuration(startedAt: string, endedAt: string | null) {
  if (!endedAt) return "—";
  const minutes = Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000);
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const PastSessionsPanel: React.FC<PastSessionsPanelProps> = ({ skillMapId, api, onClose, onRestarted }) => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState<number | null>(null);

  useEffect(() => {
    getPastSessions(api, skillMapId)
      .then(setSessions)
      .catch(() => toast.error("Failed to load past sessions."))
      .finally(() => setLoading(false));
  }, [api, skillMapId]);

  const handleRestart = async (session: CollaborationSession) => {
    setRestarting(session.id);
    try {
      const restarted = await restartSession(api, skillMapId, session.id);
      toast.success("Session restarted!");
      onRestarted(restarted);
      onClose();
    } catch (err) {
      const status = (err as ApplicationError).status;
      if (status === 409) toast.error("A session is already active for this map.");
      else if (status === 403) toast.error("You don't have permission to restart this session.");
      else toast.error("Failed to restart session.");
    } finally {
      setRestarting(null);
    }
  };

  return (
    <div className={styles["sessions-panel"]}>
      <button className={styles["detail-panel-close"]} onClick={onClose} aria-label="Close panel">
        <X size={18} />
      </button>

      <div className={styles["sessions-panel-header"]}>
        <Clock size={15} />
        <h2 className={styles["sessions-panel-title"]}>Past Sessions</h2>
      </div>

      {loading && (
        <p className={styles["detail-panel-placeholder"]}>Loading...</p>
      )}

      {!loading && sessions.length === 0 && (
        <p className={styles["detail-panel-placeholder"]}>No past sessions yet.</p>
      )}

      {!loading && sessions.length > 0 && (
        <div className={styles["sessions-list"]}>
          {sessions.map((session, index) => (
            <button
              key={session.id}
              className={styles["session-item"]}
              onClick={() => handleRestart(session)}
              disabled={restarting === session.id}
            >
              <div className={styles["session-item-info"]}>
                <span className={styles["session-item-number"]}>
                  Session #{sessions.length - index}
                </span>
                <span className={styles["session-item-date"]}>
                  {formatDateTime(session.startedAt)}
                </span>
                <span className={styles["session-item-duration"]}>
                  {formatDuration(session.startedAt, session.endedAt)}
                </span>
                {session.ratingSummary > 0 && (
                  <span className={styles["session-item-rating"]}>
                    Avg. understanding: {session.ratingSummary}%
                  </span>
                )}
              </div>
              <span className={styles["session-item-action"]}>
                <RotateCcw size={13} />
                {restarting === session.id ? "Restarting..." : "Restart"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastSessionsPanel;
