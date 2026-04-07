import type { PaletteResult, StrategyName, ThemeMode } from '../../types/palette';
import { analyzeAccessibility, colorBlindnessWarnings } from './accessibility';
import { buildKeyColors } from './harmony';
import {
  pickCuratedCombinationForSeed,
  pickRandomCuratedCombination,
} from './paletteLibrary';
import { createScale } from './scale';
import { mapAlias, mapComponents, mapSemantic } from './tokens';
import {
  blendOklch,
  hexToOklch,
  oklch,
  oklchToHex,
  type OklchColor,
  wrapHue,
} from './utils';

interface GenerateOptions {
  source: 'random' | 'seed';
  seedHex?: string;
  themeMode: ThemeMode;
  requestedStrategy?: StrategyName;
  creativity: number;
  strictAccessibility: boolean;
}

const randomSeed = (): OklchColor => {
  const hue = Math.random() * 360;
  const chroma = 0.16 + Math.random() * 0.18;
  const lightness = 0.58 + (Math.random() - 0.5) * 0.1;
  return oklch(lightness, chroma, hue);
};

const pickMostVivid = (colors: OklchColor[]) =>
  [...colors].sort((a, b) => b.c - a.c)[0];

const pickFarthestHue = (base: OklchColor, colors: OklchColor[]) =>
  [...colors].sort((a, b) => {
    const da = Math.min(Math.abs(base.h - a.h), 360 - Math.abs(base.h - a.h));
    const db = Math.min(Math.abs(base.h - b.h), 360 - Math.abs(base.h - b.h));
    return db - da;
  })[0];

const nudgeHue = (source: OklchColor, targetHue: number, amount = 0.35) => {
  const delta = ((targetHue - source.h + 540) % 360) - 180;
  return oklch(source.l, source.c, wrapHue(source.h + delta * amount));
};

const hueDistance = (a: number, b: number) => {
  const delta = Math.abs(a - b);
  return Math.min(delta, 360 - delta);
};

const isNearSameColor = (a: OklchColor, b: OklchColor) =>
  Math.abs(a.l - b.l) < 0.018 && Math.abs(a.c - b.c) < 0.018 && hueDistance(a.h, b.h) < 8;

const enforceDistinctTertiary = (primary: OklchColor, secondary: OklchColor, tertiary: OklchColor) => {
  let next = tertiary;
  for (let i = 0; i < 7; i += 1) {
    if (!isNearSameColor(next, primary) && !isNearSameColor(next, secondary)) {
      return next;
    }
    const direction = i % 2 === 0 ? 1 : -1;
    next = oklch(
      next.l + direction * 0.02,
      next.c * (1.05 + i * 0.03),
      wrapHue(next.h + 24 + i * 13),
    );
  }
  return oklch(primary.l - 0.04, Math.max(primary.c * 0.86, 0.085), wrapHue(primary.h + 142));
};

const resolveDistinctKeyHexes = (primary: OklchColor, secondary: OklchColor, tertiary: OklchColor) => {
  const primaryHex = oklchToHex(primary);
  const secondaryHex = oklchToHex(secondary);
  let tertiaryColor = tertiary;
  let tertiaryHex = oklchToHex(tertiaryColor);

  for (let i = 0; i < 6 && (tertiaryHex === primaryHex || tertiaryHex === secondaryHex); i += 1) {
    tertiaryColor = oklch(
      tertiaryColor.l + (i % 2 === 0 ? 0.018 : -0.018),
      tertiaryColor.c * (1.07 + i * 0.02),
      wrapHue(tertiaryColor.h + 22 + i * 9),
    );
    tertiaryHex = oklchToHex(tertiaryColor);
  }

  if (tertiaryHex === primaryHex || tertiaryHex === secondaryHex) {
    tertiaryColor = oklch(primary.l - 0.05, Math.max(primary.c * 0.78, 0.09), wrapHue(primary.h + 148));
    tertiaryHex = oklchToHex(tertiaryColor);
  }

  return { primaryHex, secondaryHex, tertiaryHex, tertiaryColor };
};

const sampleFamilyAnchor = (
  k1: OklchColor,
  k2: OklchColor,
  k3: OklchColor,
  profile: { w1: number; w2: number; w3: number; lBias?: number; cBias?: number },
) => {
  const mixed = blendOklch(k1, k2, k3, profile.w1, profile.w2, profile.w3);
  return oklch(
    mixed.l + (profile.lBias ?? 0),
    mixed.c * (profile.cBias ?? 1),
    mixed.h,
  );
};

export const generatePalette = (options: GenerateOptions): PaletteResult => {
  const seed = options.seedHex ? hexToOklch(options.seedHex) : null;
  const effectiveSeed = seed ?? randomSeed();
  const curated = options.seedHex
    ? pickCuratedCombinationForSeed(options.seedHex)
    : pickRandomCuratedCombination();

  const curatedAnchors = curated.hexes
    .map((hex) => hexToOklch(hex))
    .filter((color): color is OklchColor => Boolean(color));

  const proceduralKeys = buildKeyColors(
    effectiveSeed,
    options.requestedStrategy,
    options.creativity,
  );
  const primaryKey = curatedAnchors.length
    ? (seed ?? pickMostVivid(curatedAnchors))
    : proceduralKeys.primary;
  const secondaryKey = curatedAnchors.length
    ? (pickFarthestHue(primaryKey, curatedAnchors.filter((c) => c !== primaryKey)) ?? proceduralKeys.secondary)
    : proceduralKeys.secondary;
  const tertiaryKey = curatedAnchors.length >= 3
    ? [...curatedAnchors]
        .sort((a, b) => Math.abs(a.l - 0.55) - Math.abs(b.l - 0.55))[1]
    : proceduralKeys.tertiary;

  const keys = {
    strategy: options.requestedStrategy ?? proceduralKeys.strategy,
    primary: primaryKey ?? proceduralKeys.primary,
    secondary: secondaryKey ?? proceduralKeys.secondary,
    tertiary: enforceDistinctTertiary(
      primaryKey ?? proceduralKeys.primary,
      secondaryKey ?? proceduralKeys.secondary,
      tertiaryKey ?? proceduralKeys.tertiary,
    ),
  };
  const resolvedKeyHexes = resolveDistinctKeyHexes(keys.primary, keys.secondary, keys.tertiary);
  keys.tertiary = resolvedKeyHexes.tertiaryColor;

  const accentAnchor = sampleFamilyAnchor(keys.primary, keys.secondary, keys.tertiary, {
    w1: 0.72,
    w2: 0.18,
    w3: 0.1,
    cBias: 1.15,
  });

  const infoAnchor = sampleFamilyAnchor(keys.primary, keys.secondary, keys.tertiary, {
    w1: 0.2,
    w2: 0.65,
    w3: 0.15,
    cBias: 1,
  });

  const infoCohesive = nudgeHue(infoAnchor, 235, 0.26);
  const positiveAnchor = nudgeHue(
    sampleFamilyAnchor(keys.primary, keys.secondary, keys.tertiary, {
      w1: 0.18,
      w2: 0.25,
      w3: 0.57,
      lBias: 0.02,
      cBias: 0.95,
    }),
    145,
    0.34,
  );
  const noticeAnchor = nudgeHue(
    oklch(accentAnchor.l + 0.03, accentAnchor.c * 0.9, accentAnchor.h + 40),
    82,
    0.38,
  );
  const negativeAnchor = nudgeHue(
    oklch(accentAnchor.l - 0.02, accentAnchor.c * 0.96, accentAnchor.h - 60),
    24,
    0.36,
  );
  const neutralAnchor = oklch(
    options.themeMode === 'dark' ? 0.52 : 0.64,
    0.018 + options.creativity * 0.012,
    keys.primary.h + 10,
  );

  const global = {
    neutral: createScale(neutralAnchor, { neutral: true }),
    accent: createScale(accentAnchor, { chromaBias: 1.04 }),
    info: createScale(infoCohesive, { chromaBias: 0.96 }),
    positive: createScale(positiveAnchor, { chromaBias: 0.9 }),
    notice: createScale(noticeAnchor, { chromaBias: 0.95 }),
    negative: createScale(negativeAnchor, { chromaBias: 0.9 }),
    alpha: {
      white: { 5: 'rgba(255,255,255,0.05)', 10: 'rgba(255,255,255,0.10)', 20: 'rgba(255,255,255,0.20)' },
      black: { 5: 'rgba(10,13,17,0.05)', 10: 'rgba(10,13,17,0.10)', 20: 'rgba(10,13,17,0.20)' },
    },
  };

  const semantic = mapSemantic(global, options.themeMode);
  const alias = mapAlias(global, semantic, options.themeMode);
  const component = mapComponents(alias, semantic, options.themeMode);

  const result: PaletteResult = {
    meta: {
      source: options.source,
      seedHex: options.seedHex,
      themeMode: options.themeMode,
      strategy: keys.strategy as StrategyName,
      creativity: options.creativity,
      strictAccessibility: options.strictAccessibility,
      corrected: false,
      timestamp: new Date().toISOString(),
    },
    keyColors: {
      primary: resolvedKeyHexes.primaryHex,
      secondary: resolvedKeyHexes.secondaryHex,
      tertiary: resolvedKeyHexes.tertiaryHex,
    },
    global,
    semantic,
    alias,
    component,
    accessibility: [],
    warnings: [],
  };

  result.accessibility = analyzeAccessibility(result);
  result.warnings = [
    ...(curated.source === 'wada'
      ? ['Palette source: adapted from Sanzo Wada combination data for cohesive vintage harmony.']
      : ['Palette source: Chinese-inspired curated combinations blended for contemporary UI contrast.']),
    ...colorBlindnessWarnings(result),
  ];
  return result;
};
