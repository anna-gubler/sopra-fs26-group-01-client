"use client";

import React, { useState, useEffect } from "react";
import { ApiService } from "@/api/apiService";
import { createSkill, updateSkill, deleteSkill } from "@/api/skillApi";
import { Skill } from "@/types/skill";
import styles from "@/styles/skillmaps.module.css";
import toast from "react-hot-toast";

const DeleteConfirmButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button type="button" className={styles["btn-delete"]} onClick={() => setConfirming(true)}>
        Delete Skill
      </button>
    );
  }
  return (
    <div className={styles["btn-delete-row"]}>
      <button type="button" className={`btn-ghost ${styles["btn-delete-cancel"]}`} onClick={() => setConfirming(false)}>
        Cancel
      </button>
      <button type="button" className={styles["btn-delete"]} onClick={onDelete}>
        Confirm Delete
      </button>
    </div>
  );
};

type SkillModalProps = {
  api: ApiService;
  open: boolean;
  skill: Skill | null;
  skills: Skill[];
  numberOfLevels: number;
  skillMapId: number;
  onClose: () => void;
  onSaved: () => void;
};

const SkillModal: React.FC<SkillModalProps> = ({
  api,
  open,
  skill,
  skills,
  numberOfLevels,
  skillMapId,
  onClose,
  onSaved,
}) => {
  const [skillForm, setSkillForm] = useState({ name: "", description: "", level: 1, difficulty: "", resources: "" });

  useEffect(() => {
    if (skill) {
      setSkillForm({
        name: skill.name,
        description: skill.description ?? "",
        level: skill.level,
        difficulty: skill.difficulty ?? "",
        resources: skill.resources ?? "",
      });
    } else {
      setSkillForm({ name: "", description: "", level: 1, difficulty: "", resources: "" });
    }
  }, [skill, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, level, difficulty, resources } = skillForm;
    try {
      if (skill) {
        await updateSkill(api, skill.id, { name, description, difficulty, resources });
      } else {
        const positionX = 100 + skills.filter((s) => s.level === level).length * 200;
        await createSkill(api, skillMapId, { name, description, level, difficulty, resources, positionX });
      }
      onSaved();
    } catch {
      toast.error("Failed to save skill. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!skill) return;
    try {
      await deleteSkill(api, skill.id);
      onSaved();
    } catch {
      toast.error("Failed to delete skill. Please try again.");
    }
  };

  return (
    <div className={styles["modal-backdrop"]} role="button" tabIndex={0} aria-label="Close modal" onClick={onClose} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className={styles["modal"]} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <h2 className="form-heading">{skill ? "Edit Skill" : "Add Skill"}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="skill-name">Name</label>
            <input
              id="skill-name"
              className="auth-input"
              type="text"
              value={skillForm.name}
              onChange={(e) => setSkillForm((f) => ({ ...f, name: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div className="input-group">
            <label htmlFor="skill-description">Description</label>
            <textarea
              id="skill-description"
              className="auth-input"
              rows={3}
              value={skillForm.description}
              onChange={(e) => setSkillForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          {!skill && (
            <div className="input-group">
              <label htmlFor="skill-level">Level</label>
              <select
                id="skill-level"
                className="auth-input"
                value={skillForm.level}
                onChange={(e) => setSkillForm((f) => ({ ...f, level: Number(e.target.value) }))}
              >
                {Array.from({ length: numberOfLevels }, (_, i) => i + 1).map((l) => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
              </select>
            </div>
          )}
          <div className="input-group">
            <label htmlFor="skill-difficulty">Difficulty</label>
            <select
              id="skill-difficulty"
              className="auth-input"
              value={skillForm.difficulty}
              onChange={(e) => setSkillForm((f) => ({ ...f, difficulty: e.target.value }))}
            >
              <option value="">—</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="skill-resources">Resources</label>
            <textarea
              id="skill-resources"
              className="auth-input"
              rows={2}
              value={skillForm.resources}
              onChange={(e) => setSkillForm((f) => ({ ...f, resources: e.target.value }))}
              placeholder="Links, notes, references..."
            />
          </div>
          <button type="submit" className="btn-gradient btn-full">
            {skill ? "Save" : "Create"}
          </button>
          <button type="button" className="btn-ghost btn-full" onClick={onClose}>
            Cancel
          </button>
          {skill && <DeleteConfirmButton onDelete={handleConfirmDelete} />}
        </form>
      </div>
    </div>
  );
};

export default SkillModal;
