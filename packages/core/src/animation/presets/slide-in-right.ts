import { registerPreset } from './registry.ts';

// Distance-based preset: slides in by a fluid space token, not a fixed px value
// (docs/features/core/animation.md §4).
registerPreset('slideInRight', () => [
  { opacity: 0, transform: 'translateX(var(--bx-space-xl))' },
  { opacity: 1, transform: 'translateX(0)' },
]);
