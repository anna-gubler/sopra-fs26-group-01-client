"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ApiService } from "@/api/apiService";
import { QuizQuestion, QuizAttempt } from "@/types/quiz";
import { getQuiz, getLatestAttempt, getQuizQuestions, createAttempt, submitAttempt } from "@/api/quizApi";
import styles from "@/styles/skillmaps.module.css";

type Phase = "loading" | "taking" | "result" | "locked" | "preview";

type QuizTakeModalProps = {
  api: ApiService;
  open: boolean;
  skillId: number;
  quizId: number;
  onClose: () => void;
  previewOnly?: boolean;
  sessionStartedAt?: string;
  savedSelections?: Map<number, number>;
  onSubmitSuccess?: (selections: Map<number, number>, result: QuizAttempt) => void;
};

const QuizTakeModal: React.FC<QuizTakeModalProps> = ({ api, open, skillId, quizId, onClose, previewOnly, sessionStartedAt, savedSelections, onSubmitSuccess }) => {
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selections, setSelections] = useState<Map<number, number>>(new Map());
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [pendingAttemptId, setPendingAttemptId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedInSession, setSubmittedInSession] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPhase("loading");
    setSelections(savedSelections ?? new Map());
    setResult(null);
    setPendingAttemptId(null);
    setSubmittedInSession(false);

    if (previewOnly) {
      getQuizQuestions(api, quizId)
        .then((qs) => { setQuestions(qs); setPhase("preview"); })
        .catch(() => { toast.error("Failed to load quiz."); onClose(); });
      return;
    }

    Promise.all([
      getQuiz(api, skillId),
      getLatestAttempt(api, quizId).catch(() => null),
      getQuizQuestions(api, quizId),
    ])
      .then(([quiz, latestAttempt, qs]) => {
        setQuestions(qs);

        if (!quiz.isActive) {
          setPhase("locked");
          return;
        }

        // In a collab session, only consider attempts made after the session started.
        // Attempts from before the session don't count — the student should take it fresh.
        const sessionAttempt =
          latestAttempt && sessionStartedAt
            ? new Date(latestAttempt.attemptedAt) >= new Date(sessionStartedAt)
              ? latestAttempt
              : null
            : latestAttempt;

        if (sessionAttempt) {
          if (sessionAttempt.passed === null) {
            setPendingAttemptId(sessionAttempt.id);
            setPhase("taking");
          } else {
            setResult(sessionAttempt);
            setSubmittedInSession(!!sessionStartedAt);
            setPhase("result");
          }
        } else {
          setPhase("taking");
        }
      })
      .catch(() => {
        toast.error("Failed to load quiz.");
        onClose();
      });
  }, [open, quizId, skillId, previewOnly, sessionStartedAt]);

  if (!open) return null;

  const allAnswered = questions.length > 0 && questions.every((q) => selections.has(q.id));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers = questions.map((q) => ({
        quizQuestionId: q.id,
        selectedAnswerId: selections.get(q.id)!,
      }));

      // reuse an in-progress attempt if one exists; otherwise create a new one
      let attemptId = pendingAttemptId;
      if (attemptId === null) {
        const attempt = await createAttempt(api, quizId);
        attemptId = attempt.id;
        // persist so a failed submitAttempt can retry without hitting 409
        setPendingAttemptId(attemptId);
      }

      const res = await submitAttempt(api, attemptId, { answers });
      setPendingAttemptId(null);
      setResult(res);
      if (sessionStartedAt) setSubmittedInSession(true);
      onSubmitSuccess?.(new Map(selections), res);
      setPhase("result");
    } catch {
      toast.error("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    if (result?.cooldownUntil) {
      const until = new Date(result.cooldownUntil);
      if (until > new Date()) {
        // convert remaining ms into whole hours plus the leftover minutes
        const diffMs = until.getTime() - Date.now();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        toast.error(`Cooldown active — available again in ${label}.`);
        return;
      }
    }
    setSelections(new Map());
    setPendingAttemptId(null);
    setResult(null);
    setPhase("taking");
  };

  return (
    <div
      className={styles["modal-backdrop"]}
      role="button"
      tabIndex={0}
      aria-label="Close modal"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className={`${styles["modal"]} ${styles["modal--quiz"]}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {phase === "loading" && <LoadingPhase />}
        {phase === "locked" && <LockedPhase onClose={onClose} />}
        {phase === "preview" && <PreviewPhase questions={questions} onClose={onClose} />}
        {phase === "taking" && (
          <TakingPhase
            questions={questions}
            selections={selections}
            setSelections={setSelections}
            allAnswered={allAnswered}
            submitting={submitting}
            onSubmit={handleSubmit}
            onClose={onClose}
          />
        )}
        {phase === "result" && result && (
          <ResultPhase
            result={result}
            questions={questions}
            selections={selections}
            onRetake={handleRetake}
            onClose={onClose}
            disableRetake={submittedInSession}
          />
        )}
      </div>
    </div>
  );
};

export default QuizTakeModal;

function LoadingPhase() {
  return <p className={styles["quiz-loading"]}>Loading…</p>;
}

function LockedPhase({ onClose }: { onClose: () => void }) {
  return (
    <>
      <h2 className="form-heading">Quiz</h2>
      <p className={styles["quiz-loading"]}>This quiz is currently inactive.</p>
      <div className={styles["quiz-modal-actions"]}>
        <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
      </div>
    </>
  );
}

function PreviewPhase({ questions, onClose }: { questions: QuizQuestion[]; onClose: () => void }) {
  return (
    <>
      <h2 className="form-heading">Quiz Preview</h2>
      <div className={styles["quiz-question-list"]}>
        {questions.map((q, qi) => (
          <div key={q.id} className={styles["quiz-take-question"]}>
            <p className={styles["quiz-take-question-text"]}>
              {qi + 1}. {q.quizQuestionText}
            </p>
            <div className={styles["quiz-take-options"]}>
              {q.answers.map((a) => (
                <div key={a.id} className={styles["quiz-take-option"]}>
                  <span>{a.answerText}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles["quiz-modal-actions"]}>
        <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
      </div>
    </>
  );
}

type TakingPhaseProps = {
  questions: QuizQuestion[];
  selections: Map<number, number>;
  setSelections: React.Dispatch<React.SetStateAction<Map<number, number>>>;
  allAnswered: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
};

function TakingPhase({ questions, selections, setSelections, allAnswered, submitting, onSubmit, onClose }: TakingPhaseProps) {
  return (
    <>
      <h2 className="form-heading">Quiz</h2>
      <div className={styles["quiz-question-list"]}>
        {questions.map((q, qi) => (
          <div key={q.id} className={styles["quiz-take-question"]}>
            <p className={styles["quiz-take-question-text"]}>
              {qi + 1}. {q.quizQuestionText}
            </p>
            <div className={styles["quiz-take-options"]}>
              {q.answers.map((a) => {
                const selected = selections.get(q.id) === a.id;
                return (
                  <label
                    key={a.id}
                    className={`${styles["quiz-take-option"]} ${
                      selected ? styles["quiz-take-option--selected"] : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={selected}
                      onChange={() => setSelections((prev) => new Map(prev).set(q.id, a.id))}
                    />
                    <span>{a.answerText}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={styles["quiz-modal-actions"]}>
        <button
          type="button"
          className="btn-gradient"
          onClick={onSubmit}
          disabled={!allAnswered || submitting}
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
        <button type="button" className="btn-ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
      </div>
    </>
  );
}

type ResultPhaseProps = {
  result: QuizAttempt;
  questions: QuizQuestion[];
  selections: Map<number, number>;
  onRetake: () => void;
  onClose: () => void;
  disableRetake?: boolean;
};

function ResultPhase({ result, questions, selections, onRetake, onClose, disableRetake }: ResultPhaseProps) {
  const hasSelections = selections.size > 0;

  return (
    <>
      <h2 className="form-heading">Your Result</h2>
      <p className={styles["quiz-result-score"]}>
        Score: {result.score ?? "—"}% — {result.passed ? "Passed ✓" : "Failed ✗"}
      </p>
      {questions.length > 0 && (
        <div className={styles["quiz-question-list"]}>
          {questions.map((q, qi) => {
            const selectedId = selections.get(q.id);
            const selectedWasWrong =
              selectedId !== undefined &&
              !(q.answers.find((a) => a.id === selectedId)?.isCorrect ?? false);
            return (
              <div key={q.id} className={styles["quiz-take-question"]}>
                <p className={styles["quiz-take-question-text"]}>
                  {qi + 1}. {q.quizQuestionText}
                </p>
                <div className={styles["quiz-take-options"]}>
                  {q.answers.map((a) => {
                    const wasSelected = hasSelections && selectedId === a.id;
                    const showAsCorrect = wasSelected ? a.isCorrect : (!hasSelections && a.isCorrect);
                    const showAsWrong = wasSelected && !a.isCorrect;
                    const showCorrectHint = hasSelections && !wasSelected && a.isCorrect && selectedWasWrong;
                    return (
                      <div
                        key={a.id}
                        className={`${styles["quiz-result-answer-row"]} ${
                          showAsCorrect
                            ? styles["quiz-result-answer-row--correct"]
                            : showAsWrong
                              ? styles["quiz-result-answer-row--wrong"]
                              : ""
                        }`}
                      >
                        <span>{a.answerText}</span>
                        {wasSelected && (
                          <span className={styles["quiz-result-your-answer"]}>
                            {a.isCorrect ? " ✓" : " ✗ your answer"}
                          </span>
                        )}
                        {showCorrectHint && (
                          <span className={styles["quiz-result-correct-hint"]}>
                            {" "}correct answer
                          </span>
                        )}
                        {!hasSelections && a.isCorrect && (
                          <span className={styles["quiz-result-correct-hint"]}> ✓ correct</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className={styles["quiz-modal-actions"]}>
        {!disableRetake && (
          <button type="button" className="btn-gradient" onClick={onRetake}>
            Retake
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}
