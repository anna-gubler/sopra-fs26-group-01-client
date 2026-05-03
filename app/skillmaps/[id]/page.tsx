"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReactFlow, Background, Node, Edge, PanOnScrollMode, addEdge, Connection, applyNodeChanges, NodeChange, IsValidConnection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Globe, Pencil, Plus, Play, Square, Copy, ChevronLeft, LogOut } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDashboardPolling } from "@/hooks/useDashboardPolling";
import { ApiContext } from "@/context/ApiContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getMe } from "@/api/userApi";
import { getSkillMap, getSkillMapGraph, updateSkillMap } from "@/api/skillmapApi";
import { createDependency, deleteDependency, getSkill, updateSkill } from "@/api/skillApi";
import { startSession, endSession } from "@/api/sessionApi";
import { ApplicationError } from "@/types/error";
import { getAvatarUrl } from "@/utils/avatar";
import { User } from "@/types/user";
import { Skill, Dependency } from "@/types/skill";
import { SkillMap } from "@/types/skillmap";
import SkillNode from "./components/SkillNode";
import GradientEdge from "./components/GradientEdge";
import LaneSeparators from "./components/LaneSeparators";
import SkillModal from "./components/SkillModal";
import CollabView from "./components/CollabView";
import SkillDetailPanel from "./components/SkillDetailPanel";
import SkillLegend from "./components/SkillLegend";
import styles from "@/styles/skillmaps.module.css";
import collabStyles from "@/styles/collab.module.css";
import toast from "react-hot-toast";

const PublishButton: React.FC<{ onPublish: () => Promise<void> }> = ({ onPublish }) => {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button className={`btn-ghost ${styles["sm-nav-btn"]}`} onClick={() => setConfirming(true)}>
        <Globe size={14} />
        Publish
      </button>
    );
  }
  return (
    <>
      <button className={`btn-ghost ${styles["sm-nav-btn"]}`} onClick={() => setConfirming(false)}>
        Cancel
      </button>
      <button
        className={`btn-gradient btn-no-lift ${styles["sm-nav-btn"]}`}
        onClick={async () => { await onPublish(); setConfirming(false); }}
      >
        <Globe size={14} />
        Confirm Publish
      </button>
    </>
  );
};

const LANE_HEIGHT = 200;
const SKILL_Y_OFFSET = 70;
const NAV_HEIGHT = 56;

const nodeTypes = { skill: SkillNode };
const edgeTypes = { gradient: GradientEdge };

const defaultEdgeOptions = {
  style: { stroke: "#333355", strokeWidth: 1.5 },
  animated: false,
};


const SkillMapEditorPage: React.FC = () => {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const api = useApi();
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearId } = useLocalStorage<string>("id", "");

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillMap, setSkillMap] = useState<SkillMap | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isOwner = skillMap?.ownerId === user?.id;
  const canPublish = isOwner && !skillMap?.isPublic;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedSkillRating, setSelectedSkillRating] = useState<number | null>(null);
  const [liveAggregated, setLiveAggregated] = useState<Map<number, { avg: number; count: number }>>(new Map());
  const [refreshKey, setRefreshKey] = useState(0);

  const { session, isActive, refresh: refreshSession, setSession, liveSkills, liveQuestions } = useDashboardPolling(api, id);

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

        const difficultyStatus: Record<string, string> = {
          easy: "done",
          medium: "active",
          hard: "secondary",
        };

        const skillNodes: Node[] = graph.skills.map((skill) => ({
          id: String(skill.id),
          type: "skill",
          position: {
            x: skill.positionX,
            y: (map.numberOfLevels - skill.level) * LANE_HEIGHT + SKILL_Y_OFFSET,
          },
          data: {
            label: skill.name,
            status: difficultyStatus[skill.difficulty] ?? "default",
            isLocked: skill.isLocked,
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
        setDependencies(graph.dependencies);
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

  useEffect(() => {
    if (!selectedSkill) return;
    getSkill(api, selectedSkill.id)
      .then((fresh) => setSelectedSkill(fresh))
      .catch(() => {});
  }, [selectedSkill?.id]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    const skill = skills.find((s) => String(s.id) === node.id);
    if (!skill) return;
    setSelectedSkill(skill);
    setSelectedSkillRating(liveAggregated.get(skill.id)?.avg ?? null);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // still log out locally if server unreachable
    }
    clearToken();
    clearId();
    router.push("/login");
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
  const graphHeight = typeof window !== "undefined" ? window.innerHeight - NAV_HEIGHT : 600;
  const graphWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const contentHeight = (skillMap?.numberOfLevels ?? 0) * LANE_HEIGHT;
  const bottomViewportY = graphHeight - contentHeight - 20;

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const handleNodeDragStop = useCallback(
    async (_: React.MouseEvent, node: Node) => {
      const numLevels = skillMap?.numberOfLevels ?? 1;
      const rawLevel = numLevels - (node.position.y - SKILL_Y_OFFSET) / LANE_HEIGHT;
      const newLevel = Math.max(1, Math.min(numLevels, Math.round(rawLevel)));
      const snappedY = (numLevels - newLevel) * LANE_HEIGHT + SKILL_Y_OFFSET;
      const newPositionX = Math.round(node.position.x);

      const originalSkill = skills.find((s) => s.id === Number(node.id));
      if (!originalSkill) return;
      if (originalSkill.positionX === newPositionX && originalSkill.level === newLevel) return;

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, position: { x: newPositionX, y: snappedY } } : n
        )
      );
      setSkills((prev) =>
        prev.map((s) =>
          s.id === Number(node.id) ? { ...s, positionX: newPositionX, level: newLevel } : s
        )
      );

      try {
        await updateSkill(api, Number(node.id), { positionX: newPositionX, level: newLevel });
      } catch {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, position: { x: originalSkill.positionX, y: (numLevels - originalSkill.level) * LANE_HEIGHT + SKILL_Y_OFFSET } }
              : n
          )
        );
        setSkills((prev) =>
          prev.map((s) => (s.id === Number(node.id) ? originalSkill : s))
        );
        toast.error("Failed to move skill.");
      }
    },
    [api, skillMap, skills]
  );

  const isValidConnection: IsValidConnection = useCallback(
    (connection) => {
      if (connection.source === connection.target) return false;
      const sourceSkill = skills.find((s) => String(s.id) === connection.source);
      const targetSkill = skills.find((s) => String(s.id) === connection.target);
      if (!sourceSkill || !targetSkill) return false;
      return sourceSkill.level < targetSkill.level;
    },
    [skills]
  );

  const handleConnect = useCallback(
    async (connection: Connection) => {
      const fromSkillId = Number(connection.source);
      const toSkillId = Number(connection.target);
      const newEdge: Edge = { ...connection, id: `e${fromSkillId}-${toSkillId}`, type: "gradient" };
      const provisional: Dependency = { id: -1, fromSkillId, toSkillId, createdAt: "", updatedAt: "" };
      setEdges((eds) => addEdge(newEdge, eds));
      setDependencies((deps) => [...deps, provisional]);
      try {
        const dep = await createDependency(api, id, { fromSkillId, toSkillId });
        setDependencies((deps) => deps.map((d) => (d === provisional ? dep : d)));
      } catch (err) {
        toast.error(`Dependency error: ${(err as Error).message}`);
        setEdges((eds) => eds.filter((e) => e.id !== newEdge.id));
        setDependencies((deps) => deps.filter((d) => d !== provisional));
      }
    },
    [api, id]
  );

  const handleConfirmDeleteEdge = useCallback(
    async (toastId: string, edge: Edge, dep: Dependency) => {
      toast.dismiss(toastId);
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      setDependencies((deps) => deps.filter((d) => d.id !== dep.id));
      try {
        await deleteDependency(api, dep.id);
      } catch {
        setEdges((eds) => [...eds, edge]);
        setDependencies((deps) => [...deps, dep]);
        toast.error("Failed to delete connection.");
      }
    },
    [api]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const dep = dependencies.find(
        (d) => d.fromSkillId === Number(edge.source) && d.toSkillId === Number(edge.target)
      );
      if (!dep) return;
      if (dep.id < 0) { toast("Connection is still being saved…"); return; }

      toast((t) => (
        <div className={styles["toast-body"]}>
          <span>Delete this dependency?</span>
          <div className={styles["toast-actions"]}>
            <button className="btn-gradient" onClick={() => handleConfirmDeleteEdge(t.id, edge, dep)}>
              Confirm
            </button>
            <button className="btn-ghost" onClick={() => toast.dismiss(t.id)}>
              Cancel
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        style: {
          background: "var(--bg-elevated)",
          color: "var(--text-bright)",
          border: "1px solid var(--border-color)",
        },
      });
    },
    [api, dependencies, handleConfirmDeleteEdge]
  );

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
          {canPublish && (
            <PublishButton
              onPublish={async () => {
                try {
                  const updated = await updateSkillMap(api, id, { isPublic: true });
                  setSkillMap(updated);
                } catch {
                  toast.error("Failed to publish map. Please try again.");
                }
              }}
            />
          )}
          {isOwner && isActive && (
            <button
              className={`btn-ghost btn-sm ${styles["sm-nav-btn"]} ${collabStyles["btn-collab"]}`}
              onClick={async () => {
                try {
                  await endSession(api, id);
                  refreshSession();
                } catch {
                  toast.error("Failed to end session. Please try again.");
                }
              }}
            >
              <Square size={14} />
              End Session
            </button>
          )}
          {isOwner && !isActive && skillMap?.isPublic && (
            <button
              className={`btn-ghost btn-sm ${styles["sm-nav-btn"]} ${collabStyles["btn-collab"]}`}
              onClick={async () => {
                try {
                  const raw = await startSession(api, id);
                  const s = { ...raw, isActive: raw.isActive ?? (raw as unknown as { active: boolean }).active };
                  setSession(s);
                } catch (err) {
                  if ((err as { status?: number }).status === 409) {
                    refreshSession();
                  } else {
                    throw err;
                  }
                }
              }}
            >
              <Play size={14} />
              Start Session
            </button>
          )}
          <div
            className={styles["sm-nav-avatar"]}
            role="button"
            tabIndex={0}
            aria-label="Go to profile"
            onClick={() => router.push("/users/me")}
            onKeyDown={(e) => e.key === "Enter" && router.push("/users/me")}
          >
            <img
              src={getAvatarUrl(user?.seed ?? null, user?.style ?? null)}
              alt={user?.username ?? "avatar"}
              className={styles["sm-nav-avatar-img"]}
            />
          </div>
          <span className={styles["sm-nav-username"]}>{user?.username ?? ""}</span>
          <button className={styles["sm-nav-icon"]} onClick={handleLogout} title="Log Out">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {isActive && skillMap && session ? (
        <ApiContext.Provider value={api}>
          <CollabView
            nodes={nodes}
            edges={edges}
            skillMap={skillMap}
            session={session}
            isOwner={isOwner}
            onNodeClick={handleNodeClick}
            onSkillClick={(skill, avg) => { setSelectedSkill(skill); setSelectedSkillRating(avg); }}
            onAggregatedChange={setLiveAggregated}
            liveSkills={liveSkills}
            liveQuestions={liveQuestions}
          />
        </ApiContext.Provider>
      ) : (
        <>
          <div className={styles["sm-map-graph"]} role="application" aria-label="Skill map canvas">
            <ReactFlow
              key={refreshKey}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              onNodesChange={onNodesChange}
              onNodeClick={handleNodeClick}
              onNodeDragStop={handleNodeDragStop}
              onConnect={handleConnect}
              isValidConnection={isValidConnection}
              onEdgeClick={handleEdgeClick}
              fitView={!isScrollable}
              fitViewOptions={{ padding: 0.3 }}
              defaultViewport={isScrollable ? { x: 0, y: bottomViewportY, zoom: 1 } : undefined}
              translateExtent={isScrollable ? [[-300, -50], [graphWidth + 300, (skillMap?.numberOfLevels ?? 0) * LANE_HEIGHT + 50]] : [[-Infinity, -Infinity], [Infinity, Infinity]]}
              panOnDrag={false}
              panOnScroll={isScrollable}
              panOnScrollMode={PanOnScrollMode.Free}
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
              <Background color="#252540" gap={24} />
              <SkillLegend />
            </ReactFlow>
          </div>

          {skillMap && (
            <SkillModal
              api={api}
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

      {selectedSkill && (
        <SkillDetailPanel
          skill={selectedSkill}
          dependencies={edges
            .filter((e: Edge) => e.target === String(selectedSkill.id))
            .map((e: Edge) => skills.find((s: Skill) => String(s.id) === e.source))
            .filter((s): s is Skill => s !== undefined)}
          onClose={() => { setSelectedSkill(null); setSelectedSkillRating(null); }}
          isOwner={isOwner}
          onEdit={() => {
            setEditingSkill(selectedSkill);
            setSelectedSkill(null);
            setSelectedSkillRating(null);
            setModalOpen(true);
          }}
          onUnderstoodChange={(skillId, isUnderstood) => {
            setSkills((prev) =>
              prev.map((s) => s.id === skillId ? { ...s, isUnderstood } : s)
            );
            setSelectedSkill((prev) =>
              prev && prev.id === skillId ? { ...prev, isUnderstood } : prev
            );
          }}
          api={api}
          sessionId={isActive && session ? session.id : null}
          liveRating={selectedSkillRating}
        />
      )}
    </div>
  );
};

export default SkillMapEditorPage;
