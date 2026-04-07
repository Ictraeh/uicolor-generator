import type { PaletteResult } from '../../types/palette';

export const flattenObject = (
  value: Record<string, unknown>,
  prefix = '',
): Array<{ key: string; value: string }> => {
  const rows: Array<{ key: string; value: string }> = [];
  for (const [key, val] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'string') {
      rows.push({ key: path, value: val });
      continue;
    }
    if (val && typeof val === 'object') {
      rows.push(...flattenObject(val as Record<string, unknown>, path));
    }
  }
  return rows;
};

export const paletteSummary = (palette: PaletteResult) => ({
  meta: palette.meta,
  keyColors: palette.keyColors,
  global: palette.global,
  semantic: palette.semantic,
  alias: palette.alias,
  component: palette.component,
  accessibility: palette.accessibility,
  warnings: palette.warnings,
});
