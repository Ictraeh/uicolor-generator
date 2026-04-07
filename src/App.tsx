import { useMemo, useState } from 'react';
import { PaletteSwatch } from './components/PaletteSwatch';
import { TokenTable } from './components/TokenTable';
import { generatePalette } from './lib/color/generatePalette';
import { normalizeHex } from './lib/color/utils';
import { toCssVariablesExport } from './lib/export/css';
import { toMarkdownExport } from './lib/export/markdown';
import { flattenObject } from './lib/export/serialize';
import { toTextExport } from './lib/export/text';
import type { PaletteResult, StrategyName, ThemeMode } from './types/palette';

type TokenTab = 'global' | 'semantic' | 'alias' | 'component';
type StrategyChoice = StrategyName | 'auto';
type ExportFormat = 'md' | 'txt' | 'json' | 'css';

const initialPalette = generatePalette({
  source: 'random',
  themeMode: 'light',
  creativity: 0.62,
  strictAccessibility: false,
});

const tokenRowsFor = (palette: PaletteResult, tab: TokenTab) => {
  if (tab === 'global') return flattenObject(palette.global as unknown as Record<string, unknown>, 'global');
  if (tab === 'semantic') return flattenObject(palette.semantic as unknown as Record<string, unknown>, 'semantic');
  if (tab === 'alias') return flattenObject(palette.alias as unknown as Record<string, unknown>, 'alias');
  return flattenObject(palette.component as unknown as Record<string, unknown>, 'component');
};

function App() {
  const [palette, setPalette] = useState<PaletteResult>(initialPalette);
  const [seedInput, setSeedInput] = useState('#7A5CFF');
  const [seedError, setSeedError] = useState('');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [tab, setTab] = useState<TokenTab>('global');
  const [strategy, setStrategy] = useState<StrategyChoice>('auto');
  const [creativity, setCreativity] = useState(62);
  const [strictA11y, setStrictA11y] = useState(false);
  const [lockAccent, setLockAccent] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('md');

  const tokenRows = useMemo(() => tokenRowsFor(palette, tab), [palette, tab]);
  const swatches = useMemo(() => tokenRows.slice(0, 24), [tokenRows]);

  const regenerate = (source: 'random' | 'seed') => {
    const normalized = normalizeHex(seedInput);
    if (source === 'seed' && !normalized) {
      setSeedError('Use a valid hex like #7A5CFF');
      return;
    }
    setSeedError('');

    const generated = generatePalette({
      source,
      seedHex:
        source === 'seed'
          ? normalized ?? undefined
          : lockAccent
            ? palette.keyColors.primary
            : undefined,
      themeMode,
      requestedStrategy: strategy === 'auto' ? undefined : strategy,
      creativity: creativity / 100,
      strictAccessibility: strictA11y,
    });
    setPalette(generated);
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
    setPalette((prev) =>
      generatePalette({
        source: prev.meta.source,
        seedHex: prev.meta.seedHex ?? prev.keyColors.primary,
        themeMode: nextMode,
        requestedStrategy: prev.meta.strategy,
        creativity: prev.meta.creativity,
        strictAccessibility: strictA11y,
      }),
    );
  };

  const downloadFile = (filename: string, content: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadByFormat = () => {
    if (exportFormat === 'md') {
      downloadFile('palette.md', toMarkdownExport(palette), 'text/markdown');
      return;
    }
    if (exportFormat === 'txt') {
      downloadFile('palette.txt', toTextExport(palette));
      return;
    }
    if (exportFormat === 'json') {
      downloadFile('palette.json', JSON.stringify(palette, null, 2), 'application/json');
      return;
    }
    downloadFile('palette.css', toCssVariablesExport(palette), 'text/css');
  };

  const copyAllTokens = async () => {
    const text = tokenRows.map((row) => `${row.key}: ${row.value}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op
    }
  };

  return (
    <main className="app-shell" style={{ background: palette.alias.bg.canvas, color: palette.alias.content.primary }}>
      <header className="top-panel">
        <div>
          <p className="eyebrow">Chaos Palette Lab</p>
          <h1>Frontend Palette Playground</h1>
          <p className="subhead">
            Bold, playful palettes mapped to production-ready tokens with accessibility-aware correction.
          </p>
        </div>
        <div className="control-layout">
          <div className="top-actions">
            <div className="icon-actions">
              <button
                type="button"
                className="icon-square"
                title="Shuffle palette"
                aria-label="Shuffle palette"
                onClick={() => regenerate('random')}
              >
                🎲
              </button>
              <button
                type="button"
                className="icon-square"
                title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                aria-label={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                onClick={toggleTheme}
              >
                {themeMode === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
            <div className="export-inline">
              <select
                className="compact-control"
                value={exportFormat}
                onChange={(event) => setExportFormat(event.target.value as ExportFormat)}
              >
                <option value="md">Markdown (.md)</option>
                <option value="txt">Text (.txt)</option>
                <option value="json">JSON (.json)</option>
                <option value="css">CSS variables (.css)</option>
              </select>
              <button type="button" className="control-btn compact-control" onClick={downloadByFormat}>
                Download
              </button>
            </div>
          </div>
          <div className="control-mid-row">
            <div className="seed-row">
              <input
                type="text"
                value={seedInput}
                onChange={(event) => setSeedInput(event.target.value)}
                placeholder="Enter your color"
              />
              <button type="button" className="control-btn" onClick={() => regenerate('seed')}>
                Generate colors
              </button>
            </div>
            <select
              className="harmony-control"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as StrategyChoice)}
            >
              <option value="auto">Harmoney</option>
              <option value="analogous">Analogous</option>
              <option value="splitComplementary">Split complementary</option>
              <option value="triadic">Triadic</option>
              <option value="monochromeContrast">Monochrome + contrast</option>
              <option value="warmCoolTension">Warm/cool tension</option>
              <option value="vividMuted">Vivid + muted</option>
            </select>
          </div>
          <div className="options-row">
            <label className="toggle plain-toggle">
              <input
                type="checkbox"
                checked={lockAccent}
                onChange={(event) => setLockAccent(event.target.checked)}
              />
              Lock accent family
            </label>
            <label className="toggle plain-toggle">
              <input
                type="checkbox"
                checked={strictA11y}
                onChange={(e) => setStrictA11y(e.target.checked)}
              />
              Strict accessibility
            </label>
          </div>
          <label className="control-field creativity-row">
            Creativity {creativity}%
            <input
              type="range"
              min={20}
              max={95}
              value={creativity}
              onChange={(e) => setCreativity(Number(e.target.value))}
            />
          </label>
        </div>
        {seedError ? <p className="error">{seedError}</p> : null}
      </header>

      <section className="key-colors">
        <PaletteSwatch token="key.primary" color={palette.keyColors.primary} />
        <PaletteSwatch token="key.secondary" color={palette.keyColors.secondary} />
        <PaletteSwatch token="key.tertiary" color={palette.keyColors.tertiary} />
      </section>

      <section className="token-panel">
        <div className="token-panel-head">
          <div className="tabs">
            {(['global', 'semantic', 'alias', 'component'] as TokenTab[]).map((item) => (
              <button
                key={item}
                type="button"
                className={item === tab ? 'active' : ''}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button type="button" className="copy-all-btn" onClick={copyAllTokens}>
            Copy all
          </button>
        </div>
        <TokenTable rows={tokenRows} />
      </section>

      <section className="swatch-grid">
        {swatches.map((row) => (
          <PaletteSwatch key={row.key} token={row.key} color={row.value} />
        ))}
      </section>

      <section className="a11y-panel">
        <h2>Accessibility checks (WCAG + APCA)</h2>
        <div className="a11y-grid">
          {palette.accessibility.map((item) => (
            <article key={item.label} className="a11y-card">
              <p>{item.label}</p>
              <p>WCAG: {item.wcag} ({item.passNormal ? 'pass' : 'fail'})</p>
              <p>APCA: {item.apca} ({item.passAPCA ? 'pass' : 'warn'})</p>
            </article>
          ))}
        </div>
        {palette.warnings.length ? (
          <ul className="warnings">
            {palette.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

    </main>
  );
}

export default App;
