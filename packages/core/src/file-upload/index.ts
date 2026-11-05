// Side-effect: registers `<bx-file-upload>` under its default tag name. Import
// `@bixboards/core/file-upload/define` instead if a custom tag name/prefix is needed.
import { defineFileUpload } from './define.ts';
import '../button/index.ts';
import '../progress-bar/index.ts';
import '../format-bytes/index.ts';
import '../icon-button/index.ts';

defineFileUpload();

export { BxFileUpload } from './file-upload.ts';
export {
  matchesAccept,
  type Uploader,
  type Rejection,
  type RejectReason,
} from './file-upload.ts';
export { defineFileUpload } from './define.ts';
