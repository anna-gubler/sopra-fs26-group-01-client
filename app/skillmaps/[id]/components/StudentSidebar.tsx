"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApiContext } from "@/context/ApiContext";
import { CollaborationSession } from "@/types/session";
import { Skill } from "@/types/skill";
import { Question } from "@/types/question";
import { QuizAttempt } from "@/types/quiz";
import { getQuiz, getLatestAttempt } from "@/api/quizApi";
import SpeedIndicator from "./SpeedIndicator";
import AskQuestionPanel from "./AskQuestionPanel";
import QuizTakeModal from "./QuizTakeModal";
import styles from "@/styles/collab.module.css";

interface StudentSidebarProps {
  session: CollaborationSession;
  liveSkills: Skill[];
  liveQuestions: Question[];
}

interface SessionQuizRecord {
  skillId: number;
  skillName: string;
  quizId: number;
  score: number | null;
  passed: boolean | null;
  selections: Map<number, number>;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({
  session,
  liveSkills,
  liveQuestions,
}) => {
  const api = useApiContext();
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [promptedQuizId, setPromptedQuizId] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [savedSelections, setSavedSelections] = useState<Map<number, number>>(new Map());
  const [currentRecord, setCurrentRecord] = useState<SessionQuizRecord | null>(null);
  const [history, setHistory] = useState<SessionQuizRecord[]>([]);
  const [viewingRecord, setViewingRecord] = useState<SessionQuizRecord | null>(null);

  // Ref so the effect can safely read currentRecord without it being a dependency
  const currentRecordRef = useRef<SessionQuizRecord | null>(null);
  currentRecordRef.current = currentRecord;

  // Graph API does not include quiz data on skills — fetch the quiz directly
  // when the lecturer sets a prompt. Guards against undefined (backend not yet returning field).
  const isQuizPrompted = session.promptedQuizSkillId != null;
  const promptedSkill = liveSkills.find((s) => s.id === session.promptedQuizSkillId) ?? null;

  useEffect(() => {
    // Archive any completed result before resetting for the new prompt
    if (currentRecordRef.current) {
      setHistory((h) => [...h, currentRecordRef.current!]);
    }
    setCurrentRecord(null);
    setQuizSubmitted(false);
    setSavedSelections(new Map());

    if (!session.promptedQuizSkillId) {
      setPromptedQuizId(null);
      return;
    }
    getQuiz(api, session.promptedQuizSkillId)
      .then(async (q) => {
        setPromptedQuizId(q.id);
        const latest = await getLatestAttempt(api, q.id).catch(() => null);
        if (latest && latest.passed !== null && new Date(latest.attemptedAt) >= new Date(session.startedAt)) {
          setQuizSubmitted(true);
        }
      })
      .catch(() => setPromptedQuizId(null));
  }, [session.promptedQuizSkillId, session.startedAt, api]);

  const handleQuizSubmitSuccess = (sels: Map<number, number>, result: QuizAttempt) => {
    setQuizSubmitted(true);
    setSavedSelections(sels);
    if (promptedSkill && promptedQuizId !== null) {
      setCurrentRecord({
        skillId: promptedSkill.id,
        skillName: promptedSkill.name,
        quizId: promptedQuizId,
        score: result.score,
        passed: result.passed,
        selections: sels,
      });
    }
  };

  const renderResultItem = (record: SessionQuizRecord, onView: () => void, key?: number) => (
    <div key={key} className={styles["quiz-history-item"]}>
      <span className={styles["quiz-history-item__name"]}>{record.skillName}</span>
      <span className={`${styles["quiz-history-item__score"]} ${record.passed ? styles["quiz-history-item__score--passed"] : styles["quiz-history-item__score--failed"]}`}>
        {record.score ?? "—"}%
      </span>
      <button className={styles["quiz-history-item__view-btn"]} onClick={onView}>
        View
      </button>
    </div>
  );

  const renderSessionResults = () => {
    const hasResults = currentRecord !== null || history.length > 0;
    if (!hasResults) return null;
    return (
      <div className={styles["quiz-history"]}>
        <span className={styles["quiz-history__label"]}>Session Results</span>
        {currentRecord && renderResultItem(currentRecord, () => setQuizModalOpen(true))}
        {history.map((record, i) => renderResultItem(record, () => setViewingRecord(record), i))}
      </div>
    );
  };

  const renderQuizPanel = () => (
    <div className={styles["collab-panel"]}>
      <h3 className={styles["collab-panel-title"]}>Quiz</h3>
      {!isQuizPrompted || promptedQuizId === null ? (
        <p className={styles["collab-panel-placeholder"]}>No quiz is currently being prompted.</p>
      ) : (
        <div className={styles["quiz-banner"]}>
          <span className={styles["quiz-banner__skill"]}>{promptedSkill?.name ?? "Quiz"}</span>
          <button
            className={styles["btn-collab-filled"]}
            onClick={() => setQuizModalOpen(true)}
          >
            {quizSubmitted ? "Quiz Done ✓" : "Take Quiz"}
          </button>
        </div>
      )}
      {renderSessionResults()}
    </div>
  );

  const renderQuizModal = () => {
    if (!isQuizPrompted || promptedQuizId === null || !promptedSkill) return null;
    return (
      <QuizTakeModal
        api={api}
        open={quizModalOpen}
        skillId={promptedSkill.id}
        quizId={promptedQuizId}
        onClose={() => setQuizModalOpen(false)}
        sessionStartedAt={session.startedAt}
        savedSelections={savedSelections}
        onSubmitSuccess={handleQuizSubmitSuccess}
      />
    );
  };

  const renderHistoryModal = () => {
    if (!viewingRecord) return null;
    return (
      <QuizTakeModal
        api={api}
        open
        skillId={viewingRecord.skillId}
        quizId={viewingRecord.quizId}
        onClose={() => setViewingRecord(null)}
        sessionStartedAt={session.startedAt}
        savedSelections={viewingRecord.selections}
      />
    );
  };

  return (
    <>
      {renderQuizPanel()}
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
      {renderHistoryModal()}
    </>
  );
};

export default StudentSidebar;
