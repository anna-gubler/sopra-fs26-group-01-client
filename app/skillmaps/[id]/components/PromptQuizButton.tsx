"use client";

import React, { useState, useEffect } from "react";
import { useApiContext } from "@/context/ApiContext";
import { promptQuiz } from "@/api/sessionApi";
import { getQuiz } from "@/api/quizApi";
import { CollaborationSession } from "@/types/session";
import { Skill } from "@/types/skill";
import styles from "@/styles/collab.module.css";
import toast from "react-hot-toast";

interface SkillWithQuiz {
  skillId: number;
  skillName: string;
  quizId: number;
}

interface PromptQuizButtonProps {
  skillMapId: number;
  session: CollaborationSession;
  liveSkills: Skill[];
}

const PromptQuizButton: React.FC<PromptQuizButtonProps> = ({ skillMapId, session, liveSkills }) => {
  const api = useApiContext();
  const [actionState, setActionState] = useState({ loading: false, selectValue: "" });
  const [skillsWithQuiz, setSkillsWithQuiz] = useState<SkillWithQuiz[]>([]);

  // Graph API does not return quiz data on skills — probe each skill individually.
  // Use a stable string key so this only re-runs when the skill set changes,
  // not on every 3s poll (liveSkills is a new array reference each tick).
  const skillIdsKey = liveSkills.map((s) => s.id).join(",");
  useEffect(() => {
    if (!skillIdsKey) return;
    Promise.all(
      liveSkills.map((s) =>
        getQuiz(api, s.id)
          .then((q) => ({ skillId: s.id, skillName: s.name, quizId: q.id }))
          .catch(() => null)
      )
    ).then((results) => {
      setSkillsWithQuiz(results.filter((r): r is SkillWithQuiz => r !== null));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillIdsKey, api]);

  // Guard against backend not yet returning promptedQuizSkillId (undefined at runtime)
  const isQuizPrompted = session.promptedQuizSkillId != null;
  const promptedEntry = skillsWithQuiz.find((s) => s.skillId === session.promptedQuizSkillId);

  const handlePrompt = async (skillId: number) => {
    setActionState({ loading: true, selectValue: "" });
    try {
      await promptQuiz(api, skillMapId, skillId);
      toast.success("Quiz prompt sent!");
    } catch {
      toast.error("Failed to prompt quiz.");
    } finally {
      setActionState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleClear = async () => {
    setActionState((prev) => ({ ...prev, loading: true }));
    try {
      await promptQuiz(api, skillMapId, null);
      toast.success("Quiz prompt cleared.");
    } catch {
      toast.error("Failed to clear quiz prompt.");
    } finally {
      setActionState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActionState((prev) => ({ ...prev, selectValue: e.target.value }));
    if (e.target.value) handlePrompt(Number(e.target.value));
  };

  const renderSelector = () => (
    <select
      className={styles["qa-skill-select"]}
      value={actionState.selectValue}
      onChange={handleSelect}
      disabled={actionState.loading}
    >
      <option value="" disabled>Select a skill…</option>
      {skillsWithQuiz.map((s) => (
        <option key={s.skillId} value={s.skillId}>{s.skillName}</option>
      ))}
    </select>
  );

  const renderActive = () => (
    <div className={styles["quiz-prompt-active"]}>
      <span className={styles["quiz-prompt-active__name"]}>
        {promptedEntry?.skillName ?? "Unknown skill"}
      </span>
      <button
        className={styles["quiz-prompt-clear-btn"]}
        onClick={handleClear}
        disabled={actionState.loading}
      >
        Clear
      </button>
    </div>
  );

  if (skillsWithQuiz.length === 0) {
    return (
      <p className={styles["collab-panel-placeholder"]}>
        No skills with a quiz in this map.
      </p>
    );
  }

  return isQuizPrompted ? renderActive() : renderSelector();
};

export default PromptQuizButton;
