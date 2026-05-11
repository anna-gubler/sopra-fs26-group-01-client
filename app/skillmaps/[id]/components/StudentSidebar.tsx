"use client";

import React, { useState, useEffect } from "react";
import { useApiContext } from "@/context/ApiContext";
import { CollaborationSession } from "@/types/session";
import { Skill } from "@/types/skill";
import { Question } from "@/types/question";
import { getQuiz } from "@/api/quizApi";
import SpeedIndicator from "./SpeedIndicator";
import AskQuestionPanel from "./AskQuestionPanel";
import QuizTakeModal from "./QuizTakeModal";
import styles from "@/styles/collab.module.css";

interface StudentSidebarProps {
  session: CollaborationSession;
  liveSkills: Skill[];
  liveQuestions: Question[];
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({
  session,
  liveSkills,
  liveQuestions,
}) => {
  const api = useApiContext();
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [promptedQuizId, setPromptedQuizId] = useState<number | null>(null);

  // Graph API does not include quiz data on skills — fetch the quiz directly
  // when the lecturer sets a prompt. Guards against undefined (backend not yet returning field).
  const isQuizPrompted = session.promptedQuizSkillId != null;
  const promptedSkill = liveSkills.find((s) => s.id === session.promptedQuizSkillId) ?? null;

  useEffect(() => {
    if (!session.promptedQuizSkillId) {
      setPromptedQuizId(null);
      return;
    }
    getQuiz(api, session.promptedQuizSkillId)
      .then((q) => setPromptedQuizId(q.id))
      .catch(() => setPromptedQuizId(null));
  }, [session.promptedQuizSkillId, api]);

  const renderQuizBanner = () => {
    if (!isQuizPrompted || promptedQuizId === null) return null;
    return (
      <div className={styles["collab-panel"]}>
        <div className={styles["quiz-banner"]}>
          <span className={styles["quiz-banner__title"]}>Quiz Prompt</span>
          <span className={styles["quiz-banner__skill"]}>{promptedSkill?.name ?? "Quiz"}</span>
          <button
            className={styles["btn-collab-filled"]}
            onClick={() => setQuizModalOpen(true)}
          >
            Take Quiz
          </button>
        </div>
      </div>
    );
  };

  const renderQuizModal = () => {
    if (!isQuizPrompted || promptedQuizId === null || !promptedSkill) return null;
    return (
      <QuizTakeModal
        api={api}
        open={quizModalOpen}
        skillId={promptedSkill.id}
        quizId={promptedQuizId}
        onClose={() => setQuizModalOpen(false)}
      />
    );
  };

  return (
    <>
      {renderQuizBanner()}
      <div className={styles["collab-panel"]}>
        <h3 className={styles["collab-panel-title"]}>Rate Understanding</h3>
        <p className={styles["collab-panel-placeholder"]}>Select a skill on the graph to rate your understanding.</p>
      </div>
      <div className={styles["collab-panel"]}>
        <h3 className={styles["collab-panel-title"]}>Session Speed</h3>
        <SpeedIndicator isOwner={false} session={session} />
      </div>
      <div className={styles["collab-panel"]}>
        <h3 className={styles["collab-panel-title"]}>Ask a Question</h3>
        <AskQuestionPanel session={session} skills={liveSkills} questions={liveQuestions} />
      </div>
      {renderQuizModal()}
    </>
  );
};

export default StudentSidebar;
