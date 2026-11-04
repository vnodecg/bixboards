// Side-effect: registers `<bx-timeline>` under its default tag name. Import
// `@bixboards/core/timeline/define` instead if a custom tag name/prefix is needed.
import { defineTimeline } from './define.ts';
import '../timeline-item/index.ts';

defineTimeline();

export { BxTimeline } from './timeline.ts';
export { defineTimeline } from './define.ts';
