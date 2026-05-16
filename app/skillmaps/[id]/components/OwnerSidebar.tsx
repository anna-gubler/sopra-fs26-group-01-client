"use client";

import React, { useState } from "react";
import { CollaborationSession } from "@/types/session";
import { Skill } from "@/types/skill";
import { Question } from "@/types/question";
import { DashboardQuizSummary } from "@/types/quiz";
import SpeedIndicator from "./SpeedIndicator";
import LiveQuestionsPanel from "./LiveQuestionsPanel";
import UnderstandingHeatmap from "./UnderstandingHeatmap";
import SessionStatsBar from "./SessionStatsBar";
import CurrentUnderstandingPanel from "./CurrentUnderstandingPanel";
import PromptQuizButton from "./PromptQuizButton";
import QuizResultsPanel from "./QuizResultsPanel";
import { CUResults } from "@/hooks/useCurrentUnderstanding";
import styles from "@/styles/collab.module.css";

interface OwnerSidebarProps {
  displayAggregated: Map<number, { avg: number; count: number }>;
  totalStudents: number;
  session: CollaborationSession;
  skillMapId: number;
  liveSkills: Skill[];
  liveQuestions: Question[];
  quizResults: DashboardQuizSummary[];
  onSkillClick?: (skill: Skill, avg: number) => void;
  cuIsActive: boolean;
  cuStartedAt: string | null;
  cuResults: CUResults | null;
  cuTotalStudents: number;
  onCuTrigger: () => Promise<void>;
}

const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  displayAggregated,
  totalStudents,
  session,
  skillMapId,
  liveSkills,
  liveQuestions,
  quizResults,
  onSkillClick,
  cuIsActive,
  cuStartedAt,
  cuResults,
  cuTotalStudents,
  onCuTrigger,
}) => {
  const [lastCuAvg, setLastCuAvg] = useState<number | null>(null);

  return (
  <>
    <div className={styles["collab-panel"]} data-tour="collab-session-overview">
      <h3 className={styles["collab-panel-title"]}>Session Overview</h3>
      <SessionStatsBar aggregated={displayAggregated} totalStudents={totalStudents} lastCuAvg={lastCuAvg} />
    </div>
    <div className={styles["collab-panel"]} data-tour="collab-current-understanding">
      <h3 className={styles["collab-panel-title"]}>Current Understanding</h3>
      <CurrentUnderstandingPanel
        sessionId={session.id}
        isActive={cuIsActive}
        startedAt={cuStartedAt}
        results={cuResults}
        totalStudents={cuTotalStudents}
        onTrigger={onCuTrigger}
        onLastAvgChange={setLastCuAvg}
      />
    </div>
    <div className={styles["collab-panel"]}>
      <h3 className={styles["collab-panel-title"]}>Quiz</h3>
      <div className={styles["quiz-panel-content"]}>
        <PromptQuizButton skillMapId={skillMapId} session={session} liveSkills={liveSkills} />
        <QuizResultsPanel results={quizResults} skills={liveSkills} />
      </div>
    </div>
    <div data-tour="collab-speed-qa">
      <div className={styles["collab-panel"]}>
        <h3 className={styles["collab-panel-title"]}>Speed Indicator</h3>
        <SpeedIndicator isOwner={true} session={session} />
      </div>
      <div className={styles["collab-panel"]}>
        <h3 className={styles["collab-panel-title"]}>Live Questions</h3>
        <LiveQuestionsPanel questions={liveQuestions} skills={liveSkills} />
      </div>
    </div>
    <div className={styles["collab-panel"]} data-tour="collab-heatmap">
      <h3 className={styles["collab-panel-title"]}>Understanding Heatmap</h3>
      <UnderstandingHeatmap aggregated={displayAggregated} skills={liveSkills} totalStudents={totalStudents} onSkillClick={onSkillClick} />
    </div>
  </>
  );
};

export default OwnerSidebar;
