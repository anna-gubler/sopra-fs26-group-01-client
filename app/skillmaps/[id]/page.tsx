"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReactFlow, Background, Node, Edge, addEdge, Connection, applyNodeChanges, NodeChange, IsValidConnection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BookOpen, ChevronLeft, Globe, LogOut, Pencil, Plus, Users } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getMe } from "@/api/userApi";
import { getSkillMap, getSkillMapGraph, getSkillMapMembers, updateSkillMap } from "@/api/skillmapApi";
import { createDependency, deleteDependency, updateSkill } from "@/api/skillApi";
import { User } from "@/types/user";
import { Skill, Dependency } from "@/types/skill";
import { SkillMap } from "@/types/skillmap";
import SkillNode from "./components/SkillNode";
import GradientEdge from "./components/GradientEdge";
import LaneSeparators from "./components/LaneSeparators";
import SkillModal from "./components/SkillModal";
import toast from "react-hot-toast";
import SkillDetailPanel from "./components/SkillDetailPanel";
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
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearId } = useLocalStorage<string>("id", "");

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillMap, setSkillMap] = useState<SkillMap | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
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
    if (!skill) return;
    setSelectedSkill(skill);
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
        const dep = await createDependency(api, id, fromSkillId, toSkillId);
        setDependencies((deps) => deps.map((d) => (d === provisional ? dep : d)));
      } catch (err) {
        toast.error(`Dependency error: ${(err as Error).message}`);
        setEdges((eds) => eds.filter((e) => e.id !== newEdge.id));
        setDependencies((deps) => deps.filter((d) => d !== provisional));
      }
    },
    [api, id]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const dep = dependencies.find(
        (d) => d.fromSkillId === Number(edge.source) && d.toSkillId === Number(edge.target)
      );
      if (!dep) return;
      if (dep.id < 0) { toast("Connection is still being saved…"); return; }

      toast((t) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span>Delete this dependency?</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn-gradient"
              onClick={async () => {
                toast.dismiss(t.id);
                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
                setDependencies((deps) => deps.filter((d) => d.id !== dep.id));
                try {
                  await deleteDependency(api, dep.id);
                } catch {
                  setEdges((eds) => [...eds, edge]);
                  setDependencies((deps) => [...deps, dep]);
                  toast.error("Failed to delete connection.");
                }
              }}
            >
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
    [api, dependencies]
  );


  if (loading) {
    return <div className={styles["sm-loading"]}>Loading...</div>;
  }

  return (
    <div className={styles["sm-map-page"]}>
      <header className={styles["sm-map-header"]}>
        {/* Top bar */}
        <div className={styles["sm-map-topbar"]}>
          <div className={styles["sm-map-topbar-left"]}>
            <div className="nav-logo" style={{ cursor: "pointer" }} role="button" tabIndex={0} onClick={() => router.push("/")} onKeyDown={(e) => e.key === "Enter" && router.push("/")}>
              <div className="nav-logo-icon"><BookOpen size={16} color="white" /></div>
              <span className={styles["sm-nav-logo"]}>Mappd</span>
            </div>
            <div
              className={styles["sm-map-nav-back"]}
              role="button"
              tabIndex={0}
              onClick={() => router.push("/skillmaps")}
              onKeyDown={(e) => e.key === "Enter" && router.push("/skillmaps")}
            >
              <ChevronLeft size={14} />
              <span>Dashboard</span>
            </div>
          </div>
          <div className={styles["sm-map-topbar-right"]}>
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
            <button className={styles["sm-nav-icon"]} onClick={handleLogout} title="Log Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Title bar */}
        <div className={styles["sm-map-titlebar"]}>
          <div className={styles["sm-map-titlebar-left"]}>
            <h1 className={styles["sm-map-title"]}>{skillMap?.title ?? ""}</h1>
          </div>
          <div className={styles["sm-map-titlebar-right"]}>
            <div className={styles["sm-map-titlebar-placeholder"]}>
              <Users size={14} />
              <span>— Students</span>
            </div>
            <div className={styles["sm-map-collab-badge"]}>
              <span className={styles["sm-map-collab-dot"]} />
              LIVE COLLABORATION
            </div>
            {isOwner && (
              <button className="btn-ghost" onClick={handleAddSkill}>
                <Plus size={14} style={{ marginRight: 4 }} />
                Add Skill
              </button>
            )}
            {isOwner && !skillMap?.isPublic && (
              <button className="btn-ghost" onClick={async () => { const updated = await updateSkillMap(api, id, { isPublic: true }); setSkillMap(updated); }}>
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
          </div>
        </div>
      </header>

      <div className={styles["sm-map-graph"]} style={{ position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={handleNodeClick}
          onNodeDragStop={handleNodeDragStop}
          onConnect={handleConnect}
          isValidConnection={isValidConnection}
          onEdgeClick={handleEdgeClick}

          fitView
          fitViewOptions={{ padding: 0.3 }}
          panOnDrag={true}
          panOnScroll={true}
          zoomOnScroll={false}
          zoomOnPinch={true}
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

      {selectedSkill && (
        <SkillDetailPanel
          skill={selectedSkill}
          dependencies={edges
            .filter((e) => e.target === String(selectedSkill.id))
            .map((e) => skills.find((s) => String(s.id) === e.source))
            .filter((s): s is Skill => s !== undefined)}
          onClose={() => setSelectedSkill(null)}
          isOwner={isOwner}
          onEdit={() => {
            setEditingSkill(selectedSkill);
            setSelectedSkill(null);
            setModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default SkillMapEditorPage;
