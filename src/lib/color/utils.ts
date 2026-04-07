import { converter, formatHex, parse } from 'culori';

export interface OklchColor {
  mode: 'oklch';
  l: number;
  c: number;
  h: number;
}

const toRgb = converter('rgb');
const toOklch = converter('oklch');

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const wrapHue = (h: number) => {
  const normalized = h % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

export const oklch = (l: number, c: number, h: number): OklchColor => ({
  mode: 'oklch',
  l: clamp(l, 0, 1),
  c: clamp(c, 0, 0.38),
  h: wrapHue(h),
});

export const blendOklch = (
  a: OklchColor,
  b: OklchColor,
  c: OklchColor,
  wa: number,
  wb: number,
  wc: number,
): OklchColor => {
  const total = wa + wb + wc;
  const nWa = wa / total;
  const nWb = wb / total;
  const nWc = wc / total;

  // Circular hue averaging avoids jump around 0/360.
  const hues = [a.h, b.h, c.h];
  const weights = [nWa, nWb, nWc];
  const hueX = hues.reduce(
    (sum, hue, idx) => sum + Math.cos((hue * Math.PI) / 180) * weights[idx],
    0,
  );
  const hueY = hues.reduce(
    (sum, hue, idx) => sum + Math.sin((hue * Math.PI) / 180) * weights[idx],
    0,
  );
  const mixedHue = wrapHue((Math.atan2(hueY, hueX) * 180) / Math.PI);

  return oklch(
    a.l * nWa + b.l * nWb + c.l * nWc,
    a.c * nWa + b.c * nWb + c.c * nWc,
    mixedHue,
  );
};

export const oklchToHex = (color: OklchColor) => formatHex(toRgb(color));

export const hexToOklch = (hex: string): OklchColor | null => {
  const parsed = parse(hex);
  if (!parsed) return null;
  const converted = toOklch(parsed);
  if (!converted || typeof converted.h !== 'number') return null;
  return oklch(converted.l ?? 0.6, converted.c ?? 0.12, converted.h);
};

export const hexToRgbTuple = (hex: string): [number, number, number] => {
  const parsed = toRgb(parse(hex));
  if (!parsed) return [0, 0, 0];
  return [
    Math.round((parsed.r ?? 0) * 255),
    Math.round((parsed.g ?? 0) * 255),
    Math.round((parsed.b ?? 0) * 255),
  ];
};

export const rgbTupleToString = (rgb: [number, number, number]) =>
  `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

export const rgbToHsl = ([r8, g8, b8]: [number, number, number]) => {
  const r = r8 / 255;
  const g = g8 / 255;
  const b = b8 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = 60 * (((g - b) / d) % 6);
        break;
      case g:
        h = 60 * ((b - r) / d + 2);
        break;
      default:
        h = 60 * ((r - g) / d + 4);
        break;
    }
  }

  return {
    h: wrapHue(h),
    s: clamp(s * 100, 0, 100),
    l: clamp(l * 100, 0, 100),
  };
};

export const hexToHslString = (hex: string) => {
  const hsl = rgbToHsl(hexToRgbTuple(hex));
  return `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%)`;
};

export const pickReadableText = (bgHex: string) => {
  const [r, g, b] = hexToRgbTuple(bgHex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#0c1015' : '#f7fbff';
};

export const validateHex = (value: string) =>
  /^#?[0-9a-fA-F]{6}$/.test(value.trim());

export const normalizeHex = (value: string) => {
  const trimmed = value.trim();
  if (!validateHex(trimmed)) return null;
  return trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`;
};

export const stepToLightness = (step: number) => {
  const map: Record<number, number> = {
    50: 0.985,
    100: 0.95,
    200: 0.9,
    300: 0.82,
    400: 0.73,
    500: 0.63,
    600: 0.54,
    700: 0.44,
    800: 0.34,
    900: 0.24,
    950: 0.17,
  };
  return map[step] ?? 0.63;
};
