// Side-effect: registers `<bx-skeleton>` under its default tag name. Import
// `@bixboards/core/skeleton/define` instead if a custom tag name/prefix is needed.
import { defineSkeleton } from './define.ts';

defineSkeleton();

export { BxSkeleton } from './skeleton.ts';
export { defineSkeleton } from './define.ts';
