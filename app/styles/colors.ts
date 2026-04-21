// app/styles/colors.ts
// ─────────────────────────────────────────────────────────────────────────────
// MAPPD COLOUR PALETTE — single source of truth
// To swap themes: replace the values below. All CSS variables, Ant Design tokens,
// and component styles derive from this object — nothing else needs changing.
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // ── Backgrounds ────────────────────────────────────────────────────────
  bg0:          '#0a0a12', // deepest — modals, overlays
  bg1:          '#0f0f1a', // app shell background
  bg2:          '#141422', // page background
  bg3:          '#1a1a2e', // card backgrounds
  bg4:          '#21213a', // input backgrounds, table rows
  bg5:          '#2a2a48', // hover states, dividers
  bg6:          '#333355', // active states, secondary buttons

  // ── Borders ────────────────────────────────────────────────────────────
  border:       '#252540',
  border2:      '#333355',
  border3:      '#42426a',

  // ── Text ───────────────────────────────────────────────────────────────
  text:         '#f8e3ff',
  sub1:         '#c8b8e8',
  sub0:         '#9880b8',
  muted:        '#5a4878', // disabled / decorative (WCAG exempt)

  // ── Primary — Hot Pink ─────────────────────────────────────────────────
  primary:      '#f472b6',
  primaryHover: '#e879f9',
  primaryDim:   '#b03880',
  primaryBg:    '#1f0d1a',

  // ── Success — Emerald ──────────────────────────────────────────────────
  emerald:      '#34d399',
  emeraldDim:   '#0f8055',
  emeraldBg:    '#081a12',

  // ── Warning — Amber (Collaboration Mode accent) ────────────────────────
  amber:        '#fb923c',
  amberBg:      '#1f100a',

  // ── Error — Rose ───────────────────────────────────────────────────────
  rose:         '#f43f5e',
  roseBg:       '#1f080e',

  // ── Info — Violet ──────────────────────────────────────────────────────
  violet:       '#a78bfa',
  violetBg:     '#130f28',
} as const;

export type ColorKey = keyof typeof colors;
