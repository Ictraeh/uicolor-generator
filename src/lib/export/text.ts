import type { PaletteResult } from '../../types/palette';
import { flattenObject } from './serialize';

export const toTextExport = (palette: PaletteResult) => {
  const rows = [
    ...flattenObject(palette.global as unknown as Record<string, unknown>, 'global'),
    ...flattenObject(palette.semantic as unknown as Record<string, unknown>, 'semantic'),
    ...flattenObject(palette.alias as unknown as Record<string, unknown>, 'alias'),
    ...flattenObject(palette.component as unknown as Record<string, unknown>, 'component'),
  ];

  return [
    'COLOR SHUFFLE EXPORT',
    `Generated: ${palette.meta.timestamp}`,
    `Source: ${palette.meta.source}${palette.meta.seedHex ? ` (${palette.meta.seedHex})` : ''}`,
    `Mode: ${palette.meta.themeMode}`,
    `Strategy: ${palette.meta.strategy}`,
    `Corrected: ${palette.meta.corrected ? 'yes' : 'no'}`,
    '',
    'KEY COLORS',
    `primary = ${palette.keyColors.primary}`,
    `secondary = ${palette.keyColors.secondary}`,
    `tertiary = ${palette.keyColors.tertiary}`,
    '',
    'TOKENS',
    ...rows.map((row) => `${row.key} = ${row.value}`),
    '',
    'ACCESSIBILITY',
    ...palette.accessibility.map(
      (item) =>
        `${item.label} -> WCAG ${item.wcag} (${item.passNormal ? 'pass' : 'fail'}), APCA ${item.apca} (${item.passAPCA ? 'pass' : 'warn'})`,
    ),
    '',
    'NOTES',
    ...(palette.warnings.length ? palette.warnings : ['No major warnings.']),
  ].join('\n');
};
