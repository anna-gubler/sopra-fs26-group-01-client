"use client";

import React from "react";
import { CollaborationSession } from "@/types/session";
import { Skill } from "@/types/skill";
import { Question } from "@/types/question";
import SpeedIndicator from "./SpeedIndicator";
import AskQuestionPanel from "./AskQuestionPanel";
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
}) => (
  <>
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
  </>
);

export default StudentSidebar;
