"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAutoResize } from "@/hooks/useAutoResize";
import { createSkillMap } from "@/api/skillmapApi";
import { ApplicationError } from "@/types/error";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

const NewSkillMapPage: React.FC = () => {
  const router = useRouter();
  const api = useApi();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfLevels, setNumberOfLevels] = useState("1");
  const descriptionResize = useAutoResize(description);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const map = await createSkillMap(api, { title, description, numberOfLevels: Number(numberOfLevels), isPublic: false });
      router.push(`/skillmaps/${map.id}`);
    } catch (err) {
      const status = (err as ApplicationError).status;
      if (status === 403) {
        toast.error("You don't have permission to do that.");
      } else {
        toast.error("Failed to create skill map. Please try again.");
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
          <button type="button" className="btn-back" onClick={() => router.push("/skillmaps")}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="form-heading">Create Skill Map</h2>
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
<button type="submit" className="btn-gradient btn-full">Create</button>
            <button type="button" className="btn-ghost btn-full" onClick={() => router.push("/skillmaps")}>Cancel</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default NewSkillMapPage;
