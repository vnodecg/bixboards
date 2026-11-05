// Side-effect: registers `<bx-segmented-control>` under its default tag name. Import
// `@bixboards/core/segmented-control/define` instead if a custom tag name/prefix is needed.
import { defineSegmentedControl } from './define.ts';
import '../segment/index.ts';

defineSegmentedControl();

export { BxSegmentedControl } from './segmented-control.ts';
export { defineSegmentedControl } from './define.ts';
