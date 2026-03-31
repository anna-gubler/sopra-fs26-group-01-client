"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { SkillMap } from "@/types/skillmap";
import { User } from "@/types/user";
import { Inbox, Bell, Settings, BookOpen } from "lucide-react";

const SkillMapsPage: React.FC = () => {
  const router = useRouter();
  const api = useApi();
  const [skillMaps, setSkillMaps] = useState<SkillMap[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");

/*   useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, []); */

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    try {
      await api.post("/skillmaps/join", { inviteCode });
      setInviteCode("");
      setShowJoinInput(false);
      const maps = await api.getSkillMaps();
      setSkillMaps(maps);
    } catch (err) {
      if (err instanceof Error) setJoinError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [maps, me] = await Promise.all([
          api.getSkillMaps(),
          api.get<User>("/users/me"),
        ]);
        setSkillMaps(maps);
        setUser(me);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Failed to load skill maps:\n${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  if (loading) {
    return <div className="sm-loading">Loading...</div>;
  }

  return (
    <div className="sm-page">

      {/* Navbar */}
      <nav className="sm-nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <BookOpen size={16} color="white" />
          </div>
          <span className="sm-nav-logo">Mappd</span>
        </div>
        <div className="sm-nav-right">
          <button className="sm-nav-icon"><Inbox size={20} /></button>
          <button className="sm-nav-icon"><Bell size={20} /></button>
          <button className="sm-nav-icon"><Settings size={20} /></button>
          <div className="sm-nav-avatar" onClick={() => router.push("/users/me")}>
            <span>{user?.username?.[0]?.toUpperCase() ?? "?"}</span>
          </div>
          <span className="sm-nav-username">{user?.username ?? ""}</span>
        </div>
      </nav>

      {/* Welcome */}
      <div className="sm-welcome">
        <div className="sm-welcome-avatar">{user?.username?.[0]?.toUpperCase() ?? "?"}</div>
        <div>
          <div className="sm-welcome-title">Welcome back, {user?.username}!</div>
          <div className="sm-welcome-sub">{user?.bio || "No bio yet"}</div>
        </div>
        <div className="sm-join-area">
          <form className="sm-join-form" onSubmit={handleJoin}>
            <button type="button" className="btn-ghost" onClick={() => { setShowJoinInput(!showJoinInput); setInviteCode(""); setJoinError(""); }}>{showJoinInput ? "Cancel" : "+ Join Map"}</button>
            {showJoinInput && (
              <input
                className="sm-join-input"
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
          {joinError && <div className="alert-error alert-error-mt">{joinError}</div>}
        </div>
      </div>

      {/* Stats Row */}
      <div className="sm-stats-row">
        <div className="sm-stat-card">
          <span className="sm-stat-label">SKILLS COMPLETED</span>
          <span className="sm-stat-value green">XX/XX</span>
        </div>
        <div className="sm-stat-card">
          <span className="sm-stat-label">SKILLS IN PROGRESS</span>
          <span className="sm-stat-value orange">XX/XX</span>
        </div>
        <div className="sm-stat-card">
          <span className="sm-stat-label">MAPS JOINED</span>
          <span className="sm-stat-value orange">{skillMaps.length}</span>
        </div>
      </div>

      {/* Maps Section */}
      <div className="sm-section-title">MY MAPS</div>

      <div className="sm-grid">
        {skillMaps.map((map) => (
          <div key={map.id} className="sm-card" onClick={() => router.push(`/skillmaps/${map.id}`)}>
            <div className="sm-card-top">
              <div>
                <div className="sm-card-title">{map.title}</div>
                <div className="sm-card-subtitle">{map.description}</div>
              </div>
            </div>

            <div className="sm-card-meta">
              <span>📖 XX Skills</span>
              <span>👤 XX Students</span>
            </div>

            <div className="sm-progress-bar">
              <div className="sm-progress-fill" />
            </div>
            <div className="sm-progress-label">0/XX skills completed</div>

            <div className="sm-card-footer">
              <span className="sm-continue">Continue Learning &gt;</span>
              <button
                className="sm-edit-btn"
                onClick={(e) => { e.stopPropagation(); router.push(`/skillmaps/${map.id}/edit`); }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}

        {/* Create new map placeholder card */}
        <div className="sm-card sm-card-new" onClick={() => router.push("/skillmaps/new")}>
          <span className="sm-card-new-icon">+</span>
          <span className="sm-card-new-label">Create New Map</span>
        </div>
      </div>
    </div>
  );
};

export default SkillMapsPage;
