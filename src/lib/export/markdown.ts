import type { PaletteResult } from '../../types/palette';
import { flattenObject } from './serialize';

export const toMarkdownExport = (palette: PaletteResult) => {
  const globalRows = flattenObject(palette.global as unknown as Record<string, unknown>, 'global');
  const semanticRows = flattenObject(palette.semantic as unknown as Record<string, unknown>, 'semantic');
  const aliasRows = flattenObject(palette.alias as unknown as Record<string, unknown>, 'alias');
  const componentRows = flattenObject(
    palette.component as unknown as Record<string, unknown>,
    'component',
  );

  return `# Color Shuffle Palette Export

Generated: ${palette.meta.timestamp}
Source: ${palette.meta.source}${palette.meta.seedHex ? ` (${palette.meta.seedHex})` : ''}
Theme: ${palette.meta.themeMode}
Strategy: ${palette.meta.strategy}
Creativity: ${(palette.meta.creativity * 100).toFixed(0)}%
Accessibility Corrected: ${palette.meta.corrected ? 'Yes' : 'No'}

## Key Colors
- Primary: ${palette.keyColors.primary}
- Secondary: ${palette.keyColors.secondary}
- Tertiary: ${palette.keyColors.tertiary}

## Global Palette
${globalRows.map((row) => `- \`${row.key}\`: \`${row.value}\``).join('\n')}

## Semantic Palette
${semanticRows.map((row) => `- \`${row.key}\`: \`${row.value}\``).join('\n')}

## Alias Tokens
${aliasRows.map((row) => `- \`${row.key}\`: \`${row.value}\``).join('\n')}

## Component Tokens
${componentRows.map((row) => `- \`${row.key}\`: \`${row.value}\``).join('\n')}

## Accessibility Checks
${palette.accessibility
  .map(
    (item) =>
      `- ${item.label}: WCAG ${item.wcag} (${item.passNormal ? 'pass' : 'fail'}), APCA ${item.apca} (${item.passAPCA ? 'pass' : 'warn'})`,
  )
  .join('\n')}

## Accessibility Notes
${palette.warnings.length ? palette.warnings.map((warning) => `- ${warning}`).join('\n') : '- No major risk flags detected.'}

## CSS Variables
\`\`\`css
:root {
${[...globalRows, ...semanticRows, ...aliasRows, ...componentRows]
  .map((row) => `  --${row.key.replaceAll('.', '-')}: ${row.value};`)
  .join('\n')}
}
\`\`\`
`;
};
