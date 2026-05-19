import React from "react";
import { colors } from "@/styles/colors";

const styles = `
  /* === REGISTER LOADER === */

  /* Phase 1: outer ring expands in */
  @keyframes reg-outerRing {
    0% { opacity: 0; transform: scale(.4); }
    8% { opacity: .5; transform: scale(1.1); }
    14%, 70% { opacity: .25; transform: scale(1); }
    85%, 100% { opacity: 0; transform: scale(1.4); }
  }
  /* Phase 2: dashed ring spins and fades in */
  @keyframes reg-dashRing {
    0%, 4% { opacity: 0; transform: rotate(0deg) scale(.5); }
    14% { opacity: .6; transform: rotate(60deg) scale(1); }
    70% { opacity: .5; transform: rotate(540deg) scale(1); }
    85%, 100% { opacity: 0; transform: rotate(620deg) scale(.5); }
  }
  /* Phase 3: avatar bounces in */
  @keyframes reg-avatar {
    0%, 10% { opacity: 0; transform: scale(.2) translateY(10px); }
    22% { opacity: 1; transform: scale(1.25) translateY(-4px); }
    28% { transform: scale(.92) translateY(2px); }
    34%, 68% { opacity: 1; transform: scale(1) translateY(0); }
    78% { opacity: 1; transform: scale(1.08); }
    86%, 100% { opacity: 0; transform: scale(.2) translateY(-10px); }
  }
  /* Phase 4: checkmark pops */
  @keyframes reg-check {
    0%, 55% { opacity: 0; transform: scale(0) rotate(-45deg); }
    63% { opacity: 1; transform: scale(1.4) rotate(5deg); }
    70%, 80% { opacity: 1; transform: scale(1) rotate(0deg); }
    88%, 100% { opacity: 0; transform: scale(0) rotate(45deg); }
  }
  /* Bars: staggered wave that also fades in/out */
  @keyframes reg-barWave {
    0%, 100% { transform: scaleY(.25); opacity: .3; }
    50% { transform: scaleY(1); opacity: 1; }
  }
  @keyframes reg-barFade {
    0%, 8% { opacity: 0; }
    20%, 78% { opacity: 1; }
    90%, 100% { opacity: 0; }
  }
  /* Sparkle particles burst on checkmark */
  @keyframes reg-spark1 { 0%,58%{opacity:0;transform:translate(0,0) scale(0)} 66%{opacity:1;transform:translate(12px,-14px) scale(1.2)} 80%,100%{opacity:0;transform:translate(20px,-24px) scale(0)} }
  @keyframes reg-spark2 { 0%,60%{opacity:0;transform:translate(0,0) scale(0)} 68%{opacity:1;transform:translate(-10px,-16px) scale(1.2)} 82%,100%{opacity:0;transform:translate(-18px,-28px) scale(0)} }
  @keyframes reg-spark3 { 0%,62%{opacity:0;transform:translate(0,0) scale(0)} 70%{opacity:1;transform:translate(16px,-4px) scale(1.2)} 84%,100%{opacity:0;transform:translate(28px,-6px) scale(0)} }
  @keyframes reg-spark4 { 0%,61%{opacity:0;transform:translate(0,0) scale(0)} 69%{opacity:1;transform:translate(-14px,-6px) scale(1.2)} 83%,100%{opacity:0;transform:translate(-26px,-8px) scale(0)} }
  @keyframes reg-spark5 { 0%,63%{opacity:0;transform:translate(0,0) scale(0)} 71%{opacity:1;transform:translate(4px,-18px) scale(1)} 85%,100%{opacity:0;transform:translate(6px,-30px) scale(0)} }
  @keyframes reg-dotP { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }

  .reg-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
  .reg-avatar-area { position:relative; width:64px; height:64px; display:flex; align-items:center; justify-content:center; }
  .reg-outer { position:absolute; width:64px; height:64px; border-radius:50%; border:1.5px solid ${colors.primary}; animation:reg-outerRing 3s ease-in-out infinite; }
  .reg-dash { position:absolute; width:50px; height:50px; border-radius:50%; border:2px dashed ${colors.primaryDim}; animation:reg-dashRing 3s linear infinite; }
  .reg-av { width:42px; height:42px; border-radius:50%; border:2.5px solid ${colors.primary}; display:flex; align-items:center; justify-content:center; animation:reg-avatar 3s ease-in-out infinite; position:relative; }
  .reg-ck { position:absolute; top:-3px; right:-3px; width:18px; height:18px; border-radius:50%; background:${colors.primary}; display:flex; align-items:center; justify-content:center; animation:reg-check 3s ease-in-out infinite; }
  .reg-spark { position:absolute; width:6px; height:6px; border-radius:50%; top:50%; left:50%; margin:-3px 0 0 -3px; }
  .reg-s1{background:${colors.amber};animation:reg-spark1 3s ease-in-out infinite}
  .reg-s2{background:${colors.primary};animation:reg-spark2 3s ease-in-out infinite}
  .reg-s3{background:${colors.amber};animation:reg-spark3 3s ease-in-out infinite}
  .reg-s4{background:${colors.text};animation:reg-spark4 3s ease-in-out infinite}
  .reg-s5{background:${colors.primary};animation:reg-spark5 3s ease-in-out infinite}
  .reg-bars { display:flex; gap:3px; align-items:flex-end; height:22px; }
  .reg-bar { width:5px; border-radius:2px; background:${colors.primary}; transform-origin:bottom; }
  .reg-dots { display:flex; gap:5px; }
  .reg-dot { width:5px; height:5px; border-radius:50%; animation:reg-dotP 1.2s ease-in-out infinite; }
  .reg-label { font-size:13px; letter-spacing:.07em; }
`;

const BARS = [
  { h:8,  wd:0,    fd:0 },
  { h:13, wd:0.12, fd:0.04 },
  { h:10, wd:0.24, fd:0.08 },
  { h:20, wd:0.36, fd:0.12 },
  { h:14, wd:0.48, fd:0.16 },
  { h:18, wd:0.60, fd:0.20 },
  { h:9,  wd:0.72, fd:0.24 },
  { h:16, wd:0.84, fd:0.28 },
];

interface RegisterLoaderProps { label?: string; className?: string; }

export default function RegisterLoader({ label = "registering", className = "" }: RegisterLoaderProps) {
  return (
    <>
      <style>{styles}</style>
      <div className={`reg-wrap ${className}`}>
        <div className="reg-avatar-area">
          <div className="reg-outer" />
          <div className="reg-dash" />
          <div className="reg-av">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <div className="reg-ck">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke={colors.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1.5,5 4,7.5 8.5,2.5" />
              </svg>
            </div>
          </div>
          <div className="reg-spark reg-s1" /><div className="reg-spark reg-s2" />
          <div className="reg-spark reg-s3" /><div className="reg-spark reg-s4" />
          <div className="reg-spark reg-s5" />
        </div>
        <div className="reg-bars">
          {BARS.map((b, i) => (
            <div key={i} className="reg-bar" style={{
              height: b.h,
              animation: `reg-barWave 1s ease-in-out ${b.wd}s infinite, reg-barFade 3s ease-in-out ${b.fd}s infinite`,
            }} />
          ))}
        </div>
        <div className="reg-dots">
          <div className="reg-dot" style={{ background:colors.primary, animationDelay:"0s" }} />
          <div className="reg-dot" style={{ background:colors.amber, animationDelay:"0.2s" }} />
          <div className="reg-dot" style={{ background:colors.primary, animationDelay:"0.3s" }} />
        </div>
        {label && <span className="reg-label" style={{ color:"var(--color-text-secondary,#888)" }}>{label}</span>}
      </div>
    </>
  );
}