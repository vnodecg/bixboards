// Side-effect: registers `<bx-segment>` under its default tag name. Import
// `@bixboards/core/segment/define` instead if a custom tag name/prefix is needed.
import { defineSegment } from './define.ts';
import '../icon/index.ts';

defineSegment();

export { BxSegment } from './segment.ts';
export { defineSegment } from './define.ts';
