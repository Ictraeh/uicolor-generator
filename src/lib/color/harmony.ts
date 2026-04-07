import type { StrategyName } from '../../types/palette';
import { oklch, type OklchColor, wrapHue } from './utils';

export interface HarmonyKeyColors {
  strategy: StrategyName;
  primary: OklchColor;
  secondary: OklchColor;
  tertiary: OklchColor;
}

const STRATEGY_WEIGHTS: Array<{ strategy: StrategyName; weight: number }> = [
  { strategy: 'analogous', weight: 1.35 },
  { strategy: 'splitComplementary', weight: 1.2 },
  { strategy: 'triadic', weight: 0.95 },
  { strategy: 'monochromeContrast', weight: 1.05 },
  { strategy: 'warmCoolTension', weight: 0.85 },
  { strategy: 'vividMuted', weight: 1.1 },
];

export const pickWeightedStrategy = (): StrategyName => {
  const total = STRATEGY_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of STRATEGY_WEIGHTS) {
    roll -= item.weight;
    if (roll <= 0) return item.strategy;
  }
  return 'analogous';
};

const hueOffsetByStrategy = (strategy: StrategyName): [number, number] => {
  switch (strategy) {
    case 'analogous':
      return [18, -22];
    case 'splitComplementary':
      return [155, -155];
    case 'triadic':
      return [120, -120];
    case 'monochromeContrast':
      return [10, 190];
    case 'warmCoolTension':
      return [45, -150];
    case 'vividMuted':
      return [28, -88];
    default:
      return [20, -20];
  }
};

export const buildKeyColors = (
  seed: OklchColor,
  requestedStrategy?: StrategyName,
  creativity = 0.55,
): HarmonyKeyColors => {
  const strategy = requestedStrategy ?? pickWeightedStrategy();
  const [offsetA, offsetB] = hueOffsetByStrategy(strategy);
  const variance = 10 + creativity * 24;
  const jitterA = (Math.random() - 0.5) * variance;
  const jitterB = (Math.random() - 0.5) * variance;

  const secondaryHue = wrapHue(seed.h + offsetA + jitterA);
  const tertiaryHue = wrapHue(seed.h + offsetB + jitterB);

  const secondaryChromaBase = seed.c * (0.8 + creativity * 0.35);
  const tertiaryChromaBase = seed.c * (0.68 + creativity * 0.25);

  const secondary = oklch(
    seed.l + (Math.random() - 0.5) * 0.08,
    secondaryChromaBase + 0.02,
    secondaryHue,
  );
  const tertiary = oklch(
    seed.l + (Math.random() - 0.5) * 0.1,
    tertiaryChromaBase + 0.01,
    tertiaryHue,
  );

  return {
    strategy,
    primary: seed,
    secondary,
    tertiary,
  };
};
