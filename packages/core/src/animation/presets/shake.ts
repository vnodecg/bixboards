import { registerPreset } from './registry.ts';

// Distance-based preset: shakes by a fluid space token, not a fixed px value
// (docs/features/core/animation.md §4).
registerPreset('shake', () => [
  { transform: 'translateX(0)' },
  { transform: 'translateX(calc(var(--bx-space-xs) * -1))' },
  { transform: 'translateX(var(--bx-space-xs))' },
  { transform: 'translateX(calc(var(--bx-space-xs) * -1))' },
  { transform: 'translateX(var(--bx-space-xs))' },
  { transform: 'translateX(0)' },
]);
