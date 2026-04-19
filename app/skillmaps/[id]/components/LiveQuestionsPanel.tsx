"use client";

import React, { useState } from "react";
import { useApiContext } from "@/context/ApiContext";
import { markQuestionAddressed } from "@/api/sessionApi";
import { Question } from "@/types/question";
import { Skill } from "@/types/skill";
import styles from "@/styles/collab.module.css";
import toast from "react-hot-toast";

interface LiveQuestionsPanelProps {
  questions: Question[];
  skills: Skill[];
}

// TODO: remove mock data once backend question submission is working
const MOCK_QUESTIONS: (Question & { _skillName: string })[] = [
  { id: 1, sessionId: 0, skillId: 101, text: "Can you explain how recursion works here?", upvotes: 7, isAddressed: false, createdAt: "", _skillName: "Recursion" },
  { id: 2, sessionId: 0, skillId: 101, text: "What's the base case for this?", upvotes: 4, isAddressed: false, createdAt: "", _skillName: "Recursion" },
  { id: 3, sessionId: 0, skillId: 102, text: "Why do we use a hash map instead of a list?", upvotes: 11, isAddressed: false, createdAt: "", _skillName: "Data Structures" },
  { id: 4, sessionId: 0, skillId: 102, text: "Is this O(n) or O(n log n)?", upvotes: 3, isAddressed: false, createdAt: "", _skillName: "Data Structures" },
];

const LiveQuestionsPanel: React.FC<LiveQuestionsPanelProps> = ({ questions, skills }) => {
  const api = useApiContext();
  const [localAddressed, setLocalAddressed] = useState<Set<number>>(new Set());
  const [localUnaddressed, setLocalUnaddressed] = useState<Set<number>>(new Set());
  const [addressedOpen, setAddressedOpen] = useState(false);

  const active = questions.filter((q) => !q.isAddressed || localUnaddressed.has(q.id));
  const usingMock = active.length === 0 && questions.length === 0;

  const displayQuestions = (usingMock ? MOCK_QUESTIONS : active).filter(
    (q) => !localAddressed.has(q.id)
  );

  const handleMarkAddressed = async (questionId: number) => {
    setLocalAddressed((prev) => new Set(prev).add(questionId));
    setLocalUnaddressed((prev) => { const next = new Set(prev); next.delete(questionId); return next; });
    if (usingMock) return;
    try {
      await markQuestionAddressed(api, questionId);
    } catch {
      setLocalAddressed((prev) => { const next = new Set(prev); next.delete(questionId); return next; });
      toast.error("Failed to mark question as addressed.");
    }
  };

  const handlePutBack = (questionId: number) => {
    setLocalAddressed((prev) => { const next = new Set(prev); next.delete(questionId); return next; });
    setLocalUnaddressed((prev) => new Set(prev).add(questionId));
  };

  const addressedQuestions = [
    ...questions.filter((q) => q.isAddressed && !localUnaddressed.has(q.id)),
    ...(usingMock ? MOCK_QUESTIONS : questions).filter((q) => localAddressed.has(q.id) && !questions.find((r) => r.id === q.id)?.isAddressed),
  ];

  if (displayQuestions.length === 0 && addressedQuestions.length === 0) {
    return <p className={styles["collab-panel-placeholder"]}>No questions yet.</p>;
  }

  const skillNameMap = Object.fromEntries(skills.map((s) => [s.id, s.name]));

  const grouped = displayQuestions.reduce<Record<number, typeof displayQuestions>>((acc, q) => {
    if (!acc[q.skillId]) acc[q.skillId] = [];
    acc[q.skillId].push(q);
    return acc;
  }, {});

  const sortedSkillIds = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => {
      const levelA = skills.find((s) => s.id === a)?.level ?? 0;
      const levelB = skills.find((s) => s.id === b)?.level ?? 0;
      return levelA - levelB;
    });

  return (
    <div className={styles["qa-list"]}>
      {sortedSkillIds.map((skillId) => {
        const group = grouped[skillId].slice().sort((a, b) => b.upvotes - a.upvotes);
        const skillName = usingMock
          ? (group[0] as (typeof MOCK_QUESTIONS)[0])._skillName
          : (skillNameMap[skillId] ?? `Skill #${skillId}`);
        return (
          <div key={skillId} className={styles["qa-skill-group"]}>
            <div className={styles["qa-skill-name"]}>{skillName}</div>
            {group.map((q) => (
              <div key={q.id} className={styles["qa-item"]}>
                <span className={styles["qa-upvotes"]}>{q.upvotes}</span>
                <span className={styles["qa-text"]}>{q.text}</span>
                <button
                  className={styles["qa-addressed-btn"]}
                  onClick={() => handleMarkAddressed(q.id)}
                  title="Mark as addressed"
                >
                  ✓
                </button>
              </div>
            ))}
          </div>
        );
      })}

      {addressedQuestions.length > 0 && (
        <div className={styles["qa-addressed-section"]}>
          <button
            className={styles["qa-addressed-toggle"]}
            onClick={() => setAddressedOpen((o) => !o)}
          >
            <span>Addressed ({addressedQuestions.length})</span>
            <span>{addressedOpen ? "▲" : "▼"}</span>
          </button>
          {addressedOpen && (
            <div className={styles["qa-addressed-list"]}>
              {addressedQuestions.map((q) => (
                <div key={q.id} className={`${styles["qa-item"]} ${styles["qa-item--addressed"]}`}>
                  <span className={styles["qa-upvotes"]}>{q.upvotes}</span>
                  <span className={styles["qa-text"]}>{q.text}</span>
                  <button
                    className={styles["qa-putback-btn"]}
                    onClick={() => handlePutBack(q.id)}
                    title="Put back to live"
                  >
                    ↩
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveQuestionsPanel;
