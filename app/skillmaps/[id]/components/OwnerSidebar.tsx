"use client";

import React from "react";
import { CollaborationSession } from "@/types/session";
import { Skill } from "@/types/skill";
import { Question } from "@/types/question";
import SpeedIndicator from "./SpeedIndicator";
import LiveQuestionsPanel from "./LiveQuestionsPanel";
import UnderstandingHeatmap from "./UnderstandingHeatmap";
import SessionStatsBar from "./SessionStatsBar";
import styles from "@/styles/collab.module.css";

interface OwnerSidebarProps {
  displayAggregated: Map<number, { avg: number; count: number }>;
  totalStudents: number;
  session: CollaborationSession;
  liveSkills: Skill[];
  liveQuestions: Question[];
  onSkillClick?: (skill: Skill, avg: number) => void;
}

const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  displayAggregated,
  totalStudents,
  session,
  liveSkills,
  liveQuestions,
  onSkillClick,
}) => (
  <>
    <div className={styles["collab-panel"]}>
      <h3 className={styles["collab-panel-title"]}>Session Overview</h3>
      <SessionStatsBar aggregated={displayAggregated} totalStudents={totalStudents} />
    </div>
    <div className={styles["collab-panel"]}>
      <h3 className={styles["collab-panel-title"]}>Understanding Heatmap</h3>
      <UnderstandingHeatmap aggregated={displayAggregated} skills={liveSkills} totalStudents={totalStudents} onSkillClick={onSkillClick} />
    </div>
    <div className={styles["collab-panel"]}>
      <h3 className={styles["collab-panel-title"]}>Speed Indicator</h3>
      <SpeedIndicator isOwner={true} session={session} />
    </div>
    <div className={styles["collab-panel"]}>
      <h3 className={styles["collab-panel-title"]}>Live Questions</h3>
      <LiveQuestionsPanel questions={liveQuestions} skills={liveSkills} />
    </div>
  </>
);

export default OwnerSidebar;
