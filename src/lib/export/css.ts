import type { PaletteResult } from '../../types/palette';
import { flattenObject } from './serialize';

export const toCssVariablesExport = (palette: PaletteResult) => {
  const rows = [
    ...flattenObject(palette.global as unknown as Record<string, unknown>, 'global'),
    ...flattenObject(palette.semantic as unknown as Record<string, unknown>, 'semantic'),
    ...flattenObject(palette.alias as unknown as Record<string, unknown>, 'alias'),
    ...flattenObject(palette.component as unknown as Record<string, unknown>, 'component'),
  ];
  return `:root {\n${rows
    .map((row) => `  --${row.key.replaceAll('.', '-')}: ${row.value};`)
    .join('\n')}\n}`;
};
