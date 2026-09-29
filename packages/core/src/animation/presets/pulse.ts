import { registerPreset } from './registry.ts';

registerPreset('pulse', () => [
  { transform: 'scale(1)' },
  { transform: 'scale(1.05)' },
  { transform: 'scale(1)' },
]);
