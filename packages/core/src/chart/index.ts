// Side-effect: registers `<bx-chart>` under its default tag name. Import
// `@bixboards/core/chart/define` instead if a custom tag name/prefix is needed.
import { defineChart } from './define.ts';
import '../skeleton/index.ts';

defineChart();

export { BxChart } from './chart.ts';
export {
  registerChartAdapter,
  svgAdapter,
  type ChartAdapter,
  type ChartInstance,
  type ChartSpec,
  type ChartType,
  type Series,
  type Row,
} from './chart.ts';
export { niceTicks, lttb, linear, compactNumber } from './chart-utils.ts';
export { defineChart } from './define.ts';
