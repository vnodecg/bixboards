import { registerPreset } from './registry.ts';

// Distance-based preset: slides in by a fluid space token, not a fixed px value
// (docs/features/core/animation.md §4).
registerPreset('slideInLeft', () => [
  { opacity: 0, transform: 'translateX(calc(var(--bx-space-xl) * -1))' },
  { opacity: 1, transform: 'translateX(0)' },
]);
