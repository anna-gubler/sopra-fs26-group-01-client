"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAutoResize } from "@/hooks/useAutoResize";
import { getSkillMap, updateSkillMap, deleteSkillMap, getSkillMapGraph } from "@/api/skillmapApi";
import { getSkills, deleteSkill, deleteDependency } from "@/api/skillApi";
import { getMe } from "@/api/userApi";
import { ApplicationError } from "@/types/error";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const EditSkillMapPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const api = useApi();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfLevels, setNumberOfLevels] = useState("1");
  const [isPublic, setIsPublic] = useState(true);
  const [originalNumberOfLevels, setOriginalNumberOfLevels] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const descriptionResize = useAutoResize(description);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const [map, me] = await Promise.all([getSkillMap(api, id), getMe(api)]);
        if (map.ownerId !== me.id) {
          router.replace(`/skillmaps/${id}`);
          return;
        }
        setTitle(map.title);
        setDescription(map.description);
        setNumberOfLevels(String(map.numberOfLevels));
        setOriginalNumberOfLevels(map.numberOfLevels);
        setIsPublic(map.isPublic);
      } catch (err) {
        const status = (err as ApplicationError).status;
        if (status === 403) {
          router.replace(`/skillmaps/${id}`);
        } else {
          toast.error("Failed to load skill map. Please try again.");
        }
      }
    };
    fetchMap();
  }, [api, id]);

  const handleDelete = async () => {
    try {
      const graph = await getSkillMapGraph(api, id);
      await Promise.all(graph.dependencies.map((d) => deleteDependency(api, d.id)));
      await Promise.all(graph.skills.map((s) => deleteSkill(api, s.id)));
      await deleteSkillMap(api, id);
      router.push("/skillmaps");
    } catch (err) {
      const status = (err as ApplicationError).status;
      if (status === 403) {
        toast.error("You don't have permission to do that.");
      } else {
        toast.error("Failed to delete skill map. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(numberOfLevels) < originalNumberOfLevels) {
      try {
        const skills = await getSkills(api, id);
        const hasSkillsInRemovedLevels = skills.some((s) => s.level > Number(numberOfLevels));
        if (hasSkillsInRemovedLevels) {
          toast.error("Remove all skills in the levels you want to delete first.");
          return;
        }
      } catch {
        toast.error("Failed to validate levels. Please try again.");
        return;
      }
    }
    try {
      await updateSkillMap(api, id, { title, description, numberOfLevels: Number(numberOfLevels), isPublic });
      router.push(`/skillmaps/${id}`);
    } catch (err) {
      const status = (err as ApplicationError).status;
      if (status === 403) {
        toast.error("You don't have permission to do that.");
      } else {
        toast.error("Failed to save skill map. Please try again.");
      }
    }
  };

  return (
    <div className="page-deep">
      <div className="grid-overlay" />
      <nav className="glass-nav">
        <Link href="/skillmaps" className="nav-logo">
          <div className="nav-logo-icon">
            <BookOpen size={16} color="white" />
          </div>
          <span className="logo-text">Mappd</span>
        </Link>
      </nav>
      <div className="page-content-center">
        <motion.div
          className="page-card page-card--sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button type="button" className="btn-back" onClick={() => router.push(`/skillmaps/${id}`)}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="form-heading">Edit Skill Map</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="map-title">Title</label>
              <input id="map-title" className="auth-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="map-description">Description</label>
              <textarea id="map-description" className="auth-input" ref={descriptionResize.ref} onInput={descriptionResize.onInput} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="input-group">
              <label htmlFor="map-levels">Number of Levels</label>
              <input id="map-levels" className="auth-input" type="number" min={1} value={numberOfLevels} onChange={(e) => setNumberOfLevels(e.target.value)} required />
            </div>
            <div className="input-group input-group--row">
              <label htmlFor="isPublic">Public</label>
              <button
                type="button"
                id="isPublic"
                role="switch"
                aria-checked={isPublic}
                onClick={() => setIsPublic(!isPublic)}
                style={{
                  position: "relative",
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: isPublic ? "linear-gradient(135deg, var(--primary, #e91e8c), var(--secondary, #9333ea))" : "rgba(255,255,255,0.15)",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: "absolute",
                  top: 3,
                  left: isPublic ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  transition: "left 0.2s",
                }} />
              </button>
            </div>
            <button type="submit" className="btn-gradient btn-full">Save</button>
            <button type="button" className="btn-ghost btn-full" onClick={() => router.push(`/skillmaps/${id}`)}>Cancel</button>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", marginTop: "0.5rem" }}>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  className="btn-ghost btn-ghost--danger btn-full"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Skill Map
                </button>
              ) : (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn-ghost btn-full"
                    style={{ justifyContent: "center" }}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--danger btn-full"
                    onClick={handleDelete}
                  >
                    Confirm Delete
                  </button>
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditSkillMapPage;
