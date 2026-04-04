"use client";

import { motion } from "framer-motion";
import { BookOpen, Network, Users, BarChart2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/styles/landing.module.css";

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
      className={styles['preview-card']}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
    >
      {/* course header */}
      <div className={styles['preview-card-header']}>
        <div>
          <div className={styles['preview-card-title']}>
            Software Engineering | FS26
          </div>
          <div className={styles['preview-card-author']}>
            by Prof. Dr. Thomas Fritz
          </div>
        </div>
        <div className={styles['preview-card-stats']}>
          <div className={styles['preview-card-students']}>127 Students</div>
          <div className={styles['preview-card-live']}>● LIVE</div>
        </div>
      </div>

      {/* progress bar */}
      <div className={styles['preview-progress-wrap']}>
        <div className={styles['preview-progress-bar']}>
          <motion.div
            className={styles['preview-progress-fill']}
            initial={{ width: 0 }}
            animate={{ width: "28%" }}
            transition={{ duration: 1.2, delay: 0.8 }}
          />
        </div>
        <div className={styles['preview-progress-label']}>28%</div>
      </div>

      {/* SVG skill map */}
      <div className={styles['preview-svg-wrap']}>
        <svg viewBox="0 -15 570 290">
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
      className={styles['feature-card']}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={styles['feature-card-icon']}
        style={{
          "--feature-icon-bg": `${iconColor}22`,
          "--feature-icon-border": `${iconColor}44`,
        } as React.CSSProperties}
      >
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <h3 className={styles['feature-card-title']}>{title}</h3>
        <p className={styles['feature-card-description']}>{description}</p>
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
    <div className="page-deep">

      {/* dot grid overlay */}
      <div className="grid-overlay" />

      {/* navigation bar */}
      <nav className="glass-nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <BookOpen size={16} color="white" />
          </div>
          <span className="logo-text">Mappd</span>
        </div>
        <div className="nav-buttons">
          <Link href="/login" className="btn-ghost btn-sm">
            Log in
          </Link>
          <Link href="/register" className="btn-gradient btn-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className={styles['landing-hero']}>
        {/* left column */}
        <motion.div
          className={styles['landing-hero-left']}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className={styles['hero-badge']}>
              ● Live Collaboration Ready
            </span>
          </motion.div>
          <motion.h1 className={styles['hero-heading']} variants={fadeUp} transition={{ duration: 0.5 }}>
            Map Skills.<br />
            <span className="gradient-text">Track Mastery.</span>
          </motion.h1>
          <motion.p className={styles['hero-description']} variants={fadeUp} transition={{ duration: 0.5 }}>
            An interactive skill-mapping platform for educators and students.
            Visualize course competencies, track understanding, and collaborate in real-time.
          </motion.p>
          <motion.div className={styles['hero-buttons']} variants={fadeUp} transition={{ duration: 0.5 }}>
            <button className="btn-gradient" onClick={() => router.push("/register")}>
              Start Mapping
            </button>
            <button className="btn-ghost" onClick={() => router.push("/login")}>
              Sign In
            </button>
          </motion.div>
        </motion.div>

        {/* right column, animated skill map */}
        <div className={styles['landing-hero-right']}>
          <SkillMapPreview />
        </div>
      </section>

      {/* features */}
      <section className={styles['landing-features']}>
        <motion.div
          className={styles['landing-features-intro']}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles['landing-features-heading']}>
            Everything you need to learn smarter
          </h2>
          <p className={styles['landing-features-description']}>
            Designed for university courses, Mappd bridges the gap between curriculum design and student understanding.
          </p>
        </motion.div>
        <div className={styles['landing-features-grid']}>
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
      <section className={styles['landing-cta']}>
        <motion.div
          className={styles['landing-cta-card']}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles['landing-cta-heading']}>
            <span className="gradient-text">Ready to map your learning?</span>
          </h2>
          <p className={styles['landing-cta-description']}>
            Join us and use Mappd to create visual, interactive skill trees for your courses.
          </p>
          <button className={`btn-gradient ${styles['btn-cta']}`} onClick={() => router.push("/register")}>
            Create Your First Map
          </button>
        </motion.div>
      </section>

    </div>
  );
}
