"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ApiService } from "@/api/apiService";
import { QuizQuestion, QuizAttempt } from "@/types/quiz";
import { getQuiz, getLatestAttempt, getQuizQuestions, createAttempt, submitAttempt } from "@/api/quizApi";
import styles from "@/styles/skillmaps.module.css";

type Phase = "loading" | "taking" | "result" | "locked";

type Props = {
  api: ApiService;
  open: boolean;
  skillId: number;
  quizId: number;
  onClose: () => void;
};

const QuizTakeModal: React.FC<Props> = ({ api, open, skillId, quizId, onClose }) => {
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selections, setSelections] = useState<Map<number, number>>(new Map());
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [pendingAttemptId, setPendingAttemptId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPhase("loading");
    setSelections(new Map());
    setResult(null);
    setPendingAttemptId(null);

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

        if (latestAttempt) {
          if (latestAttempt.passed === null) {
            // resume an unsubmitted attempt from a previous session
            setPendingAttemptId(latestAttempt.id);
            setPhase("taking");
          } else {
            setResult(latestAttempt);
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
  }, [open, quizId, skillId]);

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
        {phase === "loading" && <p className={styles["quiz-loading"]}>Loading…</p>}

        {phase === "locked" && (
          <>
            <h2 className="form-heading">Quiz</h2>
            <p className={styles["quiz-loading"]}>This quiz is currently inactive.</p>
            <div className={styles["quiz-modal-actions"]}>
              <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
            </div>
          </>
        )}

        {phase === "taking" && (
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
                            onChange={() =>
                              setSelections((prev) => new Map(prev).set(q.id, a.id))
                            }
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
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
              <button type="button" className="btn-ghost" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
            </div>
          </>
        )}

        {phase === "result" && result && (
          <>
            <h2 className="form-heading">Your Result</h2>
            <p className={styles["quiz-result-score"]}>
              Score: {result.score ?? "—"}% — {result.passed ? "Passed ✓" : "Failed ✗"}
            </p>
            {selections.size > 0 && (
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
                          const wasSelected = selectedId === a.id;
                          const showAsCorrect = wasSelected && a.isCorrect;
                          const showAsWrong = wasSelected && !a.isCorrect;
                          const showCorrectHint = !wasSelected && a.isCorrect && selectedWasWrong;
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
              <button type="button" className="btn-gradient" onClick={handleRetake}>
                Retake
              </button>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizTakeModal;
