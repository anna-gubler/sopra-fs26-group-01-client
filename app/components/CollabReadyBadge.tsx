"use client";

import React, { useState } from "react";

const base: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  padding: "6px 14px",
  borderRadius: "9999px",
  border: "1px solid rgba(251, 146, 60, 0.3)",
  background: "rgba(251, 146, 60, 0.07)",
  color: "#fb923c",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.02em",
  cursor: "default",
  transition: "box-shadow 0.2s, border-color 0.2s, background 0.2s",
  userSelect: "none",
};

const hovered: React.CSSProperties = {
  borderColor: "rgba(251, 146, 60, 0.7)",
  background: "rgba(251, 146, 60, 0.12)",
  boxShadow: "0 0 14px rgba(251, 146, 60, 0.45), 0 0 32px rgba(251, 146, 60, 0.18)",
};

const dot: React.CSSProperties = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#fb923c",
  flexShrink: 0,
  animation: "collab-pulse 1.4s ease-in-out infinite",
};

const CollabReadyBadge: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      style={{ ...base, ...(isHovered ? hovered : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={dot} />
      Live Collaboration Ready
    </span>
  );
};

export default CollabReadyBadge;
