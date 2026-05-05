"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAutoResize } from "@/hooks/useAutoResize";
import { X } from "lucide-react";
import { Skill, SkillQuizRef } from "@/types/skill";
import { ApiService } from "@/api/apiService";
import { updateProgress } from "@/api/skillApi";
import { submitSkillRating } from "@/api/sessionApi";
import { getLatestAttempt } from "@/api/quizApi";
import UnderstandingSlider from "./UnderstandingSlider";
import { ratingColor } from "./UnderstandingHeatmap";
import styles from "@/styles/skillmaps.module.css";

type SkillDetailPanelProps = {
  skill: Skill;
  dependencies: Skill[];
  onClose: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onUnderstoodChange?: (skillId: number, isUnderstood: boolean) => void;
  api: ApiService;
  sessionId: number | null;
  liveRating?: number | null;
};

const URL_REGEX = /https?:\/\/[^\s]+/g;

function renderWithLinks(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_REGEX)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a key={match.index} href={match[0]} target="_blank" rel="noopener noreferrer" className={styles["detail-panel-link"]}>
        {match[0]}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const dotColor: Record<string, string> = {
  easy:   "hsl(160, 60%, 52%)",
  medium: "hsl(263, 70%, 58%)",
  hard:   "hsl(330, 70%, 56%)",
};

const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({ skill, dependencies, onClose, isOwner, onEdit, onUnderstoodChange, api, sessionId, liveRating }) => {
  const color = dotColor[skill.difficulty] ?? "hsl(258, 24%, 40%)";
  const [notes, setNotes] = useState("");
  const notesResize = useAutoResize(notes);
  const [understood, setUnderstood] = useState(skill.isUnderstood);
  const [toggling, setToggling] = useState(false);
  const [understanding, setUnderstanding] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const understandingRef = useRef(0);
  const prevSessionIdRef = useRef<number | null>(null);

  // Quiz state
  const [localQuiz, setLocalQuiz] = useState<SkillQuizRef | null>(skill.quiz ?? null);
  const [quizEditorOpen, setQuizEditorOpen] = useState(false);
  const [quizTakeOpen, setQuizTakeOpen] = useState(false);
  const [hasAttempt, setHasAttempt] = useState(false);

  useEffect(() => {
    setLocalQuiz(skill.quiz ?? null);
  }, [skill.id]);

  // Determine if student has a previous attempt (for button label)
  useEffect(() => {
    if (isOwner || !localQuiz) return;
    getLatestAttempt(api, localQuiz.id)
      .then((result) => setHasAttempt(result !== null))
      .catch(() => {});
  }, [api, isOwner, localQuiz?.id]);

  useEffect(() => {
    setUnderstood(skill.isUnderstood);
  }, [skill.id, skill.isUnderstood]);

  const handleToggleUnderstood = async () => {
    const next = !understood;
    setUnderstood(next);
    setToggling(true);
    try {
      await updateProgress(api, skill.id, next);
      onUnderstoodChange?.(skill.id, next);
    } catch {
      setUnderstood(!next);
    } finally {
      setToggling(false);
    }
  };

  // Initialize slider from understood state; sync to session if one is active
  useEffect(() => {
    const initial = skill.isUnderstood ? 100 : 0;
    setUnderstanding(initial);
    understandingRef.current = initial;
    if (!isOwner && sessionId !== null && initial > 0) {
      submitSkillRating(api, sessionId, skill.id, initial).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill.id, skill.isUnderstood]);

  // When a session starts while the panel is open, submit the current understanding
  useEffect(() => {
    const prev = prevSessionIdRef.current;
    prevSessionIdRef.current = sessionId;
    if (prev === null && sessionId !== null && !isOwner && understandingRef.current > 0) {
      submitSkillRating(api, sessionId, skill.id, understandingRef.current).catch(() => {});
    }
  }, [sessionId, api, skill.id, isOwner]);

  const handleUnderstandingChange = useCallback(
    (val: number) => {
      setUnderstanding(val);
      understandingRef.current = val;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (sessionId !== null) {
          try {
            await submitSkillRating(api, sessionId, skill.id, val);
          } catch {
            // ratings are best-effort; silently ignore failures
          }
        }
      }, 600);
    },
    [api, sessionId, skill.id],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={styles["detail-panel"]}>
      <button className={styles["detail-panel-close"]} onClick={onClose} aria-label="Close panel">
        <X size={18} />
      </button>

      <div className={styles["detail-panel-header"]}>
        <span className={styles["detail-panel-dot"]} style={{ "--dot-color": color } as React.CSSProperties} />
<h2 className={styles["detail-panel-title"]}>{skill.name.toUpperCase()}</h2>
      </div>

      {isOwner && liveRating != null && (
        <section className={styles["detail-panel-section"]}>
          <h3 className={styles["detail-panel-label"]}>Class Understanding</h3>
          <div className={styles["live-rating-row"]}>
            <div className={styles["live-rating-bar-track"]}>
              <div
                className={styles["live-rating-bar-fill"]}
                style={{ width: `${liveRating}%`, background: ratingColor(liveRating) }}
              />
            </div>
            <span className={styles["live-rating-value"]} style={{ color: ratingColor(liveRating) }}>
              {liveRating}%
            </span>
          </div>
        </section>
      )}

      <section className={styles["detail-panel-section"]}>
        <h3 className={styles["detail-panel-label"]}>Description</h3>
        <p className={skill.description ? styles["detail-panel-description"] : styles["detail-panel-placeholder"]}>
          {skill.description || "No description provided."}
        </p>
      </section>


      <section className={styles["detail-panel-section"]}>
        <h3 className={styles["detail-panel-label"]}>Resources</h3>
        {skill.resources ? (
          <p className={styles["detail-panel-text"]}>{renderWithLinks(skill.resources)}</p>
        ) : (
          <p className={styles["detail-panel-placeholder"]}>No resources provided.</p>
        )}
      </section>

      <section className={styles["detail-panel-section"]}>
        <h3 className={styles["detail-panel-label"]}>Prerequisites</h3>
        {dependencies.length > 0 ? (
          <div className={styles["detail-panel-pills"]}>
            {dependencies.map((dep) => (
              <span
                key={dep.id}
                className={styles["detail-panel-pill"]}
                style={{ "--pill-color": dotColor[dep.difficulty] ?? "hsl(258, 24%, 40%)" } as React.CSSProperties}
              >
                {dep.name}
              </span>
            ))}
          </div>
        ) : (
          <p className={styles["detail-panel-placeholder"]}>No prerequisites.</p>
        )}
      </section>

      {!isOwner && (
        <section className={styles["detail-panel-section"]}>
          <h3 className={styles["detail-panel-label"]}>Mark as Understood</h3>
          <label className={`${styles["understood-toggle"]} ${skill.isLocked ? styles["understood-toggle--locked"] : ""}`}>
            <input
              type="checkbox"
              className={styles["understood-checkbox"]}
              checked={understood}
              onChange={handleToggleUnderstood}
              disabled={toggling || skill.isLocked}
            />
            <span className={styles["understood-toggle-label"]}>
              {skill.isLocked ? "Complete prerequisites first" : understood ? "Understood" : "Not yet understood"}
            </span>
          </label>
        </section>
      )}

      {!isOwner && sessionId !== null && (
        <section className={styles["detail-panel-section"]}>
          <h3 className={styles["detail-panel-label"]}>Session Rating</h3>
          <UnderstandingSlider value={understanding} onChange={handleUnderstandingChange} />
        </section>
      )}

      <section className={styles["detail-panel-section"]}>
        <h3 className={styles["detail-panel-label"]}>Notes</h3>
        <textarea
          className={styles["detail-panel-notes"]}
          ref={notesResize.ref}
          onInput={notesResize.onInput}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add your personal notes here..."
        />
      </section>

      {/* Quiz section */}
      {isOwner && (
        <section className={styles["detail-panel-section"]}>
          <h3 className={styles["detail-panel-label"]}>Quiz</h3>
          <button
            className="btn-ghost"
            onClick={() => {
              console.log("Open quiz editor for quiz:", localQuiz?.id ?? "(new)", "skill:", skill.id);
              setQuizEditorOpen(true);
            }}
          >
            {localQuiz ? "Edit Quiz" : "Create Quiz"}
          </button>
        </section>
      )}

      {!isOwner && localQuiz && (
        <section className={styles["detail-panel-section"]}>
          <h3 className={styles["detail-panel-label"]}>Quiz</h3>
          <button
            className="btn-ghost"
            onClick={() => {
              console.log("Open quiz take for quiz:", localQuiz.id);
              setQuizTakeOpen(true);
            }}
          >
            {hasAttempt ? "Retake Quiz" : "Take Quiz"}
          </button>
        </section>
      )}

      {isOwner && onEdit && sessionId === null && (
        <button className={`btn-ghost ${styles["detail-panel-edit-btn"]}`} onClick={onEdit}>
          Edit Skill
        </button>
      )}
    </div>
  );
};

export default SkillDetailPanel;
