import React from "react";
import { colors } from "@/styles/colors";

const styles = `
  /* === JOIN MAP LOADER === */

  /* Phase 1 — door drops in from top */
  @keyframes jm-dropIn {
    0% { opacity:0; transform:translateY(-20px) scale(.8); }
    10% { opacity:1; transform:translateY(3px) scale(1.02); }
    15%, 20% { transform:translateY(0) scale(1); opacity:1; }
    /* Phase 2 — rattle: light knock */
    22% { transform:translateX(-2px); }
    25% { transform:translateX(2.5px); }
    28% { transform:translateX(-2px); }
    31% { transform:translateX(1.5px); }
    34% { transform:translateX(-1px); }
    37%, 88% { transform:translateX(0); opacity:1; }
    /* Phase 5 — sink away */
    96%, 100% { opacity:0; transform:translateY(12px) scale(.8); }
  }
  /* Phase 3 — panel slides open */
  @keyframes jm-slide {
    0%, 38% { transform:translateX(0); }
    62%, 84% { transform:translateX(-56px); }
    94%, 100% { transform:translateX(0); }
  }
  /* Phase 4 — light reveals */
  @keyframes jm-light {
    0%, 38% { opacity:0; width:4px; }
    62%, 84% { opacity:.4; width:54px; }
    94%, 100% { opacity:0; width:4px; }
  }
  /* Knob fades as door opens */
  @keyframes jm-knob { 0%,50%{opacity:1} 64%,100%{opacity:0} }
  /* Dust particles scatter when door opens */
  @keyframes jm-dust1 { 0%,55%{opacity:0;transform:translate(0,0) scale(0)} 65%{opacity:.9;transform:translate(14px,-8px) scale(1.2)} 82%,100%{opacity:0;transform:translate(24px,-14px) scale(0)} }
  @keyframes jm-dust2 { 0%,57%{opacity:0;transform:translate(0,0) scale(0)} 67%{opacity:.8;transform:translate(18px,4px) scale(1)} 84%,100%{opacity:0;transform:translate(30px,7px) scale(0)} }
  @keyframes jm-dust3 { 0%,59%{opacity:0;transform:translate(0,0) scale(0)} 69%{opacity:.7;transform:translate(10px,-16px) scale(.9)} 86%,100%{opacity:0;transform:translate(16px,-28px) scale(0)} }
  @keyframes jm-dust4 { 0%,56%{opacity:0;transform:translate(0,0) scale(0)} 66%{opacity:.6;transform:translate(20px,-4px) scale(.8)} 83%,100%{opacity:0;transform:translate(34px,-6px) scale(0)} }
  @keyframes jm-dust5 { 0%,61%{opacity:0;transform:translate(0,0) scale(0)} 71%{opacity:.5;transform:translate(8px,10px) scale(.7)} 88%,100%{opacity:0;transform:translate(12px,18px) scale(0)} }
  /* Light ray streaks through open door */
  @keyframes jm-ray1 { 0%,60%{opacity:0;width:0} 68%,80%{opacity:.15;width:30px} 88%,100%{opacity:0;width:0} }
  @keyframes jm-ray2 { 0%,63%{opacity:0;width:0} 71%,80%{opacity:.1;width:22px} 88%,100%{opacity:0;width:0} }
  @keyframes jm-dotP { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }

  .jm-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
  .jm-scene { position:relative; width:88px; height:88px; display:flex; align-items:flex-end; justify-content:center; }
  .jm-dropper { animation:jm-dropIn 4s ease-in-out infinite; display:flex; flex-direction:column; align-items:center; }
  .jm-frame { width:68px; height:74px; border:2.5px solid ${colors.amber}; border-bottom:none; border-radius:5px 5px 0 0; position:relative; overflow:hidden; }
  .jm-light { position:absolute; right:0; top:0; height:100%; background:${colors.amber}; animation:jm-light 4s ease-in-out infinite; }
  /* light rays inside frame */
  .jm-ray { position:absolute; top:50%; height:2px; background:#FAEEDA; border-radius:1px; right:0; transform:translateY(-50%) rotate(-12deg); }
  .jm-ray1 { top:35%; animation:jm-ray1 4s ease-in-out infinite; }
  .jm-ray2 { top:62%; animation:jm-ray2 4s ease-in-out infinite; }
  .jm-panel { width:62px; height:68px; background:${colors.primary}; position:absolute; left:0; top:0; animation:jm-slide 4s ease-in-out infinite; }
  .jm-stripe { position:absolute; right:8px; top:0; bottom:0; width:3px; background:${colors.primaryDim}; opacity:.35; }
  .jm-stripe2 { position:absolute; right:16px; top:0; bottom:0; width:1.5px; background:${colors.primaryDim}; opacity:.2; }
  .jm-knob { width:7px; height:7px; border-radius:50%; background:${colors.text}; position:absolute; right:12px; top:32px; animation:jm-knob 4s ease-in-out infinite; }
  .jm-step { width:74px; height:6px; background:${colors.amber}; border-radius:0 0 4px 4px; opacity:.45; }
  .jm-dust { position:absolute; border-radius:50%; right:18px; top:44px; }
  .jm-d1{width:5px;height:5px;background:#EF9F27;animation:jm-dust1 4s ease-in-out infinite}
  .jm-d2{width:4px;height:4px;background:#FAEEDA;animation:jm-dust2 4s ease-in-out infinite}
  .jm-d3{width:5px;height:5px;background:#EF9F27;animation:jm-dust3 4s ease-in-out infinite}
  .jm-d4{width:3px;height:3px;background:#FBEAF0;animation:jm-dust4 4s ease-in-out infinite}
  .jm-d5{width:4px;height:4px;background:#BA7517;animation:jm-dust5 4s ease-in-out infinite}
  .jm-dots { display:flex; gap:5px; }
  .jm-dot { width:5px; height:5px; border-radius:50%; animation:jm-dotP 1.2s ease-in-out infinite; }
  .jm-label { font-size:13px; letter-spacing:.07em; }
`;

interface JoinMapLoaderProps { label?: string; className?: string; }

export default function JoinMapLoader({ label = "joining map", className = "" }: JoinMapLoaderProps) {
  return (
    <>
      <style>{styles}</style>
      <div className={`jm-wrap ${className}`}>
        <div className="jm-scene">
          <div className="jm-dropper">
            <div className="jm-frame">
              <div className="jm-light" />
              <div className="jm-ray jm-ray1" />
              <div className="jm-ray jm-ray2" />
              <div className="jm-panel">
                <div className="jm-stripe" />
                <div className="jm-stripe2" />
                <div className="jm-knob" />
              </div>
              <div className="jm-dust jm-d1" />
              <div className="jm-dust jm-d2" />
              <div className="jm-dust jm-d3" />
              <div className="jm-dust jm-d4" />
              <div className="jm-dust jm-d5" />
            </div>
            <div className="jm-step" />
          </div>
        </div>
        <div className="jm-dots">
          <div className="jm-dot" style={{ background:"#D4537E", animationDelay:"0s" }} />
          <div className="jm-dot" style={{ background:"#EF9F27", animationDelay:"0.2s" }} />
          <div className="jm-dot" style={{ background:"#D4537E", animationDelay:"0.4s" }} />
        </div>
        {label && <span className="jm-label" style={{ color:"var(--color-text-secondary,#888)" }}>{label}</span>}
      </div>
    </>
  );
}