// Palette validated for colourblind-safe separation + contrast via the
// project's dataviz skill (validate_palette.js, --pairs all, light & dark).
export const light = {
  surface: '#fcfcfb',
  page: '#f9f9f7',
  card: '#ffffff',
  textPrimary: '#0b0b0b',
  textSecondary: '#52514e',
  textMuted: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
  border: 'rgba(11,11,11,0.10)',
  good: '#0ca30c',
  warning: '#fab219',
  critical: '#d03b3b',
  calories: '#2a78d6',
  protein: '#008300',
  carbs: '#e87ba4',
  fat: '#eda100',
};

export const dark = {
  surface: '#1a1a19',
  page: '#0d0d0d',
  card: '#242423',
  textPrimary: '#ffffff',
  textSecondary: '#c3c2b7',
  textMuted: '#898781',
  gridline: '#2c2c2a',
  baseline: '#383835',
  border: 'rgba(255,255,255,0.10)',
  good: '#0ca30c',
  warning: '#fab219',
  critical: '#e66767',
  calories: '#3987e5',
  protein: '#008300',
  carbs: '#d55181',
  fat: '#c98500',
};

export type Palette = typeof light;
