"use client";

import React from "react";
import { Question } from "@/types/question";
import { Skill } from "@/types/skill";
import styles from "@/styles/collab.module.css";

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
  const active = questions.filter((q) => !q.isAddressed);
  const usingMock = active.length === 0;
  const displayQuestions = usingMock ? MOCK_QUESTIONS : active;

  if (!usingMock && active.length === 0) {
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
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default LiveQuestionsPanel;
