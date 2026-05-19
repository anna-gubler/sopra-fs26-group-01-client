import React from "react";
import { colors } from "@/styles/colors";

const styles = `
  /* === SKILL MAP LOADER === */

  /* Level 1 — top node drops in */
  @keyframes sm-n1 {
    0% { opacity:0; transform:translateY(-16px) scale(.4); }
    8% { opacity:1; transform:translateY(3px) scale(1.2); }
    13% { transform:translateY(-1px) scale(.95); }
    17%,76% { opacity:1; transform:translateY(0) scale(1); }
    88%,100% { opacity:0; transform:translateY(-8px) scale(.3); }
  }
  /* Level 2 — bounce in from sides */
  @keyframes sm-n2 {
    0%,12% { opacity:0; transform:translateX(-20px) scale(.4); }
    22% { opacity:1; transform:translateX(3px) scale(1.15); }
    27% { transform:translateX(-1px) scale(.96); }
    32%,76% { opacity:1; transform:translateX(0) scale(1); }
    88%,100% { opacity:0; transform:translateX(-10px) scale(.3); }
  }
  @keyframes sm-n3 {
    0%,15% { opacity:0; transform:translateX(20px) scale(.4); }
    25% { opacity:1; transform:translateX(-3px) scale(1.15); }
    30% { transform:translateX(1px) scale(.96); }
    35%,76% { opacity:1; transform:translateX(0) scale(1); }
    88%,100% { opacity:0; transform:translateX(10px) scale(.3); }
  }
  /* Level 3 — pop up from below */
  @keyframes sm-n4 {
    0%,28% { opacity:0; transform:translateY(16px) scale(.4); }
    38% { opacity:1; transform:translateY(-3px) scale(1.18); }
    43% { transform:translateY(1px) scale(.95); }
    48%,76% { opacity:1; transform:translateY(0) scale(1); }
    88%,100% { opacity:0; transform:translateY(8px) scale(.3); }
  }
  @keyframes sm-n5 {
    0%,32% { opacity:0; transform:translateY(16px) scale(.4); }
    42% { opacity:1; transform:translateY(-3px) scale(1.18); }
    47% { transform:translateY(1px) scale(.95); }
    52%,76% { opacity:1; transform:translateY(0) scale(1); }
    88%,100% { opacity:0; transform:translateY(8px) scale(.3); }
  }
  @keyframes sm-n6 {
    0%,36% { opacity:0; transform:translateY(16px) scale(.4); }
    46% { opacity:1; transform:translateY(-3px) scale(1.18); }
    51% { transform:translateY(1px) scale(.95); }
    56%,76% { opacity:1; transform:translateY(0) scale(1); }
    88%,100% { opacity:0; transform:translateY(8px) scale(.3); }
  }
  /* Edges draw in sequence */
  @keyframes sm-e1 { 0%,17%{stroke-dashoffset:65;opacity:0} 30%,76%{stroke-dashoffset:0;opacity:.9} 88%,100%{opacity:0} }
  @keyframes sm-e2 { 0%,22%{stroke-dashoffset:65;opacity:0} 35%,76%{stroke-dashoffset:0;opacity:.9} 88%,100%{opacity:0} }
  @keyframes sm-e3 { 0%,33%{stroke-dashoffset:65;opacity:0} 46%,76%{stroke-dashoffset:0;opacity:.9} 88%,100%{opacity:0} }
  @keyframes sm-e4 { 0%,37%{stroke-dashoffset:65;opacity:0} 50%,76%{stroke-dashoffset:0;opacity:.9} 88%,100%{opacity:0} }
  @keyframes sm-e5 { 0%,41%{stroke-dashoffset:65;opacity:0} 54%,76%{stroke-dashoffset:0;opacity:.9} 88%,100%{opacity:0} }
  /* Progress bar */
  @keyframes sm-prog {
    0%,5%{width:0%}
    76%{width:94%}
    84%{width:100%}
    90%,100%{width:0%}
  }
  /* Whole graph pulse on completion */
  @keyframes sm-glow { 0%,74%{filter:none} 81%{filter:drop-shadow(0 0 7px ${colors.primary})} 88%,100%{filter:none} }
  /* Completion burst */
  @keyframes sm-bst1 { 0%,72%{opacity:0;transform:translate(0,0) scale(0)} 80%{opacity:1;transform:translate(16px,-20px) scale(1.4)} 92%,100%{opacity:0;transform:translate(28px,-34px) scale(0)} }
  @keyframes sm-bst2 { 0%,74%{opacity:0;transform:translate(0,0) scale(0)} 82%{opacity:1;transform:translate(-14px,-22px) scale(1.3)} 94%,100%{opacity:0;transform:translate(-24px,-38px) scale(0)} }
  @keyframes sm-bst3 { 0%,73%{opacity:0;transform:translate(0,0) scale(0)} 81%{opacity:1;transform:translate(22px,4px) scale(1.2)} 93%,100%{opacity:0;transform:translate(38px,6px) scale(0)} }
  @keyframes sm-bst4 { 0%,75%{opacity:0;transform:translate(0,0) scale(0)} 83%{opacity:1;transform:translate(-20px,4px) scale(1.2)} 95%,100%{opacity:0;transform:translate(-34px,6px) scale(0)} }
  @keyframes sm-bst5 { 0%,76%{opacity:0;transform:translate(0,0) scale(0)} 84%{opacity:1;transform:translate(4px,-28px) scale(1)} 96%,100%{opacity:0;transform:translate(6px,-46px) scale(0)} }
  @keyframes sm-dotP { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }

  .sm-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
  .sm-stage { position:relative; width:106px; height:96px; animation:sm-glow 4.4s ease-in-out infinite; }
  .sm-node { position:absolute; width:22px; height:22px; border-radius:5px; }
  .sm-svg { position:absolute; top:0; left:0; width:106px; height:96px; overflow:visible; }
  .sm-edge { fill:none; stroke-width:1.4; stroke-dasharray:65; }
  .sm-bar-wrap { width:88px; height:5px; background:rgba(148,120,150,.15); border-radius:3px; overflow:hidden; }
  .sm-bar { height:100%; background:linear-gradient(90deg,${colors.primary},${colors.amber}); border-radius:3px; animation:sm-prog 4.4s ease-in-out infinite; }
  .sm-burst { position:absolute; border-radius:50%; left:50%; top:50%; }
  .sm-b1{width:7px;height:7px;margin:-3.5px 0 0 -3.5px;background:${colors.amber};animation:sm-bst1 4.4s ease-in-out infinite}
  .sm-b2{width:6px;height:6px;margin:-3px 0 0 -3px;background:${colors.primary};animation:sm-bst2 4.4s ease-in-out infinite}
  .sm-b3{width:7px;height:7px;margin:-3.5px 0 0 -3.5px;background:${colors.text};animation:sm-bst3 4.4s ease-in-out infinite}
  .sm-b4{width:5px;height:5px;margin:-2.5px 0 0 -2.5px;background:${colors.primaryHover};animation:sm-bst4 4.4s ease-in-out infinite}
  .sm-b5{width:6px;height:6px;margin:-3px 0 0 -3px;background:${colors.amber};animation:sm-bst5 4.4s ease-in-out infinite}
  .sm-dots { display:flex; gap:5px; }
  .sm-dot { width:5px; height:5px; border-radius:50%; animation:sm-dotP 1.2s ease-in-out infinite; }
  .sm-label { font-size:13px; letter-spacing:.07em; }
`;

const DUR = "4.4s";

interface SkillMapLoaderProps { label?: string; className?: string; }

export default function SkillMapLoader({ label = "loading map", className = "" }: SkillMapLoaderProps) {
  return (
    <>
      <style>{styles}</style>
      <div className={`sm-wrap ${className}`}>
        <div className="sm-stage">
          <svg className="sm-svg">
            <line className="sm-edge" x1="53" y1="22" x2="18" y2="42" stroke="#993556" style={{ animation:`sm-e1 ${DUR} ease-in-out infinite` }} />
            <line className="sm-edge" x1="53" y1="22" x2="88" y2="42" stroke="#BA7517" style={{ animation:`sm-e2 ${DUR} ease-in-out infinite` }} />
            <line className="sm-edge" x1="18" y1="64" x2="18" y2="72" stroke="#993556" style={{ animation:`sm-e3 ${DUR} ease-in-out infinite` }} />
            <line className="sm-edge" x1="88" y1="64" x2="53" y2="72" stroke="#BA7517" style={{ animation:`sm-e4 ${DUR} ease-in-out infinite` }} />
            <line className="sm-edge" x1="88" y1="64" x2="88" y2="72" stroke="#BA7517" style={{ animation:`sm-e5 ${DUR} ease-in-out infinite` }} />
          </svg>
          {/* level 1 */}
          <div className="sm-node" style={{ left:42, top:0, background:"#D4537E", animation:`sm-n1 ${DUR} ease-in-out infinite` }} />
          {/* level 2 */}
          <div className="sm-node" style={{ left:7, top:40, background:"#EF9F27", animation:`sm-n2 ${DUR} ease-in-out infinite` }} />
          <div className="sm-node" style={{ left:77, top:40, background:"#EF9F27", animation:`sm-n3 ${DUR} ease-in-out infinite` }} />
          {/* level 3 */}
          <div className="sm-node" style={{ left:7, top:70, background:"#993556", animation:`sm-n4 ${DUR} ease-in-out infinite` }} />
          <div className="sm-node" style={{ left:42, top:70, background:"#BA7517", animation:`sm-n5 ${DUR} ease-in-out infinite` }} />
          <div className="sm-node" style={{ left:77, top:70, background:"#BA7517", animation:`sm-n6 ${DUR} ease-in-out infinite` }} />
          <div className="sm-burst sm-b1" /><div className="sm-burst sm-b2" />
          <div className="sm-burst sm-b3" /><div className="sm-burst sm-b4" />
          <div className="sm-burst sm-b5" />
        </div>
        <div className="sm-bar-wrap"><div className="sm-bar" /></div>
        <div className="sm-dots">
          <div className="sm-dot" style={{ background:colors.primary, animationDelay:"0s" }} />
          <div className="sm-dot" style={{ background:colors.amber, animationDelay:"0.2s" }} />
          <div className="sm-dot" style={{ background:colors.primary, animationDelay:"0.4s" }} />
        </div>
        {label && <span className="sm-label" style={{ color:"var(--color-text-secondary,#888)" }}>{label}</span>}
      </div>
    </>
  );
}