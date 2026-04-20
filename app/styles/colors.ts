// app/styles/colors.ts
// ─────────────────────────────────────────────────────────────────────────────
// MAPPD COLOUR PALETTE
// To swap themes: replace the values below. All CSS variables, Ant Design tokens,
// and component styles derive from this single object — nothing else needs changing.
// Current theme: Catppuccin Mocha (https://catppuccin.com/palette)
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // ── Backgrounds ────────────────────────────────────────────────────────
  bg0:          '#11111b', // crust    — deepest background, modals/overlays
  bg1:          '#181825', // mantle   — sidebar, panels
  bg2:          '#1e1e2e', // base     — main page background
  bg3:          '#252537', // base+1   — card backgrounds
  bg4:          '#313244', // surface0 — input backgrounds, table rows
  bg5:          '#45475a', // surface1 — hover states, dividers
  bg6:          '#585b70', // surface2 — active states, secondary buttons

  // ── Borders ────────────────────────────────────────────────────────────
  border:       '#313244', // surface0
  border2:      '#45475a', // surface1
  border3:      '#585b70', // surface2

  // ── Text ───────────────────────────────────────────────────────────────
  text:         '#cdd6f4', // mocha text     — primary readable text
  sub1:         '#bac2de', // subtext1       — secondary labels, captions
  sub0:         '#a6adc8', // subtext0       — tertiary, placeholder
  muted:        '#9399b2', // overlay2       — tertiary readable text (min 4.5:1 on all backgrounds)

  // ── Primary — Mauve (Default Mode) ─────────────────────────────────────
  primary:      '#cba6f7',
  primaryHover: '#d8bbff',
  primaryDim:   '#8b6db8',
  primaryBg:    '#1e1a2e',

  // ── Complete — Sky ("Understood") ──────────────────────────────────────
  complete:     '#89dceb',
  completeDim:  '#2a5f68',
  completeBg:   '#0e2329',

  // ── Progress — Lavender ─────────────────────────────────────────────────
  progress:     '#b4befe',
  progressBg:   '#1a1b35',

  // ── Warning — Peach (also Collaboration Mode accent) ───────────────────
  warning:      '#fab387',
  warningBg:    '#2a1a0e',

  // ── Error — Red ────────────────────────────────────────────────────────
  error:        '#f38ba8',
  errorBg:      '#2a0f18',

  // ── Accent — Pink ──────────────────────────────────────────────────────
  accent:       '#f5c2e7',
  accentBg:     '#2a1120',
} as const;

export type ColorKey = keyof typeof colors;
