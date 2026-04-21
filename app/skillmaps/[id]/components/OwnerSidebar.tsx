"use client";

import React, { useEffect } from "react";
import { CollaborationSession } from "@/types/session";
import { Skill } from "@/types/skill";
import { Question } from "@/types/question";
import SpeedIndicator from "./SpeedIndicator";
import LiveQuestionsPanel from "./LiveQuestionsPanel";
import UnderstandingHeatmap from "./UnderstandingHeatmap";
import SessionStatsBar from "./SessionStatsBar";
import { useSessionRatings, RatingAggregate } from "@/hooks/useSessionRatings";
import styles from "@/styles/collab.module.css";

interface OwnerSidebarProps {
  session: CollaborationSession;
  skillMapId: number;
  liveSkills: Skill[];
  liveQuestions: Question[];
  onSkillClick?: (skill: Skill, avg: number) => void;
  onAggregatedChange?: (aggregated: Map<number, RatingAggregate>) => void;
}

const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  session,
  skillMapId,
  liveSkills,
  liveQuestions,
  onSkillClick,
  onAggregatedChange,
}) => {
  const { aggregated, totalStudents } = useSessionRatings(session.id, skillMapId);

  useEffect(() => {
    onAggregatedChange?.(aggregated);
  }, [aggregated, onAggregatedChange]);

  return (
    <>
      <div className={styles["collab-panel"]}>
        <h3 className={styles["collab-panel-title"]}>Session Overview</h3>
        <SessionStatsBar aggregated={aggregated} totalStudents={totalStudents} />
      </div>
      <div className={styles["collab-panel"]}>
        <h3 className={styles["collab-panel-title"]}>Understanding Heatmap</h3>
        <UnderstandingHeatmap aggregated={aggregated} skills={liveSkills} totalStudents={totalStudents} onSkillClick={onSkillClick} />
      </div>
      <div className={styles["collab-panel"]}>
        <h3 className={styles["collab-panel-title"]}>Speed Indicator</h3>
        <SpeedIndicator isOwner={true} session={session} skillMapId={skillMapId} />
      </div>
      <div className={styles["collab-panel"]}>
        <h3 className={styles["collab-panel-title"]}>Live Questions</h3>
        <LiveQuestionsPanel questions={liveQuestions} skills={liveSkills} />
      </div>
    </>
  );
};

export default OwnerSidebar;
