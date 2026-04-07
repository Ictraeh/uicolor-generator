import { hexToOklch } from './utils';
import wadaData from 'dictionary-of-colour-combinations';

export interface CuratedCombination {
  id: string;
  source: 'wada' | 'chinese-inspired';
  hexes: string[];
}

const wadaCombinationMap = new Map<number, string[]>();
for (const color of wadaData) {
  for (const combinationId of color.combinations) {
    const existing = wadaCombinationMap.get(combinationId) ?? [];
    existing.push(color.hex.toUpperCase());
    wadaCombinationMap.set(combinationId, existing);
  }
}

const wadaCombinations: CuratedCombination[] = [...wadaCombinationMap.entries()]
  .filter(([, hexes]) => hexes.length >= 3)
  .map(([id, hexes]) => ({
    id: `wada-${id}`,
    source: 'wada',
    hexes: hexes.slice(0, 4),
  }));

const chineseInspiredCombinations: CuratedCombination[] = [
  { id: 'cn-jade-ink', source: 'chinese-inspired', hexes: ['#5E7A63', '#A9C89B', '#F2E4C8', '#1C2B2D'] },
  { id: 'cn-vermillion-porcelain', source: 'chinese-inspired', hexes: ['#CF3C36', '#F2D2A2', '#2F5C8A', '#F4F1E8'] },
  { id: 'cn-plum-mist', source: 'chinese-inspired', hexes: ['#6B4E71', '#B693C0', '#E8D8ED', '#2A2B39'] },
  { id: 'cn-tea-lacquer', source: 'chinese-inspired', hexes: ['#7F5A3B', '#D0B287', '#3A2A24', '#EEE0CB'] },
  { id: 'cn-azure-gold', source: 'chinese-inspired', hexes: ['#2B5F8D', '#7DA9CF', '#EBC269', '#1F2A36'] },
  { id: 'cn-pine-cinnabar', source: 'chinese-inspired', hexes: ['#2D5D56', '#5E8E74', '#B83B30', '#F0E2CC'] },
  { id: 'cn-lotus-iris', source: 'chinese-inspired', hexes: ['#D88BAA', '#F1CADB', '#5D6BAE', '#2E3450'] },
  { id: 'cn-charcoal-ochre', source: 'chinese-inspired', hexes: ['#D08A33', '#E9CFA8', '#3A3C42', '#17181B'] },
];

export const curatedCombinations: CuratedCombination[] = [
  ...wadaCombinations,
  ...chineseInspiredCombinations,
];

const contrastSpread = (hexes: string[]) => {
  const lightnessValues = hexes
    .map((hex) => hexToOklch(hex)?.l ?? 0.5)
    .sort((a, b) => a - b);
  return lightnessValues[lightnessValues.length - 1] - lightnessValues[0];
};

export const pickRandomCuratedCombination = () => {
  // Prefer combinations that have enough tonal contrast for UI role mapping.
  const scored = curatedCombinations.map((combo) => ({
    combo,
    score: 0.55 + contrastSpread(combo.hexes) * 1.1 + Math.random() * 0.7,
  }));
  scored.sort((a, b) => b.score - a.score);
  const window = scored.slice(0, Math.max(24, Math.floor(scored.length * 0.22)));
  return window[Math.floor(Math.random() * window.length)].combo;
};

const colorDistance = (aHex: string, bHex: string) => {
  const a = hexToOklch(aHex);
  const b = hexToOklch(bHex);
  if (!a || !b) return 10;
  const hueDistance = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 180;
  const chromaDistance = Math.abs(a.c - b.c) * 2.1;
  const lightnessDistance = Math.abs(a.l - b.l) * 1.9;
  return hueDistance + chromaDistance + lightnessDistance;
};

export const pickCuratedCombinationForSeed = (seedHex: string) => {
  let best = curatedCombinations[0];
  let bestScore = Number.POSITIVE_INFINITY;
  for (const combo of curatedCombinations) {
    const distances = combo.hexes.map((hex) => colorDistance(seedHex, hex));
    const nearest = Math.min(...distances);
    if (nearest < bestScore) {
      bestScore = nearest;
      best = combo;
    }
  }
  return best;
};
