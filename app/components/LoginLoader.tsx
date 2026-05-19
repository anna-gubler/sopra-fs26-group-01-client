import React from "react";
import { colors } from "@/styles/colors";

const styles = `
  /* === LOGIN LOADER === */

  /* Phase 1 — lock appears from below */
  @keyframes log-lockAppear {
    0% { opacity:0; transform:translateY(16px) scale(.7); }
    10% { opacity:1; transform:translateY(-3px) scale(1.05); }
    16%, 22% { transform:translateY(0) scale(1); opacity:1; }
    /* Phase 2 — shake */
    24% { transform:translateX(-3px); }
    27% { transform:translateX(3px); }
    30% { transform:translateX(-2.5px); }
    33% { transform:translateX(2.5px); }
    36% { transform:translateX(-1.5px); }
    39%, 82% { transform:translateX(0); opacity:1; }
    /* Phase 5 — sink away */
    92%, 100% { opacity:0; transform:translateY(10px) scale(.7); }
  }
  /* Phase 3 — arc lifts off */
  @keyframes log-arc {
    0%, 22% { transform:translateY(6px); opacity:.3; }
    42%, 78% { transform:translateY(0); opacity:1; }
    88%, 100% { transform:translateY(6px); opacity:.3; }
  }
  /* Phase 4 — body glows */
  @keyframes log-body {
    0%, 18% { opacity:.25; transform:scale(.9); }
    38%, 75% { opacity:1; transform:scale(1); }
    88%, 100% { opacity:.25; transform:scale(.9); }
  }
  /* Shine sweep across body */
  @keyframes log-shine {
    0%, 35% { left:-100%; }
    55%, 100% { left:160%; }
  }
  /* Keyhole glow pulse */
  @keyframes log-knob {
    0%, 30% { opacity:0; transform:scale(.4); }
    48%, 70% { opacity:1; transform:scale(1); }
    82%, 100% { opacity:0; transform:scale(.4); }
  }
  /* Ripple ring expands on unlock */
  @keyframes log-ripple1 {
    0%, 55% { opacity:0; transform:scale(.3); }
    65% { opacity:.6; transform:scale(1); }
    80%, 100% { opacity:0; transform:scale(1.8); }
  }
  @keyframes log-ripple2 {
    0%, 60% { opacity:0; transform:scale(.3); }
    70% { opacity:.4; transform:scale(1); }
    85%, 100% { opacity:0; transform:scale(2.2); }
  }
  /* Particles burst from keyhole */
  @keyframes log-p1 { 0%,52%{opacity:0;transform:translate(0,0) scale(0)} 62%{opacity:1;transform:translate(10px,-12px) scale(1.2)} 78%,100%{opacity:0;transform:translate(18px,-22px) scale(0)} }
  @keyframes log-p2 { 0%,54%{opacity:0;transform:translate(0,0) scale(0)} 64%{opacity:1;transform:translate(-9px,-14px) scale(1.2)} 80%,100%{opacity:0;transform:translate(-16px,-26px) scale(0)} }
  @keyframes log-p3 { 0%,56%{opacity:0;transform:translate(0,0) scale(0)} 66%{opacity:1;transform:translate(14px,-4px) scale(1)} 82%,100%{opacity:0;transform:translate(24px,-6px) scale(0)} }
  @keyframes log-p4 { 0%,55%{opacity:0;transform:translate(0,0) scale(0)} 65%{opacity:1;transform:translate(-12px,-4px) scale(1)} 81%,100%{opacity:0;transform:translate(-22px,-6px) scale(0)} }
  @keyframes log-dotP { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }

  .log-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
  .log-scene { position:relative; display:flex; flex-direction:column; align-items:center; width:60px; height:70px; justify-content:center; }
  .log-ripple { position:absolute; width:52px; height:52px; border-radius:50%; border:1.5px solid ${colors.primary}; top:8px; pointer-events:none; }
  .log-r1 { animation:log-ripple1 3s ease-in-out infinite; }
  .log-r2 { animation:log-ripple2 3s ease-in-out infinite; }
  .log-lock { display:flex; flex-direction:column; align-items:center; animation:log-lockAppear 3s ease-in-out infinite; position:relative; }
  .log-arc { width:28px; height:16px; border:3px solid ${colors.primary}; border-bottom:none; border-radius:14px 14px 0 0; animation:log-arc 3s ease-in-out infinite; }
  .log-body { width:36px; height:26px; background:${colors.primary}; border-radius:6px; display:flex; align-items:center; justify-content:center; animation:log-body 3s ease-in-out infinite; position:relative; overflow:hidden; }
  .log-shine { position:absolute; top:0; left:-100%; width:55%; height:100%; background:linear-gradient(90deg,transparent,rgba(248,227,255,.3),transparent); animation:log-shine 3s ease-in-out infinite; }
  .log-knob { width:10px; height:10px; border-radius:50%; background:${colors.text}; animation:log-knob 3s ease-in-out infinite; }
  .log-particle { position:absolute; width:5px; height:5px; border-radius:50%; top:50%; left:50%; margin:-2.5px 0 0 -2.5px; }
  .log-p1{background:${colors.amber};animation:log-p1 3s ease-in-out infinite}
  .log-p2{background:${colors.text};animation:log-p2 3s ease-in-out infinite}
  .log-p3{background:${colors.amber};animation:log-p3 3s ease-in-out infinite}
  .log-p4{background:${colors.primary};animation:log-p4 3s ease-in-out infinite}
  .log-dots { display:flex; gap:4px; }
  .log-dot { width:5px; height:5px; border-radius:50%; animation:log-dotP 1.2s ease-in-out infinite; }
  .log-label { font-size:13px; letter-spacing:.07em; }
`;

interface LoginLoaderProps { label?: string; className?: string; }

export default function LoginLoader({ label = "logging in", className = "" }: LoginLoaderProps) {
  return (
    <>
      <style>{styles}</style>
      <div className={`log-wrap ${className}`}>
        <div className="log-scene">
          <div className="log-ripple log-r1" />
          <div className="log-ripple log-r2" />
          <div className="log-lock">
            <div className="log-arc" />
            <div className="log-body">
              <div className="log-shine" />
              <div className="log-knob" />
            </div>
          </div>
          <div className="log-particle log-p1" />
          <div className="log-particle log-p2" />
          <div className="log-particle log-p3" />
          <div className="log-particle log-p4" />
        </div>
        <div className="log-dots">
          <div className="log-dot" style={{ background:colors.primary, animationDelay:"0s" }} />
          <div className="log-dot" style={{ background:colors.amber, animationDelay:"0.2s" }} />
          <div className="log-dot" style={{ background:colors.primary, animationDelay:"0.3s" }} />
        </div>
        {label && <span className="log-label" style={{ color:"var(--color-text-secondary,#888)" }}>{label}</span>}
      </div>
    </>
  );
}