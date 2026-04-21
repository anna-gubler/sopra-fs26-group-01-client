"use client";

import React, { useMemo, useState } from "react";
import { ReactFlow, Background, Node, Edge, NodeMouseHandler, PanOnScrollMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CollaborationSession } from "@/types/session";
import { SkillMap } from "@/types/skillmap";
import { Skill } from "@/types/skill";
import { Question } from "@/types/question";
import SkillNode from "./SkillNode";
import GradientEdge from "./GradientEdge";
import LaneSeparators from "./LaneSeparators";
import { ratingColor } from "./UnderstandingHeatmap";
import { RatingAggregate } from "@/hooks/useSessionRatings";
import OwnerSidebar from "./OwnerSidebar";
import StudentSidebar from "./StudentSidebar";
import styles from "@/styles/collab.module.css";

const LANE_HEIGHT = 200;

const nodeTypes = { skill: SkillNode };
const edgeTypes = { gradient: GradientEdge };

interface CollabViewProps {
  nodes: Node[];
  edges: Edge[];
  skillMap: SkillMap;
  session: CollaborationSession;
  isOwner: boolean;
  onNodeClick: NodeMouseHandler;
  onSkillClick?: (skill: Skill, avg: number) => void;
  onAggregatedChange?: (aggregated: Map<number, { avg: number; count: number }>) => void;
  liveSkills: Skill[] | null;
  liveQuestions: Question[] | null;
}

const CollabView: React.FC<CollabViewProps> = ({ nodes, edges, skillMap, session, isOwner, onNodeClick, onSkillClick, onAggregatedChange, liveSkills, liveQuestions }) => {
  const [aggregated, setAggregated] = useState<Map<number, RatingAggregate>>(new Map());

  const glowedNodes = useMemo(() => {
    if (!isOwner || aggregated.size === 0) return nodes;
    return nodes.map((node) => {
      const skillId = Number(node.id);
      const agg = aggregated.get(skillId);
      if (!agg) return node;
      const color = ratingColor(agg.avg);
      return { ...node, data: { ...node.data, glowColor: color, heatPercent: agg.avg } };
    });
  }, [nodes, isOwner, aggregated]);

  const handleAggregatedChange = (agg: Map<number, RatingAggregate>) => {
    setAggregated(agg);
    onAggregatedChange?.(agg);
  };

  return (
    <div className={styles["collab-layout"]}>
      <aside className={styles["collab-sidebar"]}>
        {isOwner ? (
          <OwnerSidebar
            session={session}
            skillMapId={skillMap.id}
            liveSkills={liveSkills ?? []}
            liveQuestions={liveQuestions ?? []}
            onSkillClick={onSkillClick}
            onAggregatedChange={handleAggregatedChange}
          />
        ) : (
          <StudentSidebar
            session={session}
            skillMapId={skillMap.id}
            liveSkills={liveSkills ?? []}
            liveQuestions={liveQuestions ?? []}
          />
        )}
        <div className={styles["collab-session-meta"]}>
          <span>Session #{session.id}</span>
          <span className={styles["collab-live-dot"]} />
          <span>Live</span>
        </div>
      </aside>
      <div className={styles["collab-graph"]} role="application" aria-label="Collaboration skill map canvas">
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
          <Background color="#252540" gap={24} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default CollabView;
