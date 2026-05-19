import React from "react";
import { colors } from "@/styles/colors";

const styles = `
  /* === CREATE MAP LOADER === */

  /* Nodes orbit a center point then snap to final position */
  @keyframes cm-orbit1 {
    0% { opacity:0; transform:translate(0,0) scale(.3); }
    8% { opacity:1; transform:translate(0,-32px) scale(1); }
    10%,18% { transform:translate(0,-32px) scale(1); }
    /* orbit arc */
    14% { transform:translate(22px,-22px) scale(1); }
    /* snap to final: top-center */
    30%,78% { opacity:1; transform:translate(0,0) scale(1); }
    88%,100% { opacity:0; transform:translate(0,0) scale(.2); }
  }
  @keyframes cm-orbit2 {
    0%,5% { opacity:0; transform:translate(0,0) scale(.3); }
    13% { opacity:1; transform:translate(32px,0) scale(1); }
    /* orbit arc */
    20% { transform:translate(22px,22px) scale(1); }
    /* snap to final: bottom-left */
    36%,78% { opacity:1; transform:translate(0,0) scale(1); }
    88%,100% { opacity:0; transform:translate(0,0) scale(.2); }
  }
  @keyframes cm-orbit3 {
    0%,10% { opacity:0; transform:translate(0,0) scale(.3); }
    18% { opacity:1; transform:translate(-32px,0) scale(1); }
    /* orbit arc */
    26% { transform:translate(-22px,22px) scale(1); }
    /* snap to final: bottom-right */
    42%,78% { opacity:1; transform:translate(0,0) scale(1); }
    88%,100% { opacity:0; transform:translate(0,0) scale(.2); }
  }
  @keyframes cm-orbit4 {
    0%,16% { opacity:0; transform:translate(0,0) scale(.3); }
    24% { opacity:1; transform:translate(0,32px) scale(1); }
    32% { transform:translate(-14px,24px) scale(1); }
    /* snap to final: bottom-center */
    48%,78% { opacity:1; transform:translate(0,0) scale(1); }
    88%,100% { opacity:0; transform:translate(0,0) scale(.2); }
  }
  /* Edges draw after nodes settle */
  @keyframes cm-e1 { 0%,28%{stroke-dashoffset:55;opacity:0} 42%,78%{stroke-dashoffset:0;opacity:.9} 88%,100%{opacity:0} }
  @keyframes cm-e2 { 0%,34%{stroke-dashoffset:55;opacity:0} 48%,78%{stroke-dashoffset:0;opacity:.9} 88%,100%{opacity:0} }
  @keyframes cm-e3 { 0%,40%{stroke-dashoffset:55;opacity:0} 54%,78%{stroke-dashoffset:0;opacity:.9} 88%,100%{opacity:0} }
  /* Graph pulses at completion */
  @keyframes cm-glow { 0%,72%{filter:none} 80%{filter:drop-shadow(0 0 6px ${colors.primary})} 88%,100%{filter:none} }
  /* Completion burst particles */
  @keyframes cm-burst1 { 0%,70%{opacity:0;transform:translate(0,0) scale(0)} 78%{opacity:1;transform:translate(18px,-18px) scale(1.3)} 90%,100%{opacity:0;transform:translate(30px,-30px) scale(0)} }
  @keyframes cm-burst2 { 0%,72%{opacity:0;transform:translate(0,0) scale(0)} 80%{opacity:1;transform:translate(-16px,-20px) scale(1.3)} 92%,100%{opacity:0;transform:translate(-28px,-34px) scale(0)} }
  @keyframes cm-burst3 { 0%,71%{opacity:0;transform:translate(0,0) scale(0)} 79%{opacity:1;transform:translate(22px,6px) scale(1.2)} 91%,100%{opacity:0;transform:translate(36px,10px) scale(0)} }
  @keyframes cm-burst4 { 0%,73%{opacity:0;transform:translate(0,0) scale(0)} 81%{opacity:1;transform:translate(-20px,6px) scale(1.2)} 93%,100%{opacity:0;transform:translate(-34px,10px) scale(0)} }
  @keyframes cm-burst5 { 0%,74%{opacity:0;transform:translate(0,0) scale(0)} 82%{opacity:1;transform:translate(4px,-26px) scale(1)} 94%,100%{opacity:0;transform:translate(6px,-42px) scale(0)} }
  @keyframes cm-dotP { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }

  .cm-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
  .cm-stage { position:relative; width:100px; height:96px; animation:cm-pulse 3s ease-in-out infinite; }
  .cm-center { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); }
  .cm-node { width:24px; height:24px; border-radius:6px; display:flex; align-items:center; justify-content:center; }
  .cm-dot { width:7px; height:7px; border-radius:50%; }
  /* node wrappers positioned at final spots, animation handles the movement */
  .cm-n1-wrap { position:absolute; left:38px; top:2px; }
  .cm-n2-wrap { position:absolute; left:4px; top:50px; }
  .cm-n3-wrap { position:absolute; left:72px; top:50px; }
  .cm-n4-wrap { position:absolute; left:38px; top:68px; }
  .cm-n1 { animation:cm-orbit1 3s ease-in-out infinite; }
  .cm-n2 { animation:cm-orbit2 3s ease-in-out infinite; }
  .cm-n3 { animation:cm-orbit3 3s ease-in-out infinite; }
  .cm-n4 { animation:cm-orbit4 3s ease-in-out infinite; }
  .cm-svg { position:absolute; top:0; left:0; width:100px; height:96px; overflow:visible; }
  .cm-edge { fill:none; stroke-width:1.5; stroke-dasharray:55; }
  .cm-burst { position:absolute; width:7px; height:7px; border-radius:50%; left:50%; top:50%; margin:-3.5px 0 0 -3.5px; }
  .cm-b1{background:${colors.amber};animation:cm-burst1 3s ease-in-out infinite}
  .cm-b2{background:${colors.primary};animation:cm-burst2 3s ease-in-out infinite}
  .cm-b3{background:${colors.text};animation:cm-burst3 3s ease-in-out infinite}
  .cm-b4{background:${colors.primaryHover};animation:cm-burst4 3s ease-in-out infinite}
  .cm-b5{background:${colors.amber};animation:cm-burst5 3s ease-in-out infinite}
  .cm-dots { display:flex; gap:5px; }
  .cm-dot-pulse { width:5px; height:5px; border-radius:50%; animation:cm-dotP 1.2s ease-in-out infinite; }
  .cm-label { font-size:13px; letter-spacing:.07em; }
`;

const DUR = "3s";

interface CreateMapLoaderProps { label?: string; className?: string; }

export default function CreateMapLoader({ label = "creating map", className = "" }: CreateMapLoaderProps) {
  return (
    <>
      <style>{styles}</style>
      <div className={`cm-wrap ${className}`}>
        <div className="cm-stage">
          <svg className="cm-svg">
            <line className="cm-edge" x1="50" y1="26" x2="16" y2="62" stroke={colors.primaryDim} style={{ animation:`cm-e1 ${DUR} ease-in-out infinite` }} />
            <line className="cm-edge" x1="50" y1="26" x2="84" y2="62" stroke={colors.amber} style={{ animation:`cm-e2 ${DUR} ease-in-out infinite` }} />
            <line className="cm-edge" x1="16" y1="72" x2="50" y2="80" stroke={colors.primaryDim} strokeDasharray="40" style={{ animation:`cm-e3 ${DUR} ease-in-out infinite` }} />
            <line className="cm-edge" x1="84" y1="72" x2="50" y2="80" stroke={colors.amber} strokeDasharray="40" style={{ animation:`cm-e3 ${DUR} ease-in-out 0.1s infinite` }} />
          </svg>
          <div className="cm-n1-wrap"><div className="cm-node cm-n1" style={{ background:colors.primary }}><div className="cm-dot" style={{ background:colors.text }} /></div></div>
          <div className="cm-n2-wrap"><div className="cm-node cm-n2" style={{ background:colors.amber }}><div className="cm-dot" style={{ background:colors.text }} /></div></div>
          <div className="cm-n3-wrap"><div className="cm-node cm-n3" style={{ background:colors.amber }}><div className="cm-dot" style={{ background:colors.text }} /></div></div>
          <div className="cm-n4-wrap"><div className="cm-node cm-n4" style={{ background:colors.primaryDim }}><div className="cm-dot" style={{ background:colors.text }} /></div></div>
          <div className="cm-burst cm-b1" /><div className="cm-burst cm-b2" />
          <div className="cm-burst cm-b3" /><div className="cm-burst cm-b4" />
          <div className="cm-burst cm-b5" />
        </div>
        <div className="cm-dots">
          <div className="cm-dot-pulse" style={{ background:colors.primary, animationDelay:"0s" }} />
          <div className="cm-dot-pulse" style={{ background:colors.amber, animationDelay:"0.2s" }} />
          <div className="cm-dot-pulse" style={{ background:colors.primary, animationDelay:"0.4s" }} />
        </div>
        {label && <span className="cm-label" style={{ color:"var(--color-text-secondary,#888)" }}>{label}</span>}
      </div>
    </>
  );
}