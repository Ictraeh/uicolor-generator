import type {
  AliasPalette,
  ComponentPalette,
  GlobalPalette,
  SemanticPalette,
  ThemeMode,
} from '../../types/palette';

export const mapSemantic = (global: GlobalPalette, mode: ThemeMode): SemanticPalette => {
  const isDark = mode === 'dark';
  return {
    accent: {
      default: isDark ? global.accent[400] : global.accent[600],
      subtle: isDark ? global.accent[900] : global.accent[100],
      hover: isDark ? global.accent[300] : global.accent[700],
      active: isDark ? global.accent[200] : global.accent[800],
      content: isDark ? global.accent[200] : global.accent[700],
    },
    info: {
      default: isDark ? global.info[400] : global.info[600],
      subtle: isDark ? global.info[900] : global.info[100],
      content: isDark ? global.info[200] : global.info[700],
    },
    positive: {
      default: isDark ? global.positive[400] : global.positive[600],
      subtle: isDark ? global.positive[900] : global.positive[100],
      content: isDark ? global.positive[200] : global.positive[700],
    },
    notice: {
      default: isDark ? global.notice[400] : global.notice[600],
      subtle: isDark ? global.notice[900] : global.notice[100],
      content: isDark ? global.notice[200] : global.notice[700],
    },
    negative: {
      default: isDark ? global.negative[400] : global.negative[600],
      subtle: isDark ? global.negative[900] : global.negative[100],
      content: isDark ? global.negative[200] : global.negative[700],
    },
  };
};

export const mapAlias = (
  global: GlobalPalette,
  semantic: SemanticPalette,
  mode: ThemeMode,
): AliasPalette => {
  const isDark = mode === 'dark';

  return {
    bg: {
      canvas: isDark ? global.neutral[950] : global.neutral[50],
      surface: isDark ? global.neutral[900] : '#FFFFFF',
      elevated: isDark ? global.neutral[800] : global.neutral[100],
      subtle: isDark ? global.neutral[800] : global.neutral[200],
    },
    border: {
      default: isDark ? global.neutral[700] : global.neutral[300],
      subtle: isDark ? global.neutral[800] : global.neutral[200],
      strong: isDark ? global.neutral[500] : global.neutral[500],
    },
    content: {
      primary: isDark ? global.neutral[50] : global.neutral[900],
      secondary: isDark ? global.neutral[200] : global.neutral[700],
      tertiary: isDark ? global.neutral[300] : global.neutral[600],
      inverse: isDark ? global.neutral[950] : global.neutral[50],
      link: semantic.accent.default,
    },
    focus: {
      ring: semantic.accent.default,
    },
    overlay: {
      default: isDark ? global.alpha.black[20] : global.alpha.black[10],
    },
    interactive: {
      primary: semantic.accent.default,
      primaryHover: semantic.accent.hover,
      primaryActive: semantic.accent.active,
      secondary: isDark ? global.neutral[800] : global.neutral[100],
      disabled: isDark ? global.neutral[700] : global.neutral[300],
    },
  };
};

export const mapComponents = (
  alias: AliasPalette,
  semantic: SemanticPalette,
  mode: ThemeMode,
): ComponentPalette => {
  const isDark = mode === 'dark';
  return {
    button: {
      primary: {
        bg: alias.interactive.primary,
        text: alias.content.inverse,
        border: alias.interactive.primaryActive,
        hoverBg: alias.interactive.primaryHover,
      },
      secondary: {
        bg: alias.interactive.secondary,
        text: alias.content.primary,
        border: alias.border.default,
        hoverBg: alias.bg.subtle,
      },
    },
    input: {
      bg: alias.bg.surface,
      border: alias.border.default,
      placeholder: alias.content.tertiary,
      text: alias.content.primary,
      focusRing: alias.focus.ring,
    },
    card: {
      bg: alias.bg.surface,
      border: alias.border.subtle,
      text: alias.content.primary,
    },
    badge: {
      info: { bg: semantic.info.subtle, text: semantic.info.content },
      positive: { bg: semantic.positive.subtle, text: semantic.positive.content },
      notice: { bg: semantic.notice.subtle, text: semantic.notice.content },
      negative: { bg: semantic.negative.subtle, text: semantic.negative.content },
    },
    alert: {
      info: { bg: semantic.info.subtle, border: semantic.info.default, text: semantic.info.content },
      positive: {
        bg: semantic.positive.subtle,
        border: semantic.positive.default,
        text: semantic.positive.content,
      },
      notice: {
        bg: semantic.notice.subtle,
        border: semantic.notice.default,
        text: semantic.notice.content,
      },
      negative: {
        bg: semantic.negative.subtle,
        border: semantic.negative.default,
        text: semantic.negative.content,
      },
    },
    tooltip: {
      bg: isDark ? alias.bg.elevated : alias.content.primary,
      text: isDark ? alias.content.primary : alias.content.inverse,
    },
    navbar: {
      bg: alias.bg.surface,
      border: alias.border.subtle,
      text: alias.content.primary,
    },
    modal: {
      bg: alias.bg.elevated,
      border: alias.border.default,
      text: alias.content.primary,
    },
    tag: {
      bg: alias.bg.subtle,
      text: alias.content.secondary,
      border: alias.border.default,
    },
    table: {
      bg: alias.bg.surface,
      headerBg: alias.bg.subtle,
      border: alias.border.subtle,
      text: alias.content.primary,
    },
    tabs: {
      bg: alias.bg.surface,
      activeBg: alias.bg.elevated,
      activeText: alias.content.primary,
      inactiveText: alias.content.secondary,
      border: alias.border.default,
    },
  };
};
