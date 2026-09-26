// Source of truth: docs/design-handoff/tokens/theme.ts.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {sm: 8, md: 12, base: 16, lg: 20, full: 999} as const;

export const typography = {
  label: 13,
  small: 15,
  body: 17,
  button: 19,
  heading: 22,
  stat: 24,
  number: 28,
  title: 34,
  metric: 40,
} as const;

const lightColors = {
  primary: '#26734D',
  primaryPressed: '#1D5A3C',
  primarySoft: '#E4F0E7',
  accent: '#E3A43B',
  accentSoft: '#FBEFD6',
  accentInk: '#7A4E0C',
  background: '#F5F8F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F8F2',
  segment: '#E6EDE4',
  text: '#193327',
  textMuted: '#607367',
  border: '#DCE7DC',
  success: '#2E8B57',
  warning: '#B87816',
  danger: '#C5483B',
  onPrimary: '#FFFFFF',
  scrim: 'rgba(16,32,24,0.38)',
} as const;

const darkColors: Record<keyof typeof lightColors, string> = {
  primary: '#73C995',
  primaryPressed: '#58B67E',
  primarySoft: '#21412F',
  accent: '#E9B45C',
  accentSoft: '#3A3120',
  accentInk: '#F2CD8C',
  background: '#102018',
  surface: '#1A3023',
  surfaceAlt: '#102018',
  segment: '#0C1912',
  text: '#EEF7EF',
  textMuted: '#B1C5B6',
  border: '#345542',
  success: '#73C995',
  warning: '#E9B45C',
  danger: '#F08478',
  onPrimary: '#102018',
  scrim: 'rgba(0,0,0,0.55)',
};

export const lightTheme = {colors: lightColors, spacing, radii, typography};
export const darkTheme = {colors: darkColors, spacing, radii, typography};
export type AppTheme = typeof darkTheme;
