// Side-effect: registers `<bx-timeline-item>` under its default tag name. Import
// `@bixboards/core/timeline-item/define` instead if a custom tag name/prefix is needed.
import { defineTimelineItem } from './define.ts';
import '../icon/index.ts';
import '../format-date/index.ts';
import '../relative-time/index.ts';

defineTimelineItem();

export { BxTimelineItem } from './timeline-item.ts';
export { defineTimelineItem } from './define.ts';
