"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { ApplicationError } from "@/types/error";
import { SkillMap } from "@/types/skillmap";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const EditSkillMapPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const api = useApi();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfLevels, setNumberOfLevels] = useState(1);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   if (!localStorage.getItem("token")) {
  //     router.push("/login");
  //   }
  // }, []);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const map = await api.get<SkillMap>(`/skillmaps/${id}`);
        setTitle(map.title);
        setDescription(map.description);
        setNumberOfLevels(map.numberOfLevels);
        setIsPublic(map.isPublic);
      } catch (err) {
        const status = (err as ApplicationError).status;
        if (status === 403) {
          setError("You don't have permission to do that.");
        } else {
          setError("Failed to load skill map. Please try again.");
        }
      }
    };
    fetchMap();
  }, [api, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.updateSkillMap(id, { title, description, numberOfLevels, isPublic });
      router.push("/skillmaps");
    } catch (err) {
      const status = (err as ApplicationError).status;
      if (status === 403) {
        setError("You don't have permission to do that.");
      } else {
        setError("Failed to save skill map. Please try again.");
      }
    }
  };

  // Todo: ADD TOGGLE FOR PUBLIC
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
          <h2 className="form-heading">Edit Skill Map</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Title</label>
              <input className="auth-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea className="auth-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="input-group">
              <label>Number of Levels</label>
              <input className="auth-input" type="number" min={1} value={numberOfLevels} onChange={(e) => setNumberOfLevels(Number(e.target.value))} required />
            </div>
            <div className="input-group input-group--row">
              <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <label htmlFor="isPublic">Public</label>
            </div>
            {error && <div className="alert-error">{error}</div>}
            <button type="submit" className="btn-gradient btn-full">Save</button>
            <button type="button" className="btn-ghost btn-full" onClick={() => router.push("/skillmaps")}>Cancel</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditSkillMapPage;
