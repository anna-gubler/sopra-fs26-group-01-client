"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { ApiService } from "@/api/apiService";
import { SkillQuizRef } from "@/types/skill";
import {
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  createQuizAnswer,
  updateQuizAnswer,
  deleteQuizAnswer,
} from "@/api/quizApi";
import styles from "@/styles/skillmaps.module.css";
import {
  LocalQuestion,
  emptyQuestion,
  validate,
  updateQuestionText,
  removeQuestion,
  addQuestion,
  updateAnswerText,
  setCorrectAnswer,
  removeAnswer,
  addAnswer,
} from "./quizUtils";

type Props = {
  api: ApiService;
  open: boolean;
  skillId: number;
  quizId: number | null;
  onClose: () => void;
  onSaved: (quiz: SkillQuizRef | null) => void;
};

const QuizEditorModal: React.FC<Props> = ({
  api,
  open,
  skillId,
  quizId,
  onClose,
  onSaved,
}) => {
  const [questions, setQuestions] = useState<LocalQuestion[]>([emptyQuestion()]);
  const [passMark, setPassMark] = useState(70);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const origQuestionIds = useRef<Set<number>>(new Set());
  const origAnswerIds = useRef<Map<number, Set<number>>>(new Map());

  useEffect(() => {
    if (!open) return;
    if (quizId === null) {
      setQuestions([emptyQuestion()]);
      setPassMark(70);
      setIsActive(true);
      origQuestionIds.current = new Set();
      origAnswerIds.current = new Map();
      return;
    }
    setLoading(true);
    Promise.all([getQuiz(api, skillId), getQuizQuestions(api, quizId)])
      .then(([quiz, qs]) => {
        setPassMark(quiz.passMark);
        setIsActive(quiz.isActive);
        const qIds = new Set<number>();
        const aIds = new Map<number, Set<number>>();
        const loaded: LocalQuestion[] = qs.map((q) => {
          qIds.add(q.id);
          const answerIdSet = new Set<number>();
          const answers = q.answers.map((a) => {
            answerIdSet.add(a.id);
            return {
              key: String(a.id),
              id: a.id,
              answerText: a.answerText,
              isCorrect: a.isCorrect,
            };
          });
          aIds.set(q.id, answerIdSet);
          return {
            key: String(q.id),
            id: q.id,
            quizQuestionText: q.quizQuestionText,
            answers,
          };
        });
        origQuestionIds.current = qIds;
        origAnswerIds.current = aIds;
        setQuestions(loaded.length > 0 ? loaded : [emptyQuestion()]);
      })
      .catch(() => toast.error("Failed to load quiz."))
      .finally(() => setLoading(false));
  }, [open, quizId]);

  if (!open) return null;

  const handleSave = async () => {
    const err = validate(questions);
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      let currentQuizId = quizId;

      if (currentQuizId === null) {
        const quiz = await createQuiz(api, skillId, { isActive, passMark });
        currentQuizId = quiz.id;
      } else {
        await updateQuiz(api, currentQuizId, { isActive, passMark });
      }

      if (quizId !== null) {
        const keptIds = new Set(
          questions.map((q) => q.id).filter((id): id is number => id !== undefined)
        );
        for (const origId of origQuestionIds.current) {
          if (!keptIds.has(origId)) await deleteQuizQuestion(api, origId);
        }
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        let questionId: number;

        if (q.id !== undefined) {
          await updateQuizQuestion(api, q.id, {
            quizQuestionText: q.quizQuestionText,
            orderIndex: i,
          });
          questionId = q.id;

          const keptAnswerIds = new Set(
            q.answers.map((a) => a.id).filter((id): id is number => id !== undefined)
          );
          for (const origId of origAnswerIds.current.get(q.id) ?? []) {
            if (!keptAnswerIds.has(origId)) await deleteQuizAnswer(api, origId);
          }
        } else {
          const created = await createQuizQuestion(api, currentQuizId, {
            quizQuestionText: q.quizQuestionText,
            orderIndex: i,
          });
          questionId = created.id;
        }

        for (const a of q.answers) {
          if (a.id !== undefined) {
            await updateQuizAnswer(api, a.id, {
              answerText: a.answerText,
              isCorrect: a.isCorrect,
            });
          } else {
            await createQuizAnswer(api, questionId, {
              answerText: a.answerText,
              isCorrect: a.isCorrect,
            });
          }
        }
      }

      toast.success("Quiz saved.");
      onSaved({ id: currentQuizId });
    } catch {
      toast.error("Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      await deleteQuiz(api, quizId!);
      toast.success("Quiz deleted.");
      onSaved(null);
    } catch {
      toast.error("Failed to delete quiz.");
    }
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
        <h2 className="form-heading">{quizId ? "Edit Quiz" : "Create Quiz"}</h2>

        {loading ? (
          <p className={styles["quiz-loading"]}>Loading…</p>
        ) : (
          <>
            <div className={styles["quiz-settings-row"]}>
              <label className={styles["quiz-settings-label"]}>
                Pass mark (%)
                <input
                  className={`auth-input ${styles["quiz-settings-input"]}`}
                  type="number"
                  min={0}
                  max={100}
                  value={passMark}
                  onChange={(e) => setPassMark(Math.min(100, Math.max(0, Number(e.target.value))))}
                />
              </label>
              <label className={styles["quiz-settings-label"]}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
            </div>

            <div className={styles["quiz-question-list"]}>
              {questions.map((q, qi) => (
                <div key={q.key} className={styles["quiz-question-block"]}>
                  <input
                    className="auth-input"
                    type="text"
                    placeholder={`Question ${qi + 1}`}
                    value={q.quizQuestionText}
                    onChange={(e) => setQuestions((qs) => updateQuestionText(qs, q.key, e.target.value))}
                  />

                  <div className={styles["quiz-answer-list"]}>
                    {q.answers.map((a) => (
                      <div key={a.key} className={styles["quiz-answer-row"]}>
                        <input
                          className={`auth-input ${styles["quiz-answer-input"]}`}
                          type="text"
                          placeholder="Answer"
                          value={a.answerText}
                          onChange={(e) => setQuestions((qs) => updateAnswerText(qs, q.key, a.key, e.target.value))}
                        />
                        <label
                          className={`${styles["quiz-correct-label"]} ${
                            a.isCorrect ? styles["quiz-correct-label--active"] : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.key}`}
                            checked={a.isCorrect}
                            onChange={() => setQuestions((qs) => setCorrectAnswer(qs, q.key, a.key))}
                          />
                          Correct
                        </label>
                        <button
                          type="button"
                          className={styles["quiz-icon-btn"]}
                          onClick={() => setQuestions((qs) => removeAnswer(qs, q.key, a.key))}
                          aria-label="Remove answer"
                          disabled={q.answers.length === 1}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className={styles["quiz-question-footer"]}>
                    <button
                      type="button"
                      className={styles["quiz-add-answer-btn"]}
                      onClick={() => setQuestions((qs) => addAnswer(qs, q.key))}
                    >
                      + Add answer
                    </button>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        className={styles["quiz-icon-btn"]}
                        onClick={() => setQuestions((qs) => removeQuestion(qs, q.key))}
                        aria-label="Delete question"
                      >
                        Delete question
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={`btn-ghost ${styles["quiz-modal-add-question"]}`}
              onClick={() => setQuestions((qs) => addQuestion(qs))}
            >
              + Add question
            </button>

            <div className={styles["quiz-modal-actions"]}>
              <button
                type="button"
                className="btn-gradient"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              {quizId !== null && (
                <DeleteQuizButton onDelete={handleDeleteQuiz} disabled={saving} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizEditorModal;

function DeleteQuizButton({ onDelete, disabled }: { onDelete: () => void; disabled: boolean }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button
        type="button"
        className={styles["btn-delete"]}
        onClick={() => setConfirming(true)}
        disabled={disabled}
        style={{ marginTop: 0, width: "auto", padding: "10px 20px" }}
      >
        Delete Quiz
      </button>
    );
  }
  return (
    <div className={styles["btn-delete-row"]}>
      <button
        type="button"
        className={`btn-ghost ${styles["btn-delete-cancel"]}`}
        onClick={() => setConfirming(false)}
      >
        Cancel
      </button>
      <button
        type="button"
        className={styles["btn-delete"]}
        onClick={onDelete}
        style={{ marginTop: 0 }}
      >
        Confirm Delete
      </button>
    </div>
  );
}
