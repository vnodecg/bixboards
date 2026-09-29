import { registerPreset } from './registry.ts';

registerPreset('fadeOut', () => [{ opacity: 1 }, { opacity: 0 }]);
