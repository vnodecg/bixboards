import { registerPreset } from './registry.ts';

// Distance-based preset: slides in by a fluid space token, not a fixed px value
// (docs/features/core/animation.md §4).
registerPreset('slideInDown', () => [
  { opacity: 0, transform: 'translateY(calc(var(--bx-space-xl) * -1))' },
  { opacity: 1, transform: 'translateY(0)' },
]);
