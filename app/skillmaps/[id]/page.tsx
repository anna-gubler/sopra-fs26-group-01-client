"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReactFlow, Background, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BookOpen, Inbox, Bell, Settings } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { getMe } from "@/api/userApi";
import { User } from "@/types/user";
import SkillNode from "./components/SkillNode";
import GradientEdge from "./components/GradientEdge";
import styles from "@/styles/skillmaps.module.css";

const nodeTypes = { skill: SkillNode };
const edgeTypes = { gradient: GradientEdge };

const mockNodes: Node[] = [
  { id: "1", type: "skill", position: { x: 200, y: 60   }, data: { label: "Skill 8", status: "active" } },
  { id: "2", type: "skill", position: { x: 500, y: 60   }, data: { label: "Skill 9", status: "active" } },
  { id: "3", type: "skill", position: { x: 50,  y: 240  }, data: { label: "Skill 5",     status: "secondary" } },
  { id: "4", type: "skill", position: { x: 350, y: 240  }, data: { label: "Skill 6",    status: "active" } },
  { id: "5", type: "skill", position: { x: 650, y: 240  }, data: { label: "Skill 7",   status: "secondary" } },
  { id: "6", type: "skill", position: { x: 50,  y: 420  }, data: { label: "Skill 1",   status: "active", progress: 20 } },
  { id: "7", type: "skill", position: { x: 230, y: 420  }, data: { label: "Skill 2",   status: "default" } },
  { id: "8", type: "skill", position: { x: 410, y: 420  }, data: { label: "Skill 3",   status: "default" } },
  { id: "9", type: "skill", position: { x: 590, y: 420  }, data: { label: "Skill 4",   status: "default" } },
];

const mockEdges: Edge[] = [
  { id: "e1-3", source: "1", target: "3", type: "gradient" },
  { id: "e1-4", source: "1", target: "4", type: "gradient" },
  { id: "e2-4", source: "2", target: "4", type: "gradient" },
  { id: "e2-5", source: "2", target: "5", type: "gradient" },
  { id: "e3-6", source: "3", target: "6", type: "gradient" },
  { id: "e3-7", source: "3", target: "7", type: "gradient" },
  { id: "e4-8", source: "4", target: "8", type: "gradient" },
  { id: "e5-9", source: "5", target: "9", type: "gradient" },
];

const SkillMapEditorPage: React.FC = () => {
  const router = useRouter();
  const api = useApi();
  const [nodes] = useState<Node[]>(mockNodes);
  const [edges] = useState<Edge[]>(mockEdges);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getMe(api).then(setUser).catch(() => {});
  }, [api]);


  // TODO: ADD PUBLISH BUTTON
  return (
    <div className={styles['sm-map-page']}>

      {/* Navbar */}
      <nav className={styles['sm-map-nav']}>
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <BookOpen size={16} color="white" />
          </div>
          <span className={styles['sm-nav-logo']}>Mappd</span>
        </div>
        <div className={styles['sm-nav-right']}>
          <button className={styles['sm-nav-icon']}><Inbox size={20} /></button>
          <button className={styles['sm-nav-icon']}><Bell size={20} /></button>
          <button className={styles['sm-nav-icon']}><Settings size={20} /></button>
          <div className={styles['sm-nav-avatar']} onClick={() => router.push("/users/me")}>
            <span>{user?.username?.[0]?.toUpperCase() ?? "?"}</span>
          </div>
          <span className={styles['sm-nav-username']}>{user?.username ?? ""}</span>
        </div>
      </nav>

      {/* Graph */}
      <div className={styles['sm-map-graph']}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          nodesConnectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--border-color)" gap={40} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default SkillMapEditorPage;
