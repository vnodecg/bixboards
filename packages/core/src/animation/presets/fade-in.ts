import { registerPreset } from './registry.ts';

registerPreset('fadeIn', () => [{ opacity: 0 }, { opacity: 1 }]);
