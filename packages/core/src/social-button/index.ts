// Side-effect: registers `<bx-social-button>` under its default tag name. Import
// `@bixboards/core/social-button/define` instead if a custom tag name/prefix is needed.
import { defineSocialButton } from './define.ts';
import '../button/index.ts';

defineSocialButton();

export { BxSocialButton } from './social-button.ts';
export {
  registerSocialProvider,
  socialLabels,
  type SocialProvider,
} from './social-button.ts';
export { defineSocialButton } from './define.ts';
