/**
 * Lucide icons the site uses (https://lucide.dev, ISC). The list is the single source of truth:
 * scripts/icons.ts bundles exactly these SVGs, and tests/site.test.ts fails if a page references
 * a Lucide icon that is not listed here or listed here without being bundled.
 */
export const iconNames = [
  'accessibility',
  'arrow-right',
  'blocks',
  'book-open',
  'bell',
  'chart-column',
  'check',
  'code-xml',
  'command',
  'compass',
  'copy',
  'database',
  'external-link',
  'gauge',
  'git-branch',
  'image',
  'layers',
  'layout-dashboard',
  'moon',
  'mouse-pointer-click',
  'palette',
  'panels-top-left',
  'rocket',
  'rows-3',
  'ruler',
  'search',
  'shield-check',
  'sparkles',
  'sun',
  'terminal',
  'text-cursor-input',
  'wrench',
  'zap',
] as const;
export type IconName = (typeof iconNames)[number];

/** Category icons shown on the landing page, component index and docs sidebar. */
export const categoryIcons: Record<string, IconName> = {
  Actions: 'mouse-pointer-click',
  Form: 'text-cursor-input',
  Feedback: 'bell',
  Display: 'layout-dashboard',
  Overlays: 'layers',
  Navigation: 'compass',
  Organization: 'panels-top-left',
  Imagery: 'image',
  Charts: 'chart-column',
  Data: 'database',
  Utilities: 'wrench',
};
