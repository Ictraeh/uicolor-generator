import { useMemo } from 'react';
import { apcaScore, wcagContrast } from '../lib/color/accessibility';
import {
  hexToHslString,
  hexToRgbTuple,
  pickReadableText,
  rgbTupleToString,
} from '../lib/color/utils';

interface PaletteSwatchProps {
  token: string;
  color: string;
}

export function PaletteSwatch({ token, color }: PaletteSwatchProps) {
  const textColor = pickReadableText(color);
  const rgb = useMemo(() => hexToRgbTuple(color), [color]);
  const wcagOnWhite = useMemo(() => wcagContrast(color, '#FFFFFF'), [color]);
  const wcagOnBlack = useMemo(() => wcagContrast(color, '#000000'), [color]);
  const apcaOnWhite = useMemo(() => apcaScore(color, '#FFFFFF'), [color]);
  const apcaOnBlack = useMemo(() => apcaScore(color, '#000000'), [color]);

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Ignore clipboard errors in restricted contexts.
    }
  };

  return (
    <article className="swatch-card">
      <div className="swatch-preview" style={{ backgroundColor: color, color: textColor }}>
        <span>{token}</span>
      </div>
      <div className="swatch-meta">
        <p className="token-label">{token}</p>
        <p>{color}</p>
        <p>{rgbTupleToString(rgb)}</p>
        <p>{hexToHslString(color)}</p>
        <p>
          WCAG (on white / black): {wcagOnWhite.toFixed(2)} / {wcagOnBlack.toFixed(2)}
        </p>
        <p>
          APCA (on white / black): {apcaOnWhite} / {apcaOnBlack}
        </p>
        <p className="pass-chip">
          {wcagOnWhite >= 3 || wcagOnBlack >= 3 ? 'Usable text option available' : 'Check contrast'}
        </p>
      </div>
      <div className="swatch-actions">
        <button type="button" onClick={() => copyValue(color)}>
          Copy hex
        </button>
        <button type="button" onClick={() => copyValue(`${token}: ${color}`)}>
          Copy token
        </button>
      </div>
    </article>
  );
}
