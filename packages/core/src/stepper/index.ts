// Side-effect: registers `<bx-stepper>` under its default tag name. Import
// `@bixboards/core/stepper/define` instead if a custom tag name/prefix is needed.
import { defineStepper } from './define.ts';
import '../step/index.ts';

defineStepper();

export { BxStepper } from './stepper.ts';
export { defineStepper } from './define.ts';
