import React from "react";
import "@/styles/loader.css";

interface MappdLoaderProps {
  label?: string;
  className?: string;
  overlay?: boolean;
}

export default function MappdLoader({
  label = "loading mappd",
  className = "",
  overlay = false,
}: MappdLoaderProps) {
  const inner = (
    <div className={`mappd-loader-wrap ${className}`}>
      <div className="mappd-nodes">
        <svg className="mappd-edges">
          <line className="mappd-edge mappd-edge-pink-1"  x1="88" y1="36" x2="28"  y2="52" />
          <line className="mappd-edge mappd-edge-amber-1" x1="88" y1="36" x2="148" y2="52" />
          <line className="mappd-edge mappd-edge-amber-2" x1="28" y1="70" x2="88"  y2="84" />
          <line className="mappd-edge mappd-edge-pink-2"  x1="148" y1="70" x2="88" y2="84" />
        </svg>

        <div className="mappd-node mappd-node-n1">
          <div className="mappd-node-dot" style={{ background: "rgba(255,255,255,0.4)" }} />
        </div>
        <div className="mappd-node mappd-node-n2">
          <div className="mappd-node-dot" style={{ background: "rgba(255,255,255,0.4)" }} />
        </div>
        <div className="mappd-node mappd-node-n3">
          <div className="mappd-node-dot" style={{ background: "rgba(255,255,255,0.4)" }} />
        </div>
        <div className="mappd-node mappd-node-n4">
          <div className="mappd-node-dot" style={{ background: "rgba(255,255,255,0.4)" }} />
        </div>
      </div>

      <div className="mappd-dots-row">
        <div className="mappd-dot-pulse mappd-dot-1" />
        <div className="mappd-dot-pulse mappd-dot-2" />
        <div className="mappd-dot-pulse mappd-dot-3" />
      </div>

      {label && <span className="mappd-label">{label}</span>}
    </div>
  );

  if (overlay) {
    return <div className="mappd-loader-overlay">{inner}</div>;
  }

  return inner;
}
