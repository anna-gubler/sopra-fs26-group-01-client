"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { SkillMap } from "@/types/skillmap";

const SkillMapsPage: React.FC = () => {
  const router = useRouter();
  const api = useApi();
  const [skillMaps, setSkillMaps] = useState<SkillMap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillMaps = async () => {
      try {
        const maps = await api.getSkillMaps();
        setSkillMaps(maps);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Failed to load skill maps:\n${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSkillMaps();
  }, [api]);

  if (loading) {
    return <div className="sm-loading">Loading...</div>;
  }

  return (
    <div className="sm-page">

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
              <div className="sm-progress-fill" style={{ width: "0%" }} />
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
