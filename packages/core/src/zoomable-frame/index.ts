// Side-effect: registers `<bx-zoomable-frame>` under its default tag name. Import
// `@bixant/core/zoomable-frame/define` instead if a custom tag name/prefix is needed.
import { defineZoomableFrame } from './define.ts';

defineZoomableFrame();

export { BxZoomableFrame } from './zoomable-frame.ts';
export { defineZoomableFrame } from './define.ts';
