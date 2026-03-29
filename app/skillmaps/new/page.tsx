"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { ApplicationError } from "@/types/error";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const NewSkillMapPage: React.FC = () => {
  const router = useRouter();
  const api = useApi();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfLevels, setNumberOfLevels] = useState(1);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.createSkillMap({ title, description, numberOfLevels, isPublic });
      router.push("/skillmaps");
    } catch (err) {
      const status = (err as ApplicationError).status;
      if (status === 403) {
        setError("You don't have permission to do that.");
      } else {
        setError("Failed to create skill map. Please try again.");
      }
    }
  };

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100vh", color: "var(--text-bright)" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(hsla(263,70%,58%,0.07) 1px, transparent 1px), linear-gradient(to right, hsla(263,70%,58%,0.07) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 }} />
      <nav className="glass-nav">
        <Link href="/skillmaps" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--text-bright)" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, var(--primary), var(--secondary))", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "var(--font-space-grotesk)" }}>Mappd</span>
        </Link>
      </nav>
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: 20, padding: "40px 48px", width: "100%", maxWidth: 520 }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Create Skill Map</h2>
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
            <div className="input-group" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <label htmlFor="isPublic">Public</label>
            </div>
            {error && <div className="alert-error">{error}</div>}
            <button type="submit" className="btn-gradient" style={{ width: "100%", justifyContent: "center" }}>Create</button>
            <button type="button" className="btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => router.push("/skillmaps")}>Cancel</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default NewSkillMapPage;
