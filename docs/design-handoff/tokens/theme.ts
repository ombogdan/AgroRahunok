// АгроРахунок — design tokens for React Native
export const colors = {
  light: {
    primary: '#26734D', primaryPressed: '#1D5A3C', primarySoft: '#E4F0E7',
    accent: '#E3A43B', accentSoft: '#FBEFD6', accentInk: '#7A4E0C',
    background: '#F5F8F2', surface: '#FFFFFF', segment: '#E6EDE4',
    text: '#193327', textMuted: '#607367', border: '#DCE7DC',
    success: '#2E8B57', warning: '#B87816', danger: '#C5483B',
    onPrimary: '#FFFFFF', scrim: 'rgba(16,32,24,0.38)',
  },
  dark: {
    primary: '#73C995', primaryPressed: '#58B67E', primarySoft: '#21412F',
    accent: '#E9B45C', accentSoft: '#3A3120', accentInk: '#F2CD8C',
    background: '#102018', surface: '#1A3023', segment: '#0C1912',
    text: '#EEF7EF', textMuted: '#B1C5B6', border: '#345542',
    success: '#73C995', warning: '#E9B45C', danger: '#F08478',
    onPrimary: '#102018', scrim: 'rgba(0,0,0,0.55)',
  },
} as const;

export type Theme = typeof colors.light;

// SF Pro = system font on iOS: don't set fontFamily. Keep allowFontScaling on (Dynamic Type).
export const type = {
  heroNumber: { fontSize: 40, lineHeight: 48, fontWeight: '700' },
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  number:     { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  stat:       { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  title2:     { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  title3:     { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  button:     { fontSize: 19, lineHeight: 24, fontWeight: '600' },
  body:       { fontSize: 17, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  secondary:  { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  caption:    { fontSize: 13, lineHeight: 18, fontWeight: '500' },
} as const;

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 32, xxxl: 48, screen: 20 } as const;
export const radius = { s: 8, m: 12, l: 16, xl: 20, full: 999 } as const;

export const size = {
  hit: 44, buttonHeight: 56, numberField: 64, listRow: 72, sheetOption: 76, tile: 96,
  tabBar: 83, navBar: 52, iconCircle: 44, iconCircleL: 56,
} as const;

export const shadow = {
  card: { shadowColor: '#193327', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  dock: { shadowColor: '#26734D', shadowOpacity: 0.25, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  segment: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
} as const; // dark theme: no shadows, use 1px border

export const map = {
  polygonFill: 'rgba(233,180,92,0.28)', polygonStroke: '#F2C063', polygonStrokeWidth: 3,
  vertexRadius: 9, vertexFill: '#FFFFFF', vertexStroke: '#E3A43B', vertexStrokeWidth: 4,
} as const;

export const cropColor = (crop: string, t: Theme) => (crop === 'Пшениця озима' ? t.accent : t.primary);
