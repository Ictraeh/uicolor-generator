export type ThemeMode = 'light' | 'dark';

export type ScaleStep =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

export const SCALE_STEPS: ScaleStep[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

export type ColorScale = Record<ScaleStep, string>;

export type PaletteFamily =
  | 'neutral'
  | 'accent'
  | 'info'
  | 'positive'
  | 'notice'
  | 'negative';

export type StrategyName =
  | 'analogous'
  | 'splitComplementary'
  | 'triadic'
  | 'monochromeContrast'
  | 'warmCoolTension'
  | 'vividMuted';

export interface GlobalPalette {
  neutral: ColorScale;
  accent: ColorScale;
  info: ColorScale;
  positive: ColorScale;
  notice: ColorScale;
  negative: ColorScale;
  alpha: {
    white: { 5: string; 10: string; 20: string };
    black: { 5: string; 10: string; 20: string };
  };
}

export interface SemanticPalette {
  accent: {
    default: string;
    subtle: string;
    hover: string;
    active: string;
    content: string;
  };
  info: { default: string; subtle: string; content: string };
  positive: { default: string; subtle: string; content: string };
  notice: { default: string; subtle: string; content: string };
  negative: { default: string; subtle: string; content: string };
}

export interface AliasPalette {
  bg: {
    canvas: string;
    surface: string;
    elevated: string;
    subtle: string;
  };
  border: {
    default: string;
    subtle: string;
    strong: string;
  };
  content: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
  };
  focus: { ring: string };
  overlay: { default: string };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    disabled: string;
  };
}

export interface ComponentPalette {
  button: {
    primary: { bg: string; text: string; border: string; hoverBg: string };
    secondary: { bg: string; text: string; border: string; hoverBg: string };
  };
  input: {
    bg: string;
    border: string;
    placeholder: string;
    text: string;
    focusRing: string;
  };
  card: { bg: string; border: string; text: string };
  badge: {
    info: { bg: string; text: string };
    positive: { bg: string; text: string };
    notice: { bg: string; text: string };
    negative: { bg: string; text: string };
  };
  alert: {
    info: { bg: string; border: string; text: string };
    positive: { bg: string; border: string; text: string };
    notice: { bg: string; border: string; text: string };
    negative: { bg: string; border: string; text: string };
  };
  tooltip: { bg: string; text: string };
  navbar: { bg: string; border: string; text: string };
  modal: { bg: string; border: string; text: string };
  tag: { bg: string; text: string; border: string };
  table: { bg: string; headerBg: string; border: string; text: string };
  tabs: {
    bg: string;
    activeBg: string;
    activeText: string;
    inactiveText: string;
    border: string;
  };
}

export interface PaletteMeta {
  source: 'random' | 'seed';
  seedHex?: string;
  themeMode: ThemeMode;
  strategy: StrategyName;
  creativity: number;
  strictAccessibility: boolean;
  corrected: boolean;
  timestamp: string;
}

export interface AccessibilityItem {
  label: string;
  fg: string;
  bg: string;
  wcag: number;
  apca: number;
  passNormal: boolean;
  passLarge: boolean;
  passAPCA: boolean;
}

export interface PaletteResult {
  meta: PaletteMeta;
  keyColors: { primary: string; secondary: string; tertiary: string };
  global: GlobalPalette;
  semantic: SemanticPalette;
  alias: AliasPalette;
  component: ComponentPalette;
  accessibility: AccessibilityItem[];
  warnings: string[];
}
