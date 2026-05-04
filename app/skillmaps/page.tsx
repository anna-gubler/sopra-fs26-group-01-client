"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { getSkillMaps, getSkillMapGraph, getSkillMapMembers, joinSkillMap, exportSkillMap, importSkillMap } from "@/api/skillmapApi";
import { getMe } from "@/api/userApi";
import { SkillMap } from "@/types/skillmap";
import { User } from "@/types/user";
import { BookOpen, LogOut, Download } from "lucide-react";
import ExportModal from "@/skillmaps/[id]/components/ExportModal";

type MapStats = {
  skillCount: number;
  unlockedCount: number;
  memberCount: number;
};
import toast from "react-hot-toast";
import styles from "@/styles/skillmaps.module.css";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getAvatarUrl } from "@/utils/avatar";
import { ApplicationError } from "@/types/error";

const SkillMapsPage: React.FC = () => {
  const router = useRouter();
  const api = useApi();
  const [skillMaps, setSkillMaps] = useState<SkillMap[]>([]);
  const [mapStats, setMapStats] = useState<Record<number, MapStats>>({});
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearId } = useLocalStorage<string>("id", "");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [exportingMap, setExportingMap] = useState<SkillMap | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    try {
      const map = await importSkillMap(api, file);
      router.push(`/skillmaps/${map.id}`);
    } catch (err) {
      toast.error((err as ApplicationError).details ?? "Failed to import skill map.");
    }
  };

  const handleExport = async (mapId: number, title: string) => {
    try {
      const blob = await exportSkillMap(api, mapId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Skill map exported!");
    } catch (err) {
      toast.error((err as ApplicationError).details ?? "Failed to export skill map.");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // still log out locally if the server is unreachable
    }
    clearToken();
    clearId();
    router.push("/login");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    let code = inviteCode.trim();
    try {
      const url = new URL(code);
      code = url.searchParams.get("code") ?? code;
    } catch {
      // not a URL, use as-is
    }
    try {
      const joined = await joinSkillMap(api, code);
      router.push(`/skillmaps/${joined.skillMapId}`);
    } catch (err) {
      if (err instanceof Error) {
        const status = (err as ApplicationError).status;
        if (status === 404) toast.error("Invalid invite code.");
        else if (status === 403) toast.error("This map is private.");
        else if (status === 409) toast.error("You're already a member of this map.");
        else toast.error("Failed to join map.");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [maps, me] = await Promise.all([
          getSkillMaps(api),
          getMe(api),
        ]);
        setSkillMaps(maps);
        setUser(me);

        const statsEntries = await Promise.all(
          maps.map(async (map) => {
            const [graph, members] = await Promise.all([
              getSkillMapGraph(api, map.id),
              getSkillMapMembers(api, map.id),
            ]);
            return [map.id, {
              skillCount: graph.skills.length,
              unlockedCount: graph.skills.filter((s) => s.isUnderstood).length,
              memberCount: members.filter((m) => m.role === "STUDENT").length,
            }] as [number, MapStats];
          })
        );
        setMapStats(Object.fromEntries(statsEntries));
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to load skill maps: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  if (loading) {
    return <div className={styles['sm-loading']}>Loading...</div>;
  }

  return (
    <div className={styles['sm-page']}>
      <div className="grid-overlay" />

      {/* Navbar */}
      <nav className={styles['sm-nav']}>
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <BookOpen size={16} color="white" />
          </div>
          <span className="nav-logo-text">SkillMaps</span>
        </div>
        <div className={styles['sm-nav-right']}>
          <button
            onClick={() => router.push("/users/me")}
            className={styles['sm-nav-avatar']}
            aria-label="Go to profile"
          >
            <img
              src={getAvatarUrl(user?.seed ?? null, user?.style ?? null)}
              alt={`${user?.username}'s avatar`}
              className={styles['sm-nav-avatar-img']}
              />
          </button>
          <span className={styles['sm-nav-username']}>{user?.username ?? ""}</span>
          <button className={`${styles['sm-nav-icon']} ${styles['sm-logout-btn']}`} onClick={handleLogout} title="Log Out"><LogOut size={20} /></button>
        </div>
      </nav>

      <main id="main-content">

      {/* Welcome */}
      <div className={styles['sm-welcome']}>
        <button
          className={styles['sm-welcome-avatar']}
          aria-label="Go to profile"
          onClick={() => router.push("/users/me")}>
            <img
              src={getAvatarUrl(user?.seed ?? null, user?.style ?? null)}
              alt={`${user?.username}'s avatar`}
              className={styles['sm-welcome-avatar-img']}
            />
        </button>
        <div>
          <div className={styles['sm-welcome-title']}>
            {user?.creationDate && Date.now() - new Date(user.creationDate).getTime() < 60_000
              ? `Welcome, ${user?.username}!`
              : `Welcome back, ${user?.username}!`}
          </div>
          <div className={styles['sm-welcome-sub']}>{user?.bio || "No bio yet"}</div>
        </div>
        <div className={styles['sm-join-area']}>
          <form className={styles['sm-join-form']} onSubmit={handleJoin}>
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }}
            />
            <button type="button" className="btn-ghost" onClick={() => importInputRef.current?.click()}>Import Map</button>
            <button type="button" className="btn-ghost" onClick={() => { setShowJoinInput(!showJoinInput); setInviteCode(""); }}>{showJoinInput ? "Cancel" : "+ Join Map"}</button>
            {showJoinInput && (
              <input
                className={styles['sm-join-input']}
                type="text"
                placeholder="Invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                autoFocus
              />
            )}
            {showJoinInput && <button type="submit" className="btn-gradient">Join</button>}
          </form>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles['sm-stats-row']}>
        <div className={styles['sm-stat-card']}>
          <span className={styles['sm-stat-label']}>SKILLS COMPLETED</span>
          <span className={`${styles['sm-stat-value']} ${styles.green}`}>
            {skillMaps.filter((m) => m.ownerId !== user?.id).reduce((s, m) => s + (mapStats[m.id]?.unlockedCount ?? 0), 0)}
            /{skillMaps.filter((m) => m.ownerId !== user?.id).reduce((s, m) => s + (mapStats[m.id]?.skillCount ?? 0), 0)}
          </span>
        </div>
        <div className={styles['sm-stat-card']}>
          <span className={styles['sm-stat-label']}>SKILLS REMAINING</span>
          <span className={`${styles['sm-stat-value']} ${styles.orange}`}>
            {skillMaps.filter((m) => m.ownerId !== user?.id).reduce((s, m) => s + ((mapStats[m.id]?.skillCount ?? 0) - (mapStats[m.id]?.unlockedCount ?? 0)), 0)}
          </span>
        </div>
        <div className={styles['sm-stat-card']}>
          <span className={styles['sm-stat-label']}>TOTAL MAPS</span>
          <span className={`${styles['sm-stat-value']} ${styles.orange}`}>{skillMaps.length}</span>
        </div>
      </div>

      {/* My Maps Section */}
      <div className={styles['sm-section-title']}>MY MAPS</div>

      <div className={styles['sm-grid']}>
        {skillMaps.filter((m) => m.ownerId === user?.id).map((map) => (
          <div key={map.id} className={`${styles['sm-card']} ${styles['sm-card--owner']}`} role="button" tabIndex={0} aria-label={`Open skill map: ${map.title}`} onClick={() => router.push(`/skillmaps/${map.id}`)} onKeyDown={(e) => e.key === "Enter" && router.push(`/skillmaps/${map.id}`)}>
            <div className={styles['sm-card-top']}>
              <div>
                <div className={styles['sm-card-title']}>{map.title}</div>
                <div className={styles['sm-card-subtitle']}>{map.description}</div>
              </div>
            </div>

            {map.inviteCode && (
              <div className={styles['sm-invite-row']}>
                <span className={styles['sm-invite-code']}>
                  Code: <strong>{map.inviteCode}</strong>
                </span>
                <button
                  className={styles['sm-edit-btn']}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(map.inviteCode!);
                    toast.success("Invite code copied!");
                  }}
                >
                  Copy
                </button>
              </div>
            )}

            <div className={styles['sm-card-meta']}>
              <span>📖 {mapStats[map.id]?.skillCount ?? "—"} Skills</span>
              <span>👤 {mapStats[map.id]?.memberCount ?? "—"} Students</span>
            </div>

            <div className={styles['sm-card-footer']}>
              <span className={styles['sm-continue']}>Continue Mapping &gt;</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className={styles['sm-edit-btn']}
                  title="Export skill map"
                  onClick={(e) => { e.stopPropagation(); setExportingMap(map); }}
                >
                  <Download size={13} />
                </button>
                <button
                  className={styles['sm-edit-btn']}
                  onClick={(e) => { e.stopPropagation(); router.push(`/skillmaps/${map.id}/edit`); }}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className={`${styles['sm-card']} ${styles['sm-card-new']}`} role="button" tabIndex={0} aria-label="Create new skill map" onClick={() => router.push("/skillmaps/new")} onKeyDown={(e) => e.key === "Enter" && router.push("/skillmaps/new")}>
          <span className={styles['sm-card-new-icon']}>+</span>
          <span className={styles['sm-card-new-label']}>Create New Map</span>
        </div>
      </div>

      {/* Joined Maps Section */}
      {skillMaps.some((m) => m.ownerId !== user?.id) && (
        <>
          <div className={styles['sm-section-title']}>JOINED MAPS</div>
          <div className={styles['sm-grid']}>
            {skillMaps.filter((m) => m.ownerId !== user?.id).map((map) => (
              <div key={map.id} className={styles['sm-card']} role="button" tabIndex={0} aria-label={`Open skill map: ${map.title}`} onClick={() => router.push(`/skillmaps/${map.id}`)} onKeyDown={(e) => e.key === "Enter" && router.push(`/skillmaps/${map.id}`)}>
                <div className={styles['sm-card-top']}>
                  <div>
                    <div className={styles['sm-card-title']}>{map.title}</div>
                    <div className={styles['sm-card-subtitle']}>{map.description}</div>
                  </div>
                </div>

                <div className={styles['sm-card-meta']}>
                  <span>📖 {mapStats[map.id]?.skillCount ?? "—"} Skills</span>
                  <span>👤 {mapStats[map.id]?.memberCount ?? "—"} Students</span>
                </div>

                <div className={styles['sm-progress-bar']}>
                  <div
                    className={styles['sm-progress-fill']}
                    style={{ width: mapStats[map.id]?.skillCount
                      ? `${Math.round((mapStats[map.id].unlockedCount / mapStats[map.id].skillCount) * 100)}%`
                      : "0%" }}
                  />
                </div>
                <div className={styles['sm-progress-label']}>
                  {mapStats[map.id]?.unlockedCount ?? 0}/{mapStats[map.id]?.skillCount ?? "—"} skills completed
                </div>

                <div className={styles['sm-card-footer']}>
                  <span className={styles['sm-continue']}>Continue Mapping &gt;</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      </main>

      <ExportModal
        open={exportingMap !== null}
        mapTitle={exportingMap?.title ?? ""}
        onExport={() => handleExport(exportingMap!.id, exportingMap!.title)}
        onClose={() => setExportingMap(null)}
      />
    </div>
  );
};

export default SkillMapsPage;
