"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import styles from "@/styles/tour.module.css";

export interface TourSection {
  heading: string;
  body: string;
}

export interface TourStep {
  title: string;
  content?: string;
  sections?: TourSection[];
  target?: string;
  padding?: number;
  wide?: boolean;
}

interface TourOverlayProps {
  steps: TourStep[];
  onFinish: () => void;
  onSkip: () => void;
}

const TOOLTIP_W = 320;
const TOOLTIP_W_WIDE = 480;
// Estimated tooltip height used for viewport collision detection
const TOOLTIP_H = 260;
const GAP = 14;

interface SpotlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface OverlayLayout {
  spotlight: SpotlightRect | null;
  tooltip: { left: number; top: number };
}

// Computes the padded spotlight bounds around the target element, and the best
// tooltip position. Preference order: below → above → right → left the spotlight.
function computeOverlayLayout(rect: DOMRect | null, padding: number, w: number): OverlayLayout {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!rect) {
    return {
      spotlight: null,
      tooltip: { left: Math.max(8, (vw - w) / 2), top: Math.max(8, (vh - TOOLTIP_H) / 2) },
    };
  }

  // Padded bounding box that will be cut out of the overlay to reveal the target
  const spotlight: SpotlightRect = {
    left: rect.left - padding,
    top: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  // Clamp helpers keep the tooltip fully inside the viewport with an 8px margin
  const clampL = (x: number) => Math.min(Math.max(x, 8), vw - w - 8);
  const clampT = (y: number) => Math.min(Math.max(y, 8), vh - TOOLTIP_H - 8);

  const belowEdge = rect.bottom + padding;
  const aboveEdge = rect.top - padding;

  let tooltip: { left: number; top: number };

  if (belowEdge + GAP + TOOLTIP_H <= vh) {
    // Enough room below the spotlight
    tooltip = { left: clampL(rect.left - padding), top: belowEdge + GAP };
  } else if (aboveEdge - GAP - TOOLTIP_H >= 0) {
    // Enough room above the spotlight
    tooltip = { left: clampL(rect.left - padding), top: aboveEdge - GAP - TOOLTIP_H };
  } else if (rect.right + padding + GAP + w <= vw) {
    // Enough room to the right
    tooltip = { left: rect.right + padding + GAP, top: clampT(rect.top - padding) };
  } else {
    // Fall back to the left side
    tooltip = { left: Math.max(8, rect.left - padding - GAP - w), top: clampT(rect.top - padding) };
  }

  return { spotlight, tooltip };
}

interface TourTooltipProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  isLast: boolean;
  top: number;
  left: number;
  width: number;
  onSkip: () => void;
  onNext: () => void;
}

const TourTooltip: React.FC<TourTooltipProps> = ({
  step, currentStep, totalSteps, isLast, top, left, width, onSkip, onNext,
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={currentStep}
      className={styles.tooltip}
      style={{ top, left, width }}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className={styles.tooltipHeader}>
        <span className={styles.progress}>{currentStep + 1} / {totalSteps}</span>
        <button className={styles.closeBtn} onClick={onSkip} aria-label="Skip tour">
          <X size={15} />
        </button>
      </div>

      <h4 className={styles.title}>{step.title}</h4>

      {step.sections ? (
        <div className={`${styles.sectionGrid} ${step.sections.length > 3 ? styles.sectionGridTwo : ""}`}>
          {step.sections.map((s) => (
            <div key={s.heading}>
              <div className={styles.sectionHeading}>{s.heading}</div>
              <div className={styles.sectionBody}>{s.body}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.content}>{step.content}</p>
      )}

      <div className={styles.footer}>
        <div className={styles.dots}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${
                i === currentStep ? styles.dotActive
                  : i < currentStep ? styles.dotPast
                  : styles.dotFuture
              }`}
            />
          ))}
        </div>
        <button className={styles.nextBtn} onClick={onNext}>
          {isLast ? "Done" : "Next"}
          {!isLast && <ChevronRight size={12} />}
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

const TourOverlay: React.FC<TourOverlayProps> = ({ steps, onFinish, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  useEffect(() => {
    const recalc = () => {
      if (!step?.target) { setTargetRect(null); return; }
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      setTargetRect(el ? el.getBoundingClientRect() : null);
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [currentStep, step?.target]);

  if (!step) return null;

  const padding = step.padding ?? 8;
  const w = step.wide ? TOOLTIP_W_WIDE : TOOLTIP_W;
  const { spotlight, tooltip } = computeOverlayLayout(targetRect, padding, w);

  const goNext = () => {
    if (isLast) onFinish();
    else setCurrentStep((s) => s + 1);
  };

  return (
    <>
      {spotlight ? (
        <motion.div
          className={styles.spotlight}
          initial={false}
          animate={{ ...spotlight }}
          transition={{ type: "spring", damping: 30, stiffness: 380 }}
        />
      ) : (
        <div className={styles.overlay} />
      )}

      <TourTooltip
        step={step}
        currentStep={currentStep}
        totalSteps={steps.length}
        isLast={isLast}
        top={tooltip.top}
        left={tooltip.left}
        width={w}
        onSkip={onSkip}
        onNext={goNext}
      />
    </>
  );
};

export default TourOverlay;
