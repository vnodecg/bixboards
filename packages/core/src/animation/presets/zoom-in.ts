import { registerPreset } from './registry.ts';

registerPreset('zoomIn', () => [
  { opacity: 0, transform: 'scale(0.5)' },
  { opacity: 1, transform: 'scale(1)' },
]);
