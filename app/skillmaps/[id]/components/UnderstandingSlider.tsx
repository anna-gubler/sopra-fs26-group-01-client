"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { ratingColor } from "./UnderstandingHeatmap";
import styles from "@/styles/skillmaps.module.css";

const SEGMENT_COUNT = 10;

interface UnderstandingSliderProps {
  value: number; // 0, 10, 20, ..., 100
  onChange: (value: number) => void;
}

const UnderstandingSlider: React.FC<UnderstandingSliderProps> = ({ value, onChange }) => {
  const isDragging = useRef(false);
  const filled = value / 10;

  const handleSegmentDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const next = (index + 1) * 10;
      onChange(value === next ? 0 : next);
    },
    [value, onChange],
  );

  const handleSegmentEnter = useCallback(
    (index: number) => {
      if (!isDragging.current) return;
      onChange((index + 1) * 10);
    },
    [onChange],
  );

  useEffect(() => {
    const stop = () => { isDragging.current = false; };
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  return (
    <div className={styles["understanding-row"]}>
      <div className={styles["understanding-track"]}>
        {Array.from({ length: SEGMENT_COUNT }, (_, i) => {
          const isFilled = i < filled;
          const color = ratingColor((i + 1) * 10);
          return (
            <div
              key={i}
              className={styles["understanding-segment"]}
              style={isFilled ? { background: color, borderColor: color } : undefined}
              onMouseDown={(e) => handleSegmentDown(i, e)}
              onMouseEnter={() => handleSegmentEnter(i)}
            />
          );
        })}
      </div>
      <span className={styles["understanding-value"]}>{value}%</span>
    </div>
  );
};

export default UnderstandingSlider;
