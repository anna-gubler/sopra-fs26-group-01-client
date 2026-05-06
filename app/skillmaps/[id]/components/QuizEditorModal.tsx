"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { ApiService } from "@/api/apiService";
import { SkillQuizRef } from "@/types/skill";
import {
  createQuiz,
  deleteQuiz,
  getQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  createQuizAnswer,
  updateQuizAnswer,
  deleteQuizAnswer,
} from "@/api/quizApi";
import { generateUUID } from "@/utils/uuid";
import styles from "@/styles/skillmaps.module.css";

type LocalAnswer = {
  key: string;
  id?: number;
  answerText: string;
  isCorrect: boolean;
};

type LocalQuestion = {
  key: string;
  id?: number;
  quizQuestionText: string;
  answers: LocalAnswer[];
};

type Props = {
  api: ApiService;
  open: boolean;
  skillMapId: number;
  skillId: number;
  quizId: number | null;
  onClose: () => void;
  onSaved: (quiz: SkillQuizRef | null) => void;
};

function emptyAnswer(): LocalAnswer {
  return { key: generateUUID(), answerText: "", isCorrect: false };
}

function emptyQuestion(): LocalQuestion {
  return { key: generateUUID(), quizQuestionText: "", answers: [emptyAnswer()] };
}

const DeleteQuizButton: React.FC<{ onDelete: () => void; disabled: boolean }> = ({
  onDelete,
  disabled,
}) => {
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
};

const QuizEditorModal: React.FC<Props> = ({
  api,
  open,
  skillMapId,
  skillId,
  quizId,
  onClose,
  onSaved,
}) => {
  const [questions, setQuestions] = useState<LocalQuestion[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const origQuestionIds = useRef<Set<number>>(new Set());
  const origAnswerIds = useRef<Map<number, Set<number>>>(new Map());

  useEffect(() => {
    if (!open) return;
    if (quizId === null) {
      setQuestions([emptyQuestion()]);
      origQuestionIds.current = new Set();
      origAnswerIds.current = new Map();
      return;
    }
    setLoading(true);
    getQuizQuestions(api, quizId)
      .then((qs) => {
        const qIds = new Set<number>();
        const aIds = new Map<number, Set<number>>();
        const loaded: LocalQuestion[] = qs.map((q) => {
          qIds.add(q.id);
          const answerIdSet = new Set<number>();
          const answers: LocalAnswer[] = (q.answers ?? []).map((a) => {
            answerIdSet.add(a.id);
            return {
              key: String(a.id),
              id: a.id,
              answerText: a.answerText,
              isCorrect: a.isCorrect ?? false,
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

  // ── question helpers ───────────────────────────────────────────────────

  const updateQuestionText = (key: string, text: string) =>
    setQuestions((qs) =>
      qs.map((q) => (q.key === key ? { ...q, quizQuestionText: text } : q))
    );

  const removeQuestion = (key: string) =>
    setQuestions((qs) => qs.filter((q) => q.key !== key));

  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);

  // ── answer helpers ─────────────────────────────────────────────────────

  const updateAnswerText = (qKey: string, aKey: string, text: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.key !== qKey
          ? q
          : { ...q, answers: q.answers.map((a) => (a.key === aKey ? { ...a, answerText: text } : a)) }
      )
    );

  const setCorrect = (qKey: string, aKey: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.key !== qKey
          ? q
          : { ...q, answers: q.answers.map((a) => ({ ...a, isCorrect: a.key === aKey })) }
      )
    );

  const removeAnswer = (qKey: string, aKey: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.key !== qKey ? q : { ...q, answers: q.answers.filter((a) => a.key !== aKey) }
      )
    );

  const addAnswer = (qKey: string) =>
    setQuestions((qs) =>
      qs.map((q) => (q.key === qKey ? { ...q, answers: [...q.answers, emptyAnswer()] } : q))
    );

  // ── validation ─────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (questions.length === 0) return "Add at least one question.";
    for (const q of questions) {
      if (!q.quizQuestionText.trim()) return "All questions must have text.";
      if (q.answers.length === 0) return "Each question must have at least one answer.";
      for (const a of q.answers) {
        if (!a.answerText.trim()) return "All answers must have text.";
      }
      if (!q.answers.some((a) => a.isCorrect))
        return "Each question must have one correct answer marked.";
    }
    return null;
  };

  // ── save ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      let currentQuizId = quizId;

      if (currentQuizId === null) {
        const quiz = await createQuiz(api, skillMapId, skillId);
        currentQuizId = quiz.id;
      }

      // Delete questions removed by the lecturer
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

          // Delete answers removed from this question
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

  // ── delete quiz ────────────────────────────────────────────────────────

  const handleDeleteQuiz = async () => {
    try {
      await deleteQuiz(api, skillMapId, skillId);
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
            <div className={styles["quiz-question-list"]}>
              {questions.map((q, qi) => (
                <div key={q.key} className={styles["quiz-question-block"]}>
                  <input
                    className="auth-input"
                    type="text"
                    placeholder={`Question ${qi + 1}`}
                    value={q.quizQuestionText}
                    onChange={(e) => updateQuestionText(q.key, e.target.value)}
                  />

                  <div className={styles["quiz-answer-list"]}>
                    {q.answers.map((a) => (
                      <div key={a.key} className={styles["quiz-answer-row"]}>
                        <input
                          className={`auth-input ${styles["quiz-answer-input"]}`}
                          type="text"
                          placeholder="Answer"
                          value={a.answerText}
                          onChange={(e) => updateAnswerText(q.key, a.key, e.target.value)}
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
                            onChange={() => setCorrect(q.key, a.key)}
                          />
                          Correct
                        </label>
                        <button
                          type="button"
                          className={styles["quiz-icon-btn"]}
                          onClick={() => removeAnswer(q.key, a.key)}
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
                      onClick={() => addAnswer(q.key)}
                    >
                      + Add answer
                    </button>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        className={styles["quiz-icon-btn"]}
                        onClick={() => removeQuestion(q.key)}
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
              onClick={addQuestion}
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
