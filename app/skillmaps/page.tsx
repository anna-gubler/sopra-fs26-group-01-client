"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { getSkillMaps, joinSkillMap, getSkillMapMembers } from "@/api/skillmapApi";
import { getMe } from "@/api/userApi";
import { SkillMap } from "@/types/skillmap";
import { User } from "@/types/user";
import { BookOpen, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import styles from "@/styles/skillmaps.module.css";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ApplicationError } from "@/types/error";

const SkillMapsPage: React.FC = () => {
  const router = useRouter();
  const api = useApi();
  const [skillMaps, setSkillMaps] = useState<SkillMap[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearId } = useLocalStorage<string>("id", "");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [ownedMapIds, setOwnedMapIds] = useState<Set<number>>(new Set());

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
      router.push(`/skillmaps/${joined.id}`);
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
        const membershipsPerMap = await Promise.all(maps.map((m) => getSkillMapMembers(api, m.id)));
        const owned = new Set<number>();
        maps.forEach((map, i) => {
          if (membershipsPerMap[i].some((mem) => mem.userId === me.id && mem.role === "OWNER")) {
            owned.add(map.id);
          }
        });
        setOwnedMapIds(owned);
        setSkillMaps(maps);
        setUser(me);
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

      {/* Navbar */}
      <nav className={styles['sm-nav']}>
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <BookOpen size={16} color="white" />
          </div>
          <span className={styles['sm-nav-logo']}>Mappd</span>
        </div>
        <div className={styles['sm-nav-right']}>
          <div className={styles['sm-nav-avatar']} role="button" tabIndex={0} onClick={() => router.push("/users/me")} onKeyDown={(e) => e.key === "Enter" && router.push("/users/me")}>
            <span>{user?.username?.[0]?.toUpperCase() ?? "?"}</span>
          </div>
          <span className={styles['sm-nav-username']}>{user?.username ?? ""}</span>
          <button className={`${styles['sm-nav-icon']} ${styles['sm-logout-btn']}`} onClick={handleLogout} title="Log Out"><LogOut size={20} /></button>
        </div>
      </nav>

      {/* Welcome */}
      <div className={styles['sm-welcome']}>
        <div className={styles['sm-welcome-avatar']}>{user?.username?.[0]?.toUpperCase() ?? "?"}</div>
        <div>
          <div className={styles['sm-welcome-title']}>Welcome back, {user?.username}!</div>
          <div className={styles['sm-welcome-sub']}>{user?.bio || "No bio yet"}</div>
        </div>
        <div className={styles['sm-join-area']}>
          <form className={styles['sm-join-form']} onSubmit={handleJoin}>
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
          <span className={`${styles['sm-stat-value']} ${styles.green}`}>XX/XX</span>
        </div>
        <div className={styles['sm-stat-card']}>
          <span className={styles['sm-stat-label']}>SKILLS IN PROGRESS</span>
          <span className={`${styles['sm-stat-value']} ${styles.orange}`}>XX/XX</span>
        </div>
        <div className={styles['sm-stat-card']}>
          <span className={styles['sm-stat-label']}>MAPS JOINED</span>
          <span className={`${styles['sm-stat-value']} ${styles.orange}`}>{skillMaps.length}</span>
        </div>
      </div>

      {/* My Maps Section */}
      <div className={styles['sm-section-title']}>MY MAPS</div>

      <div className={styles['sm-grid']}>
        {skillMaps.filter((m) => ownedMapIds.has(m.id)).map((map) => (
          <div key={map.id} className={styles['sm-card']} role="button" tabIndex={0} onClick={() => router.push(`/skillmaps/${map.id}`)} onKeyDown={(e) => e.key === "Enter" && router.push(`/skillmaps/${map.id}`)}>
            <div className={styles['sm-card-top']}>
              <div>
                <div className={styles['sm-card-title']}>{map.title}</div>
                <div className={styles['sm-card-subtitle']}>{map.description}</div>
              </div>
            </div>

            <div className={styles['sm-card-meta']}>
              <span>📖 XX Skills</span>
              <span>👤 XX Students</span>
            </div>

            <div className={styles['sm-progress-bar']}>
              <div className={styles['sm-progress-fill']} />
            </div>
            <div className={styles['sm-progress-label']}>0/XX skills completed</div>

            <div className={styles['sm-card-footer']}>
              <span className={styles['sm-continue']}>Continue Learning &gt;</span>
              <button
                className={styles['sm-edit-btn']}
                onClick={(e) => { e.stopPropagation(); router.push(`/skillmaps/${map.id}/edit`); }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}

        <div className={`${styles['sm-card']} ${styles['sm-card-new']}`} role="button" tabIndex={0} onClick={() => router.push("/skillmaps/new")} onKeyDown={(e) => e.key === "Enter" && router.push("/skillmaps/new")}>
          <span className={styles['sm-card-new-icon']}>+</span>
          <span className={styles['sm-card-new-label']}>Create New Map</span>
        </div>
      </div>

      {/* Joined Maps Section */}
      {skillMaps.some((m) => !ownedMapIds.has(m.id)) && (
        <>
          <div className={styles['sm-section-title']}>JOINED MAPS</div>
          <div className={styles['sm-grid']}>
            {skillMaps.filter((m) => !ownedMapIds.has(m.id)).map((map) => (
              <div key={map.id} className={styles['sm-card']} role="button" tabIndex={0} onClick={() => router.push(`/skillmaps/${map.id}`)} onKeyDown={(e) => e.key === "Enter" && router.push(`/skillmaps/${map.id}`)}>
                <div className={styles['sm-card-top']}>
                  <div>
                    <div className={styles['sm-card-title']}>{map.title}</div>
                    <div className={styles['sm-card-subtitle']}>{map.description}</div>
                  </div>
                </div>

                <div className={styles['sm-card-meta']}>
                  <span>📖 XX Skills</span>
                  <span>👤 XX Students</span>
                </div>

                <div className={styles['sm-progress-bar']}>
                  <div className={styles['sm-progress-fill']} />
                </div>
                <div className={styles['sm-progress-label']}>0/XX skills completed</div>

                <div className={styles['sm-card-footer']}>
                  <span className={styles['sm-continue']}>Continue Learning &gt;</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SkillMapsPage;
