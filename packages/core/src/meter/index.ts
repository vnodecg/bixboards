// Side-effect: registers `<bx-meter>` under its default tag name. Import
// `@bixboards/core/meter/define` instead if a custom tag name/prefix is needed.
import { defineMeter } from './define.ts';

defineMeter();

export { BxMeter } from './meter.ts';
export { meterBand } from './meter.ts';
export { defineMeter } from './define.ts';
