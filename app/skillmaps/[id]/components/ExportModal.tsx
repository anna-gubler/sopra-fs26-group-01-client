"use client";

import React, { useState } from "react";
import { FileJson, Italic } from "lucide-react";
import styles from "@/styles/skillmaps.module.css";

type ExportModalProps = {
  open: boolean;
  mapTitle: string;
  onExport: () => Promise<void>;
  onClose: () => void;
};

const ExportModal: React.FC<ExportModalProps> = ({ open, mapTitle, onExport, onClose }) => {
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setExporting(true);
    try {
      await onExport();
      onClose();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={styles["modal-backdrop"]} onClick={onClose}>
      <div className={styles["modal"]} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles["export-modal-title"]}>Export Skill Map</h2>
        {/*<p className={styles["export-modal-subtitle"]}>Export skill map: {mapTitle}</p>*/}

        <div className={styles["export-format-grid"]}>
          <div className={`${styles["export-format-card"]} ${styles["export-format-card--selected"]}`}>
            <FileJson size={28} />
            <span>JSON</span>
          </div>
        </div>

        <div className={styles["export-actions"]}>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <button type="button" className="btn-gradient" onClick={handleConfirm} disabled={exporting}>
            {exporting ? "Exporting…" : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
