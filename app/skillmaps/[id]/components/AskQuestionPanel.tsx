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
  const [skillId, setSkillId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const textResize = useAutoResize(text);
  const [submitting, setSubmitting] = useState(false);
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set());

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await postQuestion(api, session.id, skillId, text.trim());
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

  const skillNameMap = Object.fromEntries(skills.map((s) => [s.id, s.name]));

  const active = questions.filter((q) => !q.isAddressed);

  const grouped = active.reduce<Record<number, Question[]>>((acc, q) => {
    const key = q.skillId ?? -1;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  const sortedSkillIds = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => {
      if (a === -1) return 1;
      if (b === -1) return -1;
      const levelA = skills.find((s) => s.id === a)?.level ?? 0;
      const levelB = skills.find((s) => s.id === b)?.level ?? 0;
      return levelA - levelB;
    });

  return (
    <div className={styles["qa-ask"]}>
      <div className={styles["qa-form"]}>
        <select
          className={styles["qa-skill-select"]}
          value={skillId ?? ""}
          onChange={(e) => setSkillId(e.target.value === "" ? null : Number(e.target.value))}
          disabled={submitting}
        >
          <option value="">General</option>
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
          maxLength={200}
        />
        <span className={styles["qa-counter"]}>{text.length}/200</span>
        <button
          className={styles["btn-collab-filled"]}
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
        >
          Submit
        </button>
      </div>
      {sortedSkillIds.length > 0 && (
        <div className={styles["qa-list"]}>
          {sortedSkillIds.map((sid) => {
            const group = grouped[sid].slice().sort((a, b) => b.upvoteCount - a.upvoteCount);
            const skillName = sid === -1 ? "General" : (skillNameMap[sid] ?? `Skill #${sid}`);
            return (
              <div key={sid} className={styles["qa-skill-group"]}>
                <div className={styles["qa-skill-name"]}>{skillName}</div>
                {group.map((q) => (
                  <div key={q.id} className={styles["qa-item"]}>
                    <button
                      className={`${styles["qa-upvote-btn"]} ${upvoted.has(q.id) ? styles["qa-upvote-btn--active"] : ""}`}
                      onClick={() => handleUpvote(q.id)}
                    >
                      ▲ {q.upvoteCount}
                    </button>
                    <span className={styles["qa-text"]}>{q.text}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AskQuestionPanel;
