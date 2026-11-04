// Side-effect: registers `<bx-notification-center>` under its default tag name. Import
// `@bixboards/core/notification-center/define` instead if a custom tag name/prefix is needed.
import { defineNotificationCenter } from './define.ts';
import '../badge/index.ts';
import '../relative-time/index.ts';
import '../icon-button/index.ts';
import '../avatar/index.ts';
import '../popup/index.ts';
import '../button/index.ts';
import '../spinner/index.ts';

defineNotificationCenter();

export { BxNotificationCenter } from './notification-center.ts';
export {
  dayLabel,
  type NotificationItem,
  type NotificationAction,
} from './notification-center.ts';
export { defineNotificationCenter } from './define.ts';
