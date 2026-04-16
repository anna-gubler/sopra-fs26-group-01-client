"use client";

import React from "react";
import { ReactFlow, Background, Node, Edge, NodeMouseHandler, PanOnScrollMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CollaborationSession } from "@/types/session";
import { SkillMap } from "@/types/skillmap";
import { Skill } from "@/types/skill";
import SkillNode from "./SkillNode";
import GradientEdge from "./GradientEdge";
import LaneSeparators from "./LaneSeparators";
import SpeedIndicator from "./SpeedIndicator";
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
  liveSkills: Skill[] | null;
}

const CollabView: React.FC<CollabViewProps> = ({ nodes, edges, skillMap, session, isOwner, onNodeClick, liveSkills: _liveSkills }) => {
  return (
    <div className={styles["collab-layout"]}>
      <aside className={styles["collab-sidebar"]}>
        {isOwner ? (
          <>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Understanding Heatmap</h3>
              <p className={styles["collab-panel-placeholder"]}>Skill ratings will appear here during the session.</p>
            </div>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Speed Indicator</h3>
              <SpeedIndicator isOwner={true} session={session} skillMapId={skillMap.id} />
            </div>
            <div className={styles["collab-panel"]}>
              <h3 className={styles["collab-panel-title"]}>Live Questions</h3>
              <p className={styles["collab-panel-placeholder"]}>Student questions will appear here.</p>
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
              <p className={styles["collab-panel-placeholder"]}>Question input will appear here.</p>
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
          nodes={nodes}
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
