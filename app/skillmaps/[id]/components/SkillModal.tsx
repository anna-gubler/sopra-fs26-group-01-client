"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { createSkill, updateSkill, deleteSkill } from "@/api/skillApi";
import { Skill } from "@/types/skill";
import styles from "@/styles/skillmaps.module.css";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  skill: Skill | null;
  skills: Skill[];
  numberOfLevels: number;
  skillMapId: number;
  onClose: () => void;
  onSaved: () => void;
};

const SkillModal: React.FC<Props> = ({
  open,
  skill,
  skills,
  numberOfLevels,
  skillMapId,
  onClose,
  onSaved,
}) => {
  const api = useApi();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState(1);
  const [difficulty, setDifficulty] = useState("");
  const [resources, setResources] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (skill) {
      setName(skill.name);
      setDescription(skill.description ?? "");
      setLevel(skill.level);
      setDifficulty(skill.difficulty ?? "");
      setResources(skill.resources ?? "");
    } else {
      setName("");
      setDescription("");
      setLevel(1);
      setDifficulty("");
      setResources("");
    }
    setConfirmingDelete(false);
  }, [skill, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleDelete = async () => {
    if (!skill) return;
    try {
      await deleteSkill(api, skill.id);
      onSaved();
    } catch {
      toast.error("Failed to delete skill. Please try again.");
    }
  };

  return (
    <div className={styles["modal-backdrop"]} role="button" tabIndex={0} onClick={onClose} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className={styles["modal"]} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <h2 className="form-heading">{skill ? "Edit Skill" : "Add Skill"}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="skill-name">Name</label>
            <input
              id="skill-name"
              className="auth-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {!skill && (
            <div className="input-group">
              <label htmlFor="skill-level">Level</label>
              <select
                id="skill-level"
                className="auth-input"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
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
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
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
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              placeholder="Links, notes, references..."
            />
          </div>
          <button type="submit" className="btn-gradient btn-full">
            {skill ? "Save" : "Create"}
          </button>
          <button type="button" className="btn-ghost btn-full" onClick={onClose}>
            Cancel
          </button>
          {skill && !confirmingDelete && (
            <button type="button" className={styles["btn-delete"]} onClick={() => setConfirmingDelete(true)}>
              Delete Skill
            </button>
          )}
          {skill && confirmingDelete && (
            <div className={styles["btn-delete-row"]}>
              <button type="button" className={`btn-ghost ${styles["btn-delete-cancel"]}`} onClick={() => setConfirmingDelete(false)}>
                Cancel
              </button>
              <button type="button" className={styles["btn-delete"]} onClick={handleDelete}>
                Confirm Delete
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SkillModal;
