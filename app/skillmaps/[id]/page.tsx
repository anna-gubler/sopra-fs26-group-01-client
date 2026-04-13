"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReactFlow, Background, Node, Edge, PanOnScrollMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Globe, Pencil, Plus, Play, Square, Copy, ChevronLeft } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { getMe } from "@/api/userApi";
import { getSkillMap, getSkillMapGraph, updateSkillMap } from "@/api/skillmapApi";
import { startSession, endSession } from "@/api/sessionApi";
import { ApplicationError } from "@/types/error";
import { User } from "@/types/user";
import { Skill } from "@/types/skill";
import { SkillMap } from "@/types/skillmap";
import SkillNode from "./components/SkillNode";
import GradientEdge from "./components/GradientEdge";
import LaneSeparators from "./components/LaneSeparators";
import SkillModal from "./components/SkillModal";
import CollabView from "./components/CollabView";
import styles from "@/styles/skillmaps.module.css";
import collabStyles from "@/styles/collab.module.css";
import toast from "react-hot-toast";

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
  const isOwner = skillMap?.ownerId === user?.id;
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { session, isActive, refresh: refreshSession } = useSessionStatus(api, id);

  useEffect(() => {
    getMe(api).then(setUser).catch(() => {});
  }, [api]);

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
      } catch (err) {
        const status = (err as ApplicationError).status;
        if (status === 403) {
          toast.error("You don't have access to this map.");
        } else if (status === 404) {
          toast.error("This map doesn't exist.");
        } else {
          toast.error("Failed to load map.");
        }
        router.push("/skillmaps");
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

  const isScrollable = (skillMap?.numberOfLevels ?? 0) > 4;
  const NAV_HEIGHT = 64;
  const graphHeight = typeof window !== "undefined" ? window.innerHeight - NAV_HEIGHT : 600;
  const contentHeight = (skillMap?.numberOfLevels ?? 0) * LANE_HEIGHT;
  const bottomViewportY = graphHeight - contentHeight - 20;

  if (loading) {
    return <div className={styles["sm-loading"]}>Loading...</div>;
  }

  return (
    <div className={styles["sm-map-page"]}>
      <nav className={`${styles["sm-map-nav"]} ${isActive ? collabStyles["sm-map-nav--collab"] : ""}`}>
        <button className={`btn-ghost ${styles["sm-nav-btn"]}`} onClick={() => router.push("/skillmaps")}>
          <ChevronLeft size={14} />
          Dashboard
        </button>
        {isActive && (
          <div className={collabStyles["collab-live-badge"]}>
            <span className={collabStyles["collab-live-badge-dot"]} />
            LIVE
          </div>
        )}
        <div className={styles["sm-nav-right"]}>
          {isOwner && !isActive && (
            <button className={`btn-ghost ${styles["sm-nav-btn"]}`} onClick={handleAddSkill}>
              <Plus size={14} />
              Add Skill
            </button>
          )}
          {isOwner && !isActive && (
            <button
              className="btn-ghost"
              onClick={async () => {
                await startSession(api, id);
                refreshSession();
              }}
            >
              <Play size={14} style={{ marginRight: 4 }} />
              Start Session
            </button>
          )}
          {isOwner && isActive && (
            <button
              className="btn-ghost"
              onClick={async () => {
                await endSession(api, id);
                refreshSession();
              }}
            >
              <Square size={14} style={{ marginRight: 4 }} />
              End Session
            </button>
          )}
          {isOwner && !skillMap?.isPublic && !confirmingPublish && (
            <button className={`btn-ghost ${styles["sm-nav-btn"]}`} onClick={() => setConfirmingPublish(true)}>
              <Globe size={14} />
              Publish
            </button>
          )}
          {isOwner && !skillMap?.isPublic && confirmingPublish && (
            <>
              <button className={`btn-ghost ${styles["sm-nav-btn"]}`} onClick={() => setConfirmingPublish(false)}>
                Cancel
              </button>
              <button
                className={`btn-gradient ${styles["sm-nav-btn"]}`}
                onClick={async () => {
                  const updated = await updateSkillMap(api, id, { isPublic: true });
                  setSkillMap(updated);
                  setConfirmingPublish(false);
                }}
              >
                <Globe size={14} />
                Confirm Publish
              </button>
            </>
          )}
          {isOwner && skillMap?.isPublic && (
            <button className={`btn-ghost ${styles["sm-nav-btn"]}`} onClick={() => router.push(`/skillmaps/${id}/edit`)}>
              <Pencil size={14} />
              Edit
            </button>
          )}
          {isOwner && skillMap?.inviteCode && (
            <button
              className={`btn-ghost ${styles["sm-nav-btn"]}`}
              onClick={() => {
                navigator.clipboard.writeText(skillMap.inviteCode).then(() => {
                  toast.success("Invite code copied!");
                }).catch(() => {
                  const el = document.createElement("textarea");
                  el.value = skillMap.inviteCode;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand("copy");
                  document.body.removeChild(el);
                  toast.success("Invite code copied!");
                });
              }}
            >
              <Copy size={14} />
              {skillMap.inviteCode}
            </button>
          )}
          <div
            className={styles["sm-nav-avatar"]}
            role="button"
            tabIndex={0}
            onClick={() => router.push("/users/me")}
            onKeyDown={(e) => e.key === "Enter" && router.push("/users/me")}
          >
            <span>{user?.username?.[0]?.toUpperCase() ?? "?"}</span>
          </div>
          <span className={styles["sm-nav-username"]}>{user?.username ?? ""}</span>
        </div>
      </nav>

      {isActive && skillMap && session ? (
        <CollabView
          nodes={nodes}
          edges={edges}
          skillMap={skillMap}
          session={session}
          isOwner={isOwner}
        />
      ) : (
        <>
          <div className={styles["sm-map-graph"]}>
            <ReactFlow
              key={refreshKey}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeClick={handleNodeClick}
              fitView={!isScrollable}
              fitViewOptions={{ padding: 0.3 }}
              defaultViewport={isScrollable ? { x: 0, y: bottomViewportY, zoom: 1 } : undefined}
              translateExtent={isScrollable ? [[-Infinity, -50], [Infinity, (skillMap?.numberOfLevels ?? 0) * LANE_HEIGHT + 50]] : [[-Infinity, -Infinity], [Infinity, Infinity]]}
              nodesConnectable={false}
              panOnDrag={false}
              panOnScroll={isScrollable}
              panOnScrollMode={isScrollable ? PanOnScrollMode.Vertical : PanOnScrollMode.Free}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              zoomActivationKeyCode={null}
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
        </>
      )}
    </div>
  );
};

export default SkillMapEditorPage;
