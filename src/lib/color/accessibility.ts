import { APCAcontrast, sRGBtoY } from 'apca-w3';
import type { AccessibilityItem, PaletteResult } from '../../types/palette';
import { hexToRgbTuple, hexToOklch, oklch, oklchToHex } from './utils';

const linearize = (channel: number) => {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

export const wcagContrast = (fgHex: string, bgHex: string) => {
  const [fr, fg, fb] = hexToRgbTuple(fgHex);
  const [br, bg, bb] = hexToRgbTuple(bgHex);
  const fLum = 0.2126 * linearize(fr) + 0.7152 * linearize(fg) + 0.0722 * linearize(fb);
  const bLum = 0.2126 * linearize(br) + 0.7152 * linearize(bg) + 0.0722 * linearize(bb);
  const lighter = Math.max(fLum, bLum);
  const darker = Math.min(fLum, bLum);
  return (lighter + 0.05) / (darker + 0.05);
};

export const apcaScore = (fgHex: string, bgHex: string) => {
  const fg = hexToRgbTuple(fgHex);
  const bg = hexToRgbTuple(bgHex);
  const score = APCAcontrast(sRGBtoY(fg), sRGBtoY(bg));
  return Number(score.toFixed(1));
};

const toItem = (label: string, fg: string, bg: string): AccessibilityItem => {
  const wcag = Number(wcagContrast(fg, bg).toFixed(2));
  const apca = apcaScore(fg, bg);
  return {
    label,
    fg,
    bg,
    wcag,
    apca,
    passNormal: wcag >= 4.5,
    passLarge: wcag >= 3,
    passAPCA: Math.abs(apca) >= 60,
  };
};

export const analyzeAccessibility = (palette: PaletteResult): AccessibilityItem[] => {
  const { alias, component } = palette;
  return [
    toItem('content.primary on bg.canvas', alias.content.primary, alias.bg.canvas),
    toItem('content.secondary on bg.canvas', alias.content.secondary, alias.bg.canvas),
    toItem('button.primary.text on button.primary.bg', component.button.primary.text, component.button.primary.bg),
    toItem('input.text on input.bg', component.input.text, component.input.bg),
    toItem('input.placeholder on input.bg', component.input.placeholder, component.input.bg),
    toItem('alert.positive.text on alert.positive.bg', component.alert.positive.text, component.alert.positive.bg),
    toItem('border.default on bg.surface', alias.border.default, alias.bg.surface),
    toItem('focus.ring on bg.surface', alias.focus.ring, alias.bg.surface),
  ];
};

const nudgeLightness = (hex: string, delta: number) => {
  const color = hexToOklch(hex);
  if (!color) return hex;
  return oklchToHex(oklch(color.l + delta, color.c, color.h));
};

export const correctPaletteAccessibility = (palette: PaletteResult, strict = false): PaletteResult => {
  const corrected = structuredClone(palette);
  const threshold = strict ? 4.8 : 4.5;
  let safety = 0;

  while (safety < 12) {
    safety += 1;
    corrected.accessibility = analyzeAccessibility(corrected);
    const failing = corrected.accessibility.filter(
      (item) => item.wcag < threshold || Math.abs(item.apca) < (strict ? 66 : 60),
    );
    if (!failing.length) break;

    const hasPrimaryFail = failing.some((f) => f.label.includes('content.primary'));
    if (hasPrimaryFail) {
      corrected.alias.content.primary = nudgeLightness(
        corrected.alias.content.primary,
        corrected.meta.themeMode === 'dark' ? 0.045 : -0.045,
      );
      corrected.component.input.text = corrected.alias.content.primary;
      corrected.component.card.text = corrected.alias.content.primary;
    }

    const buttonFail = failing.some((f) => f.label.includes('button.primary.text'));
    if (buttonFail) {
      corrected.component.button.primary.text =
        corrected.meta.themeMode === 'dark' ? '#F8FBFF' : '#0D1117';
    }

    const borderFail = failing.some((f) => f.label.includes('border.default'));
    if (borderFail) {
      corrected.alias.border.default = nudgeLightness(
        corrected.alias.border.default,
        corrected.meta.themeMode === 'dark' ? 0.06 : -0.06,
      );
      corrected.component.input.border = corrected.alias.border.default;
      corrected.component.table.border = corrected.alias.border.default;
      corrected.component.card.border = corrected.alias.border.default;
    }

    const placeholderFail = failing.some((f) => f.label.includes('placeholder'));
    if (placeholderFail) {
      corrected.component.input.placeholder = nudgeLightness(
        corrected.component.input.placeholder,
        corrected.meta.themeMode === 'dark' ? 0.05 : -0.05,
      );
    }
  }

  corrected.meta.corrected = true;
  corrected.accessibility = analyzeAccessibility(corrected);
  return corrected;
};

export const colorBlindnessWarnings = (palette: PaletteResult) => {
  const warnings: string[] = [];
  const positiveNegative = wcagContrast(
    palette.semantic.positive.default,
    palette.semantic.negative.default,
  );
  const noticeNegative = wcagContrast(
    palette.semantic.notice.default,
    palette.semantic.negative.default,
  );
  if (positiveNegative < 1.35) {
    warnings.push('Positive and negative defaults are close in luminance; add icons/labels for clarity.');
  }
  if (noticeNegative < 1.25) {
    warnings.push('Notice and negative colors can be confused in some color vision conditions.');
  }
  if (palette.accessibility.some((item) => !item.passNormal)) {
    warnings.push('Some text pairings fail body text contrast. Use accessibility correction.');
  }
  return warnings;
};
