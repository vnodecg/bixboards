import { registerPreset } from './registry.ts';

// Distance-based preset: moves by a fluid space token, not a fixed px value
// (docs/features/core/animation.md §4).
registerPreset('bounce', () => [
  { transform: 'translateY(0)' },
  { transform: 'translateY(calc(var(--bx-space-m) * -1))' },
  { transform: 'translateY(0)' },
]);
