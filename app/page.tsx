"use client";

import { motion } from "framer-motion";
import { BookOpen, Network, Users, BarChart2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// skill map node data

const nodeColors: Record<string, string> = {
  cyan:   "hsl(160, 60%, 52%)",
  pink:   "hsl(330, 70%, 56%)",
  purple: "hsl(263, 70%, 58%)",
};

const mapNodes = [
  { id: 0, cx: 210, cy: 43,  color: "purple" },
  { id: 1, cx: 374, cy: 43,  color: "purple" },
  { id: 2, cx: 117, cy: 133, color: "pink" },
  { id: 3, cx: 304, cy: 133, color: "purple" },
  { id: 4, cx: 445, cy: 133, color: "pink" },
  { id: 5, cx: 70,  cy: 220, color: "cyan", active: true, label: "● SKILL 1  20%" },
  { id: 6, cx: 165, cy: 220, color: "cyan" },
  { id: 7, cx: 258, cy: 220, color: "cyan" },
  { id: 8, cx: 350, cy: 220, color: "cyan" },
  { id: 9, cx: 445, cy: 220, color: "cyan" },
];

const mapConnections = [
  [5, 2], [6, 2], [7, 3], [8, 3], [9, 4],
  [2, 0], [3, 0], [3, 1], [4, 1],
];

// animated skill map preview

function SkillMapPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: 16,
        overflow: "hidden",
        maxWidth: 520,
        width: "100%",
        flexShrink: 0,
      }}
    >
      {/* course header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-bright)" }}>
            Software Engineering | FS26
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            by Prof. Dr. Thomas Fritz
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>127 Students</div>
          <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>● LIVE</div>
        </div>
      </div>

      {/* progress bar */}
      <div style={{ padding: "10px 20px 4px" }}>
        <div style={{ background: "var(--bg-elevated)", height: 5, borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            style={{ background: "var(--accent)", height: "100%", borderRadius: 3 }}
            initial={{ width: 0 }}
            animate={{ width: "28%" }}
            transition={{ duration: 1.2, delay: 0.8 }}
          />
        </div>
        <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 4, fontWeight: 600 }}>28%</div>
      </div>

      {/* SVG skill map */}
      <div style={{ padding: "4px 12px 14px" }}>
        <svg viewBox="0 -15 570 290" style={{ width: "100%", height: "auto" }}>
          <defs>
            <filter id="glow-cyan">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* connection lines */}
          {mapConnections.map(([from, to]) => {
            const f = mapNodes[from];
            const t = mapNodes[to];
            return (
              <line
                key={`${from}-${to}`}
                x1={f.cx} y1={f.cy - 17}
                x2={t.cx} y2={t.cy + 17}
                stroke="hsla(258, 24%, 45%, 0.7)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* week labels */}
          {[{ y: 43, label: "Week 3" }, { y: 133, label: "Week 2" }, { y: 220, label: "Week 1" }].map(({ y, label }) => (
            <text key={label} x="565" y={y + 4} textAnchor="end" fill="hsl(262, 20%, 55%)" fontSize="9.5">
              {label}
            </text>
          ))}

          {/* nodes */}
          {mapNodes.map((node) => (
            <motion.g
              key={node.id}
              animate={{ y: [-2, 2, -2] }}
              transition={{
                duration: 2 + node.id * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: node.id * 0.15,
              }}
            >
              <rect
                x={node.cx - 40} y={node.cy - 17}
                width={80} height={34}
                rx={4}
                fill={node.active ? "hsla(160, 60%, 52%, 0.12)" : "hsla(249, 40%, 8%, 0.5)"}
                stroke={nodeColors[node.color]}
                strokeWidth={node.active ? 2 : 1.5}
                filter={node.active ? "url(#glow-cyan)" : undefined}
              />
              {node.label && (
                <text
                  x={node.cx} y={node.cy + 4}
                  textAnchor="middle"
                  fill={nodeColors[node.color]}
                  fontSize="8.5"
                  fontWeight="500"
                >
                  {node.label}
                </text>
              )}
            </motion.g>
          ))}
        </svg>
      </div>
    </motion.div>
  );
}

// feature card

function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: 12,
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: `${iconColor}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${iconColor}44`,
      }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-bright)", marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// landing page

const features = [
  {
    icon: Network,
    title: "Visual Skill Maps",
    description: "Map out course skills as interactive node graphs with prerequisites and progress tracking.",
    iconColor: "hsl(263, 70%, 58%)",
  },
  {
    icon: Users,
    title: "Live Collaboration",
    description: "Run real-time sessions where students signal understanding and lecturers see aggregated heatmaps.",
    iconColor: "hsl(330, 70%, 56%)",
  },
  {
    icon: BarChart2,
    title: "Progress Analytics",
    description: "Track individual and class-wide progress with detailed breakdowns per skill and week.",
    iconColor: "hsl(263, 70%, 58%)",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Students self-assess understanding in real-time, giving lecturers actionable insights.",
    iconColor: "hsl(160, 60%, 52%)",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100vh", color: "var(--text-bright)" }}>

      {/* dot grid overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage:
          "linear-gradient(hsla(263,70%,58%,0.07) 1px, transparent 1px), linear-gradient(to right, hsla(263,70%,58%,0.07) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* navigation bar */}
      <nav className="glass-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "var(--font-space-grotesk)" }}>Mappd</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" className="btn-ghost" style={{ padding: "8px 18px", fontSize: 14 }}>
            Log in
          </Link>
          <Link href="/register" className="btn-gradient" style={{ padding: "8px 18px", fontSize: 14 }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* hero styling */}
      <section style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "80px 48px 60px",
        gap: 60,
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {/* left column */}
        <motion.div
          style={{ flex: 1, minWidth: 0 }}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className="hero-badge" style={{ marginBottom: 24, display: "inline-flex" }}>
              ● Live Collaboration Ready
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} style={{
            fontSize: "clamp(40px, 5vw, 64px)",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 20,
          }}>
            Map Skills.<br />
            <span className="gradient-text">Track Mastery.</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} style={{
            fontSize: 18,
            color: "var(--text-muted)",
            lineHeight: 1.7,
            maxWidth: 480,
            marginBottom: 36,
          }}>
            An interactive skill-mapping platform for educators and students.
            Visualize course competencies, track understanding, and collaborate in real-time.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} style={{ display: "flex", gap: 12 }}>
            <button className="btn-gradient" onClick={() => router.push("/register")}>
              Start Mapping
            </button>
            <button className="btn-ghost" onClick={() => router.push("/login")}>
              Sign In
            </button>
          </motion.div>
        </motion.div>

        {/* right column, animated skill map */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
          <SkillMapPreview />
        </div>
      </section>

      {/* features */}
      <section style={{
        position: "relative",
        zIndex: 1,
        padding: "80px 48px",
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 14 }}>
            Everything you need to learn smarter
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 520, margin: "0 auto" }}>
            Designed for university courses, Mappd bridges the gap between curriculum design and student understanding.
          </p>
        </motion.div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <FeatureCard {...f} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* bottom CTA */}
      <section style={{
        position: "relative",
        zIndex: 1,
        padding: "80px 48px 100px",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: 20,
            padding: "60px 40px",
            textAlign: "center",
            maxWidth: 680,
            width: "100%",
          }}
        >
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
            <span className="gradient-text">Ready to map your learning?</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
            Join us and use Mappd to create visual, interactive skill trees for your courses.
          </p>
          <button className="btn-gradient" style={{ fontSize: 16, padding: "14px 32px" }} onClick={() => router.push("/register")}>
            Create Your First Map
          </button>
        </motion.div>
      </section>

    </div>
  );
}
