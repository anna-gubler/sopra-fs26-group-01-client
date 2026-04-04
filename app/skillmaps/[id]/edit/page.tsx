"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { getSkillMap, updateSkillMap } from "@/api/skillmapApi";
import { ApplicationError } from "@/types/error";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import toast from "react-hot-toast";

const EditSkillMapPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const api = useApi();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfLevels, setNumberOfLevels] = useState(1);
  const [isPublic, setIsPublic] = useState(true);

  // useEffect(() => {
  //   if (!localStorage.getItem("token")) {
  //     router.push("/login");
  //   }
  // }, []);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const map = await getSkillMap(api, id);
        setTitle(map.title);
        setDescription(map.description);
        setNumberOfLevels(map.numberOfLevels);
        setIsPublic(map.isPublic);
      } catch (err) {
        const status = (err as ApplicationError).status;
        if (status === 403) {
          toast.error("You don't have permission to do that.");
        } else {
          toast.error("Failed to load skill map. Please try again.");
        }
      }
    };
    fetchMap();
  }, [api, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSkillMap(api, id, { title, description, numberOfLevels, isPublic });
      router.push("/skillmaps");
    } catch (err) {
      const status = (err as ApplicationError).status;
      if (status === 403) {
        toast.error("You don't have permission to do that.");
      } else {
        toast.error("Failed to save skill map. Please try again.");
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
            <button type="submit" className="btn-gradient btn-full">Save</button>
            <button type="button" className="btn-ghost btn-full" onClick={() => router.push("/skillmaps")}>Cancel</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditSkillMapPage;
