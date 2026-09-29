import { registerPreset } from './registry.ts';

registerPreset('zoomOut', () => [
  { opacity: 1, transform: 'scale(1)' },
  { opacity: 0, transform: 'scale(0.5)' },
]);
