import { registerPreset } from './registry.ts';

registerPreset('spin', () => [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' },
]);
