"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";

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

function tooltipPosition(rect: DOMRect | null, padding: number, w: number): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const TH = 260;
  const gap = 14;

  if (!rect) return { left: Math.max(8, (vw - w) / 2), top: Math.max(8, (vh - TH) / 2) };

  const clampL = (x: number) => Math.min(Math.max(x, 8), vw - w - 8);
  const clampT = (y: number) => Math.min(Math.max(y, 8), vh - TH - 8);
  const sBottom = rect.bottom + padding;
  const sTop = rect.top - padding;

  if (sBottom + gap + TH <= vh) return { left: clampL(rect.left - padding), top: sBottom + gap };
  if (sTop - gap - TH >= 0) return { left: clampL(rect.left - padding), top: sTop - gap - TH };
  if (rect.right + padding + gap + w <= vw) return { left: rect.right + padding + gap, top: clampT(rect.top - padding) };
  return { left: Math.max(8, rect.left - padding - gap - w), top: clampT(rect.top - padding) };
}

const TourOverlay: React.FC<TourOverlayProps> = ({ steps, onFinish, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];
  const padding = step?.padding ?? 8;
  const isLast = currentStep === steps.length - 1;
  const w = step?.wide ? TOOLTIP_W_WIDE : TOOLTIP_W;

  useEffect(() => {
    if (!step?.target) { setTargetRect(null); return; }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    setTargetRect(el ? el.getBoundingClientRect() : null);
  }, [currentStep, step?.target]);

  const goNext = () => {
    if (isLast) onFinish();
    else setCurrentStep((s) => s + 1);
  };

  if (!step) return null;

  const sl = targetRect ? targetRect.left - padding : 0;
  const st = targetRect ? targetRect.top - padding : 0;
  const sw = targetRect ? targetRect.width + padding * 2 : 0;
  const sh = targetRect ? targetRect.height + padding * 2 : 0;
  const tp = tooltipPosition(targetRect, padding, w);

  return (
    <>
      {targetRect ? (
        <motion.div
          style={{
            position: "fixed", zIndex: 9998, borderRadius: 6, pointerEvents: "none",
            boxShadow: "0 0 0 9999px rgba(10, 10, 18, 0.78)",
            outline: "2px solid rgba(233, 30, 140, 0.35)",
          }}
          initial={false}
          animate={{ left: sl, top: st, width: sw, height: sh }}
          transition={{ type: "spring", damping: 30, stiffness: 380 }}
        />
      ) : (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9997,
          background: "rgba(10, 10, 18, 0.78)", pointerEvents: "none",
        }} />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            position: "fixed", left: tp.left, top: tp.top, width: w,
            zIndex: 9999, pointerEvents: "all",
            background: "var(--bg-elevated)", border: "1px solid var(--border-color)",
            borderRadius: 12, padding: "16px 18px 14px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(233,30,140,0.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {currentStep + 1} / {steps.length}
            </span>
            <button onClick={onSkip} aria-label="Skip tour" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2, display: "flex", alignItems: "center", borderRadius: 4 }}>
              <X size={15} />
            </button>
          </div>

          <h4 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "var(--text-bright)", fontFamily: "var(--font-display)", lineHeight: 1.3 }}>
            {step.title}
          </h4>

          {step.sections ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: step.sections.length > 3 ? "1fr 1fr" : "1fr",
              gap: "10px 20px",
              marginBottom: 14,
            }}>
              {step.sections.map((s) => (
                <div key={s.heading}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                    {s.heading}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {s.body}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {step.content}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 5 }}>
              {steps.map((_, i) => (
                <div key={i} style={{
                  height: 5, width: i === currentStep ? 16 : 5, borderRadius: 3,
                  background: i === currentStep ? "var(--primary)" : i < currentStep ? "var(--text-muted)" : "var(--border-color)",
                  transition: "all 0.25s",
                }} />
              ))}
            </div>
            <button
              onClick={goNext}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "6px 14px",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                border: "none", borderRadius: 8, color: "#fff",
                fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em",
              }}
            >
              {isLast ? "Done" : "Next"}
              {!isLast && <ChevronRight size={12} />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TourOverlay;
