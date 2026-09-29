import { registerPreset } from './registry.ts';

registerPreset('flip', () => [
  { transform: 'rotateY(0deg)' },
  { transform: 'rotateY(180deg)' },
]);
