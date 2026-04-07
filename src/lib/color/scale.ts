import type { ColorScale, ScaleStep } from '../../types/palette';
import { SCALE_STEPS } from '../../types/palette';
import {
  oklchToHex,
  stepToLightness,
  type OklchColor,
  wrapHue,
  oklch,
} from './utils';

const SHIFT_PROFILE: Record<ScaleStep, number> = {
  50: 16,
  100: 12,
  200: 8,
  300: 5,
  400: 2,
  500: 0,
  600: -3,
  700: -7,
  800: -11,
  900: -14,
  950: -18,
};

const hueDirection = (baseHue: number) => {
  if (baseHue >= 40 && baseHue <= 140) return 1;
  if (baseHue >= 260 && baseHue <= 340) return -1;
  return baseHue < 40 || baseHue > 340 ? -1 : 1;
};

export const createScale = (
  anchor: OklchColor,
  config?: { neutral?: boolean; chromaBias?: number; lOffset?: number },
): ColorScale => {
  const direction = hueDirection(anchor.h);
  const neutral = config?.neutral ?? false;
  const chromaBias = config?.chromaBias ?? 1;
  const lOffset = config?.lOffset ?? 0;

  const entries = SCALE_STEPS.map((step) => {
    const lightness = stepToLightness(step) + lOffset;
    const distFromMid = Math.abs(step - 500) / 450;
    const taper = 1 - Math.pow(distFromMid, 0.9);
    const baseChroma = neutral ? 0.012 : anchor.c * 0.16;
    const chroma = neutral
      ? Math.max(0.008, baseChroma + anchor.c * 0.07 * taper)
      : anchor.c * (0.32 + taper * 0.78) * chromaBias;

    const shift = SHIFT_PROFILE[step] * direction * (neutral ? 0.22 : 1);
    const hue = wrapHue(anchor.h + shift);

    return [
      step,
      oklchToHex(
        oklch(
          lightness,
          chroma,
          hue,
        ),
      ),
    ] as const;
  });

  return Object.fromEntries(entries) as ColorScale;
};
