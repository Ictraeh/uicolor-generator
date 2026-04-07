# Chaos Palette Lab - UI Color Generator

Interactive palette playground for generating bold, production-ready UI color tokens with accessibility-aware checks.

Repository: [Ictraeh/uicolor-generator](https://github.com/Ictraeh/uicolor-generator)

## Features

- Generate palettes from random or seed color input.
- Toggle light/dark mode quickly.
- Tune harmony strategy and creativity level.
- Lock accent family and strict accessibility options.
- View key colors and full token tables (`global`, `semantic`, `alias`, `component`).
- Copy all visible tokens in one click.
- Export as Markdown, text, JSON, or CSS variables.

## Tech Stack

- React
- TypeScript
- Vite

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

### 3) Build for production

```bash
npm run build
```

### 4) Preview production build locally

```bash
npm run preview
```

## Project Structure

```text
src/
  components/        # UI components (swatches, token table, previews)
  lib/color/         # Palette generation, harmony, accessibility, token mapping
  lib/export/        # Export format builders (md/txt/json/css)
  types/             # Shared TypeScript types
```

## Usage Notes

- Enter a hex color like `#7A5CFF` to generate from seed.
- `Copy all` in the token panel copies current tab token/value pairs.
- Key colors are responsive and auto-layout across screen sizes.
- Tertiary key color is guarded to avoid matching primary/secondary.

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Type-check and build
- `npm run preview` - Preview production build
- `npm run lint` - Run lint checks

## License

MIT (add or update as needed).
