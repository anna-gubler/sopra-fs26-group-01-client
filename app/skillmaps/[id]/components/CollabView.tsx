"use client";

import React, { useMemo } from "react";
import { ReactFlow, Background, Node, Edge, NodeMouseHandler, PanOnScrollMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CollaborationSession } from "@/types/session";
import { SkillMap } from "@/types/skillmap";
import { Skill } from "@/types/skill";
import { Question } from "@/types/question";
import SkillNode from "./SkillNode";
import GradientEdge from "./GradientEdge";
import LaneSeparators from "./LaneSeparators";
import SpeedIndicator from "./SpeedIndicator";
import LiveQuestionsPanel from "./LiveQuestionsPanel";
import AskQuestionPanel from "./AskQuestionPanel";
import UnderstandingHeatmap, { ratingColor } from "./UnderstandingHeatmap";
import SessionStatsBar from "./SessionStatsBar";
import { useSessionRatings } from "@/hooks/useSessionRatings";
import styles from "@/styles/collab.module.css";

const LANE_HEIGHT = 200;
// TODO: remove once backend ratings are wired up
const MOCK_AVGS = [15, 35, 72, 55, 88, 42, 28, 63];

const nodeTypes = { skill: SkillNode };
const edgeTypes = { gradient: GradientEdge };

interface CollabViewProps {
  nodes: Node[];
  edges: Edge[];
  skillMap: SkillMap;
  session: CollaborationSession;
  isOwner: boolean;
  onNodeClick: NodeMouseHandler;
  onSkillClick?: (skill: Skill) => void;
  liveSkills: Skill[] | null;
  liveQuestions: Question[] | null;
}

const CollabView: React.FC<CollabViewProps> = ({ nodes, edges, skillMap, session, isOwner, onNodeClick, onSkillClick, liveSkills, liveQuestions }) => {
  const { aggregated, totalStudents } = useSessionRatings(session.id, skillMap.id);

  const displayAggregated = useMemo(() => {
    if (aggregated.size > 0 || !liveSkills?.length) return aggregated;
    const mock = new Map<number, { avg: number; count: number }>();
    liveSkills.forEach((s, i) => {
      mock.set(s.id, { avg: MOCK_AVGS[i % MOCK_AVGS.length], count: i % 3 + 1 });
    });
    return mock;
  }, [aggregated, liveSkills]);

  const glowedNodes = useMemo(() => {
    if (!isOwner || displayAggregated.size === 0) return nodes;
    return nodes.map((node) => {
      const skillId = Number(node.id);
      const agg = displayAggregated.get(skillId);
      if (!agg) return node;
      const color = ratingColor(agg.avg);
      return { ...node, data: { ...node.data, glowColor: color, heatPercent: agg.avg } };
    });
  }, [nodes, isOwner, aggregated]);

  return (
    <div className={styles["collab-layout"]}>
      <aside className={styles["collab-sidebar"]}>
        {isOwner ? (
          <>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Session Overview</h3>
              <SessionStatsBar aggregated={displayAggregated} totalStudents={totalStudents} />
            </div>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Understanding Heatmap</h3>
              <UnderstandingHeatmap aggregated={displayAggregated} skills={liveSkills ?? []} totalStudents={totalStudents} onSkillClick={onSkillClick} />
            </div>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Speed Indicator</h3>
              <SpeedIndicator isOwner={true} session={session} skillMapId={skillMap.id} />
            </div>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Live Questions</h3>
              <LiveQuestionsPanel
                questions={liveQuestions ?? []}
                skills={liveSkills ?? []}
              />
            </div>
          </>
        ) : (
          <>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Rate Understanding</h3>
              <p className={styles["collab-panel-placeholder"]}>Select a skill on the graph to rate your understanding.</p>
            </div>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Session Speed</h3>
              <SpeedIndicator isOwner={false} session={session} skillMapId={skillMap.id} />
            </div>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Ask a Question</h3>
              <AskQuestionPanel
                session={session}
                skills={liveSkills ?? []}
                questions={liveQuestions ?? []}
              />
            </div>
          </>
        )}
        <div className={styles["collab-session-meta"]}>
          <span>Session #{session.id}</span>
          <span className={styles["collab-live-dot"]} />
          <span>Live</span>
        </div>
      </aside>
      <div className={styles["collab-graph"]}>
        <ReactFlow
          nodes={glowedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesConnectable={false}
          onNodeClick={onNodeClick}
          nodesDraggable={false}
          panOnDrag={false}
          panOnScroll={skillMap.numberOfLevels > 4}
          panOnScrollMode={PanOnScrollMode.Vertical}
          translateExtent={skillMap.numberOfLevels > 4 ? [[-Infinity, -50], [Infinity, skillMap.numberOfLevels * LANE_HEIGHT + 50]] : [[-Infinity, -Infinity], [Infinity, Infinity]]}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          zoomActivationKeyCode={null}
          proOptions={{ hideAttribution: true }}
        >
          <LaneSeparators levels={skillMap.numberOfLevels} laneHeight={LANE_HEIGHT} />
          <Background color="var(--border-color)" gap={40} />
        </ReactFlow>
      </div>

    </div>
  );
};

export default CollabView;
