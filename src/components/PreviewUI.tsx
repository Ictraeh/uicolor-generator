import type { PaletteResult } from '../types/palette';

interface PreviewUIProps {
  palette: PaletteResult;
}

export function PreviewUI({ palette }: PreviewUIProps) {
  const { alias, component, semantic } = palette;

  return (
    <section className="preview-shell" style={{ background: alias.bg.canvas, color: alias.content.primary }}>
      <nav
        className="preview-navbar"
        style={{ background: component.navbar.bg, borderColor: component.navbar.border }}
      >
        <div className="preview-brand" style={{ color: component.navbar.text }}>
          <span className="preview-brand-dot" style={{ background: semantic.accent.default }} />
          Color Shuffle
        </div>
        <div className="preview-links">
          <a href="#" style={{ color: alias.content.link }}>
            Product
          </a>
          <a href="#" style={{ color: alias.content.secondary }}>
            Docs
          </a>
          <a href="#" style={{ color: alias.content.secondary }}>
            Pricing
          </a>
        </div>
      </nav>

      <header
        className="preview-hero-clean"
        style={{ background: alias.bg.surface, borderColor: alias.border.subtle }}
      >
        <div className="preview-hero-copy">
          <div className="preview-tags">
            <span style={{ background: component.badge.info.bg, color: component.badge.info.text }}>
              Design System
            </span>
            <span style={{ background: component.badge.positive.bg, color: component.badge.positive.text }}>
              Accessible
            </span>
            <span style={{ background: component.badge.notice.bg, color: component.badge.notice.text }}>
              Live Tokens
            </span>
          </div>
          <h3>Build cleaner interfaces with cohesive colors</h3>
          <p style={{ color: alias.content.secondary }}>
            This preview mimics a modern landing page hero so you can quickly judge hierarchy,
            contrast, and UI clarity before exporting your tokens.
          </p>
          <div className="preview-hero-actions">
            <button
              type="button"
              style={{
                background: component.button.primary.bg,
                color: component.button.primary.text,
                borderColor: component.button.primary.border,
              }}
            >
              Start building
            </button>
            <button
              type="button"
              style={{
                background: component.button.secondary.bg,
                color: component.button.secondary.text,
                borderColor: component.button.secondary.border,
              }}
            >
              View docs
            </button>
          </div>
        </div>

        <aside
          className="preview-hero-panel"
          style={{ background: component.card.bg, borderColor: component.card.border }}
        >
          <h4>Theme quick stats</h4>
          <p style={{ color: alias.content.secondary }}>Token coverage and readability</p>
          <ul>
            <li>
              <span>Token groups</span>
              <strong>4 layers</strong>
            </li>
            <li>
              <span>Primary contrast</span>
              <strong>{palette.accessibility[0]?.wcag.toFixed(2)} WCAG</strong>
            </li>
            <li>
              <span>Mode</span>
              <strong>{palette.meta.themeMode}</strong>
            </li>
          </ul>
          <div
            className="preview-hero-chip"
            style={{ background: semantic.accent.subtle, color: semantic.accent.content }}
          >
            Accent: {semantic.accent.default}
          </div>
        </aside>
      </header>

      <section className="preview-strip">
        <article className="preview-strip-card" style={{ background: component.card.bg, borderColor: component.card.border }}>
          <p style={{ color: alias.content.secondary }}>Header text</p>
          <h4 style={{ color: alias.content.primary }}>Confident hierarchy</h4>
        </article>
        <article className="preview-strip-card" style={{ background: component.card.bg, borderColor: component.card.border }}>
          <p style={{ color: alias.content.secondary }}>Subtitle</p>
          <h4 style={{ color: alias.content.primary }}>Readable supporting copy</h4>
        </article>
        <article className="preview-strip-card" style={{ background: component.card.bg, borderColor: component.card.border }}>
          <p style={{ color: alias.content.secondary }}>CTA + tags</p>
          <h4 style={{ color: alias.content.primary }}>Balanced visual weight</h4>
        </article>
      </section>

      <section className="preview-alerts">
        <div
          className="preview-alert"
          style={{
            background: component.alert.info.bg,
            borderColor: component.alert.info.border,
            color: component.alert.info.text,
          }}
        >
          Info tone is clear and non-invasive.
        </div>
        <div
          className="preview-alert"
          style={{
            background: component.alert.notice.bg,
            borderColor: component.alert.notice.border,
            color: component.alert.notice.text,
          }}
        >
          Notice color stands out without overpowering.
        </div>
      </section>
      <section className="preview-cta-mini" style={{ background: alias.bg.surface, borderColor: alias.border.subtle }}>
        <p style={{ color: alias.content.secondary }}>Need to publish quickly?</p>
          <button
            type="button"
            style={{
              background: component.button.primary.bg,
              color: component.button.primary.text,
              borderColor: component.button.primary.border,
            }}
          >
          Export this palette
          </button>
      </section>
    </section>
  );
}
