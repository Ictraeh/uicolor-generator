declare module 'culori' {
  export function parse(value: string): unknown;
  export function converter(mode: string): (value: unknown) => Record<string, number> | null;
  export function formatHex(color: unknown): string;
}

declare module 'apca-w3' {
  export function APCAcontrast(txtY: number, bgY: number): number;
  export function sRGBtoY(rgb: [number, number, number]): number;
}

declare module 'dictionary-of-colour-combinations' {
  interface DictionaryColor {
    name: string;
    combinations: number[];
    swatch: number;
    cmyk: [number, number, number, number];
    lab: [number, number, number];
    rgb: [number, number, number];
    hex: string;
  }
  const colors: DictionaryColor[];
  export default colors;
}
