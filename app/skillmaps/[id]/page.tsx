"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReactFlow, Background, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BookOpen, Globe, Pencil, Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { getMe } from "@/api/userApi";
import { getSkillMap, getSkillMapGraph, getSkillMapMembers, updateSkillMap } from "@/api/skillmapApi";
import { User } from "@/types/user";
import { Skill } from "@/types/skill";
import { SkillMap } from "@/types/skillmap";
import SkillNode from "./components/SkillNode";
import GradientEdge from "./components/GradientEdge";
import LaneSeparators from "./components/LaneSeparators";
import SkillModal from "./components/SkillModal";
import styles from "@/styles/skillmaps.module.css";

const LANE_HEIGHT = 200;
const SKILL_Y_OFFSET = 70;

const nodeTypes = { skill: SkillNode };
const edgeTypes = { gradient: GradientEdge };


const SkillMapEditorPage: React.FC = () => {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const api = useApi();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillMap, setSkillMap] = useState<SkillMap | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getMe(api).then(setUser).catch(() => {});
  }, [api]);

  useEffect(() => {
    if (!user) return;
    getSkillMapMembers(api, id)
      .then((members) => {
        setIsOwner(members.some((m) => m.userId === user.id && m.role === "OWNER"));
      })
      .catch(() => {});
  }, [api, id, user]);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const [map, graph] = await Promise.all([
          getSkillMap(api, id),
          getSkillMapGraph(api, id),
        ]);

        setSkillMap(map);
        setSkills(graph.skills);

        const skillNodes: Node[] = graph.skills.map((skill) => ({
          id: String(skill.id),
          type: "skill",
          position: {
            x: skill.positionX,
            y: (map.numberOfLevels - skill.level) * LANE_HEIGHT + SKILL_Y_OFFSET,
          },
          data: {
            label: skill.name,
            status: skill.isUnlocked ? "active" : "default",
          },
        }));

        const skillEdges: Edge[] = graph.dependencies.map((dep) => ({
          id: `e${dep.fromSkillId}-${dep.toSkillId}`,
          source: String(dep.fromSkillId),
          target: String(dep.toSkillId),
          type: "gradient",
        }));

        setNodes(skillNodes);
        setEdges(skillEdges);
      } catch {
        // keep empty graph on error
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [api, id, refreshKey]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    const skill = skills.find((s) => String(s.id) === node.id);
    if (skill) {
      setEditingSkill(skill);
      setModalOpen(true);
    }
  };

  const handleAddSkill = () => {
    setEditingSkill(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSkill(null);
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditingSkill(null);
    setRefreshKey((k) => k + 1);
  };

  if (loading) {
    return <div className={styles["sm-loading"]}>Loading...</div>;
  }

  return (
    <div className={styles["sm-map-page"]}>
      <nav className={styles["sm-map-nav"]}>
        <div className="nav-logo" style={{ cursor: "pointer" }} onClick={() => router.push("/skillmaps")}>
          <div className="nav-logo-icon">
            <BookOpen size={16} color="white" />
          </div>
          <span className={styles["sm-nav-logo"]}>Mappd</span>
        </div>
        <div className={styles["sm-nav-right"]}>
          <button className="btn-ghost" onClick={handleAddSkill}>
            <Plus size={14} style={{ marginRight: 4 }} />
            Add Skill
          </button>
          {isOwner && !skillMap?.isPublic && (
            <button
              className="btn-ghost"
              onClick={async () => {
                const updated = await updateSkillMap(api, id, { isPublic: true });
                setSkillMap(updated);
              }}
            >
              <Globe size={14} style={{ marginRight: 4 }} />
              Publish
            </button>
          )}
          {isOwner && skillMap?.isPublic && (
            <button className="btn-ghost" onClick={() => router.push(`/skillmaps/${id}/edit`)}>
              <Pencil size={14} style={{ marginRight: 4 }} />
              Edit
            </button>
          )}
          <div
            className={styles["sm-nav-avatar"]}
            onClick={() => router.push("/users/me")}
          >
            <span>{user?.username?.[0]?.toUpperCase() ?? "?"}</span>
          </div>
          <span className={styles["sm-nav-username"]}>{user?.username ?? ""}</span>
        </div>
      </nav>

      <div className={styles["sm-map-graph"]}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesConnectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        >
          {skillMap && (
            <LaneSeparators
              levels={skillMap.numberOfLevels}
              laneHeight={LANE_HEIGHT}
            />
          )}
          <Background color="var(--border-color)" gap={40} />
        </ReactFlow>
      </div>

      {skillMap && (
        <SkillModal
          open={modalOpen}
          skill={editingSkill}
          skills={skills}
          numberOfLevels={skillMap.numberOfLevels}
          skillMapId={id}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default SkillMapEditorPage;
