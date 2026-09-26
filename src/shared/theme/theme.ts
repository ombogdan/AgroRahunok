export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const typography = {
  label: 12,
  body: 16,
  heading: 20,
  title: 32,
} as const;

const lightColors = {
  primary: '#26734D',
  primaryPressed: '#1D5A3C',
  accent: '#E3A43B',
  background: '#F5F8F2',
  surface: '#FFFFFF',
  text: '#193327',
  textMuted: '#607367',
  border: '#DCE7DC',
  success: '#2E8B57',
  warning: '#B87816',
  danger: '#C5483B',
  onPrimary: '#FFFFFF',
} as const;

const darkColors: Record<keyof typeof lightColors, string> = {
  primary: '#73C995',
  primaryPressed: '#58B67E',
  accent: '#E9B45C',
  background: '#102018',
  surface: '#1A3023',
  text: '#EEF7EF',
  textMuted: '#B1C5B6',
  border: '#345542',
  success: '#73C995',
  warning: '#E9B45C',
  danger: '#F08478',
  onPrimary: '#102018',
};

export const lightTheme = {
  colors: lightColors,
  spacing,
  radii,
  typography,
};

export const darkTheme = {
  colors: darkColors,
  spacing,
  radii,
  typography,
};

export type AppTheme = typeof darkTheme;
