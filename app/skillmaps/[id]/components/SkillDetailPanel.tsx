"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Skill } from "@/types/skill";
import { ApiService } from "@/api/apiService";
import { updateProgress } from "@/api/skillApi";
import { submitSkillRating } from "@/api/sessionApi";
import UnderstandingSlider from "./UnderstandingSlider";
import styles from "@/styles/skillmaps.module.css";

type SkillDetailPanelProps = {
  skill: Skill;
  dependencies: Skill[];
  onClose: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
  api: ApiService;
  sessionId: number | null;
};

const URL_REGEX = /https?:\/\/[^\s]+/g;

function renderWithLinks(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_REGEX)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a key={match.index} href={match[0]} target="_blank" rel="noopener noreferrer" className={styles["detail-panel-link"]}>
        {match[0]}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const dotColor: Record<string, string> = {
  easy:   "hsl(160, 60%, 52%)",
  medium: "hsl(263, 70%, 58%)",
  hard:   "hsl(330, 70%, 56%)",
};

const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({ skill, dependencies, onClose, isOwner, onEdit, api, sessionId }) => {
  const color = dotColor[skill.difficulty] ?? "hsl(258, 24%, 40%)";
  const [notes, setNotes] = useState("");
  const [understanding, setUnderstanding] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUnderstanding(0);
  }, [skill.id]);

  const handleUnderstandingChange = useCallback(
    (val: number) => {
      setUnderstanding(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          if (sessionId !== null) {
            await submitSkillRating(api, sessionId, skill.id, val);
          } else {
            await updateProgress(api, skill.id, val > 0);
          }
        } catch {
          // ratings are best-effort; silently ignore failures
        }
      }, 600);
    },
    [api, sessionId, skill.id],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={styles["detail-panel"]}>
      <button className={styles["detail-panel-close"]} onClick={onClose} aria-label="Close panel">
        <X size={18} />
      </button>

      <div className={styles["detail-panel-header"]}>
        <span className={styles["detail-panel-dot"]} style={{ "--dot-color": color } as React.CSSProperties} />
        <h2 className={styles["detail-panel-title"]}>{skill.name.toUpperCase()}</h2>
      </div>

      <p className={skill.description ? styles["detail-panel-description"] : styles["detail-panel-placeholder"]}>
        {skill.description || "No description provided."}
      </p>


      <section className={styles["detail-panel-section"]}>
        <h3 className={styles["detail-panel-label"]}>Resources</h3>
        {skill.resources ? (
          <p className={styles["detail-panel-text"]}>{renderWithLinks(skill.resources)}</p>
        ) : (
          <p className={styles["detail-panel-placeholder"]}>No resources provided.</p>
        )}
      </section>

      <section className={styles["detail-panel-section"]}>
        <h3 className={styles["detail-panel-label"]}>Prerequisites</h3>
        {dependencies.length > 0 ? (
          <div className={styles["detail-panel-pills"]}>
            {dependencies.map((dep) => (
              <span
                key={dep.id}
                className={styles["detail-panel-pill"]}
                style={{ "--pill-color": dotColor[dep.difficulty] ?? "hsl(258, 24%, 40%)" } as React.CSSProperties}
              >
                {dep.name}
              </span>
            ))}
          </div>
        ) : (
          <p className={styles["detail-panel-placeholder"]}>No prerequisites.</p>
        )}
      </section>

      {!isOwner && (
        <section className={styles["detail-panel-section"]}>
          <h3 className={styles["detail-panel-label"]}>Understanding</h3>
          <UnderstandingSlider value={understanding} onChange={handleUnderstandingChange} />
        </section>
      )}

      <section className={styles["detail-panel-section"]}>
        <h3 className={styles["detail-panel-label"]}>Notes</h3>
        <textarea
          className={styles["detail-panel-notes"]}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add your personal notes here..."
        />
      </section>

      {isOwner && onEdit && sessionId === null && (
        <button className={`btn-ghost ${styles["detail-panel-edit-btn"]}`} onClick={onEdit}>
          Edit Skill
        </button>
      )}
    </div>
  );
};

export default SkillDetailPanel;
