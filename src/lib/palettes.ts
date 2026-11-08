export type PaletteKey =
  | 'gold'
  | 'crimson'
  | 'emerald'
  | 'royal'
  | 'bronze'
  | 'slate';

export interface Palette {
  key: PaletteKey;
  name: string;
  /** Main accent — gold/crimson/etc. Used for icons, borders, highlights */
  accent: string;
  /** Brighter version of accent for text on dark backgrounds */
  accentBright: string;
  /** Muted accent for secondary text (e.g. job title in header) */
  accentMuted: string;
  /** Dark background — hero, trust section, footer accents */
  dark: string;
  /** Slightly lighter dark for gradients and pills */
  darkSoft: string;
  /** Page background — the warm off-white */
  pageBg: string;
  /** Section border accent (between hero and form) */
  borderAccent: string;
  /** Divider color in brand row */
  divider: string;
  /** Light accent tint for the "Start here" label */
  accentTint: string;
  /** Badge border color (warm tone) */
  badgeBorder: string;
  /** Badge background (dark translucent) */
  badgeBg: string;
  /** Hero divider line color */
  heroLine: string;
}

export const PALETTES: Palette[] = [
  {
    key: 'gold',
    name: 'Gold & Charcoal',
    accent: '#b38318',
    accentBright: '#e0bb54',
    accentMuted: '#7a5a13',
    dark: '#111111',
    darkSoft: '#2a2519',
    pageBg: '#f6f5f2',
    borderAccent: '#b38318',
    divider: '#b38318',
    accentTint: '#8a6617',
    badgeBorder: '#d8c28a',
    badgeBg: '#2a2519',
    heroLine: '#d4a72c',
  },
  {
    key: 'crimson',
    name: 'Crimson & Noir',
    accent: '#a8202a',
    accentBright: '#e85a64',
    accentMuted: '#7a1820',
    dark: '#1a1212',
    darkSoft: '#2e1e1e',
    pageBg: '#f7f4f3',
    borderAccent: '#a8202a',
    divider: '#a8202a',
    accentTint: '#8a2830',
    badgeBorder: '#e0b0b4',
    badgeBg: '#2e1e1e',
    heroLine: '#c83848',
  },
  {
    key: 'emerald',
    name: 'Emerald & Onyx',
    accent: '#1a7a52',
    accentBright: '#3ebe88',
    accentMuted: '#155a3d',
    dark: '#0f1a14',
    darkSoft: '#1e2e24',
    pageBg: '#f3f6f4',
    borderAccent: '#1a7a52',
    divider: '#1a7a52',
    accentTint: '#2a6a48',
    badgeBorder: '#a8d8c0',
    badgeBg: '#1e2e24',
    heroLine: '#2a9a68',
  },
  {
    key: 'royal',
    name: 'Royal Blue & Slate',
    accent: '#1e5fb0',
    accentBright: '#5a9ee8',
    accentMuted: '#164580',
    dark: '#0f1a2a',
    darkSoft: '#1e2e44',
    pageBg: '#f3f5f8',
    borderAccent: '#1e5fb0',
    divider: '#1e5fb0',
    accentTint: '#2a5080',
    badgeBorder: '#a8c8e8',
    badgeBg: '#1e2e44',
    heroLine: '#3a80d0',
  },
  {
    key: 'bronze',
    name: 'Bronze & Espresso',
    accent: '#9a6b3f',
    accentBright: '#d4a06a',
    accentMuted: '#6e4d2e',
    dark: '#1e1610',
    darkSoft: '#332720',
    pageBg: '#f6f3f0',
    borderAccent: '#9a6b3f',
    divider: '#9a6b3f',
    accentTint: '#7a5530',
    badgeBorder: '#dcc8a8',
    badgeBg: '#332720',
    heroLine: '#b8884a',
  },
  {
    key: 'slate',
    name: 'Steel & Graphite',
    accent: '#4a6580',
    accentBright: '#7a9ab8',
    accentMuted: '#36495c',
    dark: '#1a1f24',
    darkSoft: '#2a323a',
    pageBg: '#f4f5f6',
    borderAccent: '#4a6580',
    divider: '#4a6580',
    accentTint: '#3a5068',
    badgeBorder: '#b8c8d8',
    badgeBg: '#2a323a',
    heroLine: '#6a8aa8',
  },
];

const PALETTE_MAP: Record<string, Palette> = Object.fromEntries(
  PALETTES.map((p) => [p.key, p]),
);

export function getPalette(key: string | null | undefined): Palette {
  if (key && PALETTE_MAP[key]) return PALETTE_MAP[key];
  return PALETTES[0];
}
