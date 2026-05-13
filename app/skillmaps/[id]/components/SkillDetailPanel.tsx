"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useAutoResize } from "@/hooks/useAutoResize";
import { X } from "lucide-react";
import { Skill, SkillQuizRef } from "@/types/skill";
import { QuizAttempt } from "@/types/quiz";
import { ApiService } from "@/api/apiService";
import { updateProgress } from "@/api/skillApi";
import { submitSkillRating } from "@/api/sessionApi";
import { getQuiz, getLatestAttempt } from "@/api/quizApi";
import { formatCooldownLabel } from "./quizUtils";
import QuizEditorModal from "./QuizEditorModal";
import QuizTakeModal from "./QuizTakeModal";
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
  const [understood, setUnderstood] = useState(skill.isUnderstood);
  const [toggling, setToggling] = useState(false);
  const [understanding, setUnderstanding] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const understandingRef = useRef(0);

  const [localQuiz, setLocalQuiz] = useState<SkillQuizRef | null>(skill.quiz ?? null);
  const [quizModal, setQuizModal] = useState<"editor" | "take" | "retake" | "viewResult" | "preview" | null>(null);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
  const [savedSelections, setSavedSelections] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setLocalQuiz(skill.quiz ?? null);
    if (!skill.quiz) {
      getQuiz(api, skill.id)
        .then((q) => { if (!cancelled) setLocalQuiz({ id: q.id }); })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [skill.id, api]);

  const hasAttempt = lastAttempt !== null;
  const lastScore = lastAttempt?.score != null && lastAttempt?.passed != null ? lastAttempt.score : null;

  // Fetch latest attempt for button label and last score; re-runs when take/retake modals close
  useEffect(() => {
    const submittingModal = quizModal === "take" || quizModal === "retake";
    if (!localQuiz || submittingModal) return;
    getLatestAttempt(api, localQuiz.id)
      .then((attempt) => { setLastAttempt(attempt ?? null); })
      .catch(() => {});
  }, [api, localQuiz?.id, quizModal]);

  const handleSubmitSuccess = (sels: Map<number, number>, result: QuizAttempt) => {
    setSavedSelections(sels);
    setLastAttempt(result);
  };

  const handleRetakeClick = () => {
    if (lastAttempt?.cooldownUntil) {
      const label = formatCooldownLabel(lastAttempt.cooldownUntil);
      if (label) {
        toast.error(`Cooldown active — available again in ${label}.`);
        return;
      }
    }
    setQuizModal("retake");
  };

  useEffect(() => {
    setUnderstood(skill.isUnderstood);
  }, [skill.id, skill.isUnderstood]);

  const handleToggleUnderstood = async () => {
    const next = !understood;
    setUnderstood(next);
    setToggling(true);
    try {
      await updateProgress(api, skill.id, next ? 100 : 0);
      onUnderstoodChange?.(skill.id, next);
    } catch {
      setUnderstood(!next);
    } finally {
      setToggling(false);
    }
  };

  // Initialize slider from understood state; sync to session if one is active
  useEffect(() => {
    const initial = skill.skillUnderstandingRating ?? 0;
    setUnderstanding(initial);
    understandingRef.current = initial;
  }, [skill.id, skill.skillUnderstandingRating]);

  const handleUnderstandingChange = useCallback(
    (val: number) => {
      setUnderstanding(val);
      understandingRef.current = val;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          await updateProgress(api, skill.id, val);
        } catch {
          // ratings are best-effort; silently ignore failures
        }
        if (sessionId !== null) {
          try {
            await submitSkillRating(api, sessionId, skill.id, val);
          } catch {
            // ratings are best-effort; silently ignore failures
          }
        }
      }, 600);
    },
    [api, skill.id],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={styles["detail-panel"]} data-tour="skill-detail-panel">
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
          <ScoreBar score={liveRating} />
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
        <h3 className={styles["detail-panel-label"]}>Quiz</h3>
        {isOwner
          ? <OwnerQuizContent
              localQuiz={localQuiz}
              hasAttempt={hasAttempt}
              lastScore={lastScore}
              onOpenEditor={() => setQuizModal("editor")}
              onPreview={() => setQuizModal("preview")}
              onTake={() => setQuizModal("take")}
              onSeeLastAttempt={() => setQuizModal("viewResult")}
              onRetake={handleRetakeClick}
            />
          : <StudentQuizContent
              localQuiz={localQuiz}
              lastScore={lastScore}
              hasAttempt={hasAttempt}
              inSession={sessionId !== null}
              onTake={() => setQuizModal("take")}
              onSeeLastAttempt={() => setQuizModal("viewResult")}
              onRetake={handleRetakeClick}
            />
        }
      </section>

      <div className={styles["detail-panel-bottom-actions"]}>
        {isOwner && localQuiz && (
          <button className="btn-ghost" onClick={() => setQuizModal("editor")}>
            Edit Quiz
          </button>
        )}
        {isOwner && onEdit && sessionId === null && (
          <button className="btn-ghost" onClick={onEdit}>
            Edit Skill
          </button>
        )}
      </div>

      <QuizEditorModal
        api={api}
        open={quizModal === "editor"}
        skillId={skill.id}
        quizId={localQuiz?.id ?? null}
        onClose={() => setQuizModal(null)}
        onSaved={(quiz) => {
          setLocalQuiz(quiz);
          setQuizModal(null);
        }}
      />

      {localQuiz && (
        <QuizTakeModal
          api={api}
          open={quizModal === "take"}
          skillId={skill.id}
          quizId={localQuiz.id}
          onClose={() => setQuizModal(null)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}

      {localQuiz && (
        <QuizTakeModal
          api={api}
          open={quizModal === "retake"}
          skillId={skill.id}
          quizId={localQuiz.id}
          onClose={() => setQuizModal(null)}
          mode="retake"
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}

      {localQuiz && (
        <QuizTakeModal
          api={api}
          open={quizModal === "viewResult"}
          skillId={skill.id}
          quizId={localQuiz.id}
          onClose={() => setQuizModal(null)}
          mode="viewResult"
          savedSelections={savedSelections}
        />
      )}

      {localQuiz && (
        <QuizTakeModal
          api={api}
          open={quizModal === "preview"}
          skillId={skill.id}
          quizId={localQuiz.id}
          onClose={() => setQuizModal(null)}
          previewOnly
        />
      )}
    </div>
  );
};

export default SkillDetailPanel;

function ScoreBar({ score }: { score: number }) {
  return (
    <div className={styles["live-rating-row"]}>
      <div className={styles["live-rating-bar-track"]}>
        <div
          className={styles["live-rating-bar-fill"]}
          style={{ width: `${score}%`, background: ratingColor(score) }}
        />
      </div>
      <span className={styles["live-rating-value"]} style={{ color: ratingColor(score) }}>
        {score}%
      </span>
    </div>
  );
}

type OwnerQuizContentProps = {
  localQuiz: SkillQuizRef | null;
  hasAttempt: boolean;
  lastScore: number | null;
  onOpenEditor: () => void;
  onPreview: () => void;
  onTake: () => void;
  onSeeLastAttempt: () => void;
  onRetake: () => void;
};

function OwnerQuizContent({ localQuiz, hasAttempt, lastScore, onOpenEditor, onPreview, onTake, onSeeLastAttempt, onRetake }: OwnerQuizContentProps) {
  if (!localQuiz) {
    return (
      <button className="btn-ghost" onClick={onOpenEditor}>
        Create Quiz
      </button>
    );
  }
  return (
    <>
      {lastScore !== null && <ScoreBar score={lastScore} />}
      <button className="btn-ghost" onClick={onPreview}>Preview Quiz</button>
      {hasAttempt ? (
        <>
          <button className="btn-ghost" onClick={onSeeLastAttempt}>See Last Attempt</button>
          <button className="btn-ghost" onClick={onRetake}>Retake Quiz</button>
        </>
      ) : (
        <button className="btn-ghost" onClick={onTake}>Take Quiz</button>
      )}
    </>
  );
}

type StudentQuizContentProps = {
  localQuiz: SkillQuizRef | null;
  lastScore: number | null;
  hasAttempt: boolean;
  inSession: boolean;
  onTake: () => void;
  onSeeLastAttempt: () => void;
  onRetake: () => void;
};

function StudentQuizContent({ localQuiz, lastScore, hasAttempt, inSession, onTake, onSeeLastAttempt, onRetake }: StudentQuizContentProps) {
  if (!localQuiz) {
    return <p className={styles["detail-panel-placeholder"]}>No quiz created yet.</p>;
  }
  return (
    <>
      {lastScore !== null && <ScoreBar score={lastScore} />}
      {inSession
        ? <p className={styles["detail-panel-placeholder"]}>Quiz taking is handled via a lecturer&apos;s prompt during an active collaboration mode.</p>
        : hasAttempt
          ? (
            <>
              <button className="btn-ghost" onClick={onSeeLastAttempt}>See Last Attempt</button>
              <button className="btn-ghost" onClick={onRetake}>Retake Quiz</button>
            </>
          )
          : <button className="btn-ghost" onClick={onTake}>Take Quiz</button>
      }
    </>
  );
}
