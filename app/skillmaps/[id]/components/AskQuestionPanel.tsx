"use client";

import React, { useState } from "react";
import { useAutoResize } from "@/hooks/useAutoResize";
import { useApiContext } from "@/context/ApiContext";
import { postQuestion, upvoteQuestion, removeUpvote } from "@/api/sessionApi";
import { Question } from "@/types/question";
import { Skill } from "@/types/skill";
import { CollaborationSession } from "@/types/session";
import styles from "@/styles/collab.module.css";
import toast from "react-hot-toast";

interface AskQuestionPanelProps {
  session: CollaborationSession;
  skills: Skill[];
  questions: Question[];
}

const AskQuestionPanel: React.FC<AskQuestionPanelProps> = ({ session, skills, questions }) => {
  const api = useApiContext();
  const [skillId, setSkillId] = useState<number>(skills[0]?.id ?? 0);
  const [text, setText] = useState("");
  const textResize = useAutoResize(text);
  const [submitting, setSubmitting] = useState(false);
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set());

  const handleSubmit = async () => {
    const effectiveSkillId = skillId || skills[0]?.id;
    if (!text.trim() || !effectiveSkillId) return;
    setSubmitting(true);
    try {
      await postQuestion(api, session.id, effectiveSkillId, text.trim());
      setText("");
      toast.success("Question submitted!");
    } catch {
      toast.error("Failed to submit question.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: number) => {
    const hasUpvoted = upvoted.has(questionId);
    setUpvoted((prev) => {
      const next = new Set(prev);
      hasUpvoted ? next.delete(questionId) : next.add(questionId);
      return next;
    });
    try {
      if (hasUpvoted) {
        await removeUpvote(api, questionId);
      } else {
        await upvoteQuestion(api, questionId);
      }
    } catch {
      setUpvoted((prev) => {
        const next = new Set(prev);
        hasUpvoted ? next.add(questionId) : next.delete(questionId);
        return next;
      });
      toast.error("Failed to update upvote.");
    }
  };

  const active = questions
    .filter((q) => !q.isAddressed)
    .sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className={styles["qa-ask"]}>
      <div className={styles["qa-form"]}>
        <select
          className={styles["qa-skill-select"]}
          value={skillId}
          onChange={(e) => setSkillId(Number(e.target.value))}
          disabled={submitting}
        >
          {skills.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <textarea
          className={styles["qa-textarea"]}
          ref={textResize.ref}
          onInput={textResize.onInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question..."
          rows={3}
          disabled={submitting}
        />
        <button
          className={styles["btn-collab-filled"]}
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
        >
          Submit
        </button>
      </div>
      {active.length > 0 && (
        <div className={styles["qa-list"]}>
          {active.map((q) => (
            <div key={q.id} className={styles["qa-item"]}>
              <button
                className={`${styles["qa-upvote-btn"]} ${upvoted.has(q.id) ? styles["qa-upvote-btn--active"] : ""}`}
                onClick={() => handleUpvote(q.id)}
              >
                ▲ {q.upvotes}
              </button>
              <span className={styles["qa-text"]}>{q.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AskQuestionPanel;
