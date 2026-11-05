/** Pure helpers for `bx-chart`: scales, ticks and down-sampling. */

/** "Nice" tick values covering [min, max] with about `count` ticks. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    if (min === 0) return [0, 1];
    const pad = Math.abs(min) * 0.1 || 1;
    min -= pad;
    max += pad;
  }
  const span = max - min;
  const rough = span / Math.max(count - 1, 1);
  const pow = 10 ** Math.floor(Math.log10(rough));
  const frac = rough / pow;
  const step = (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10) * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step)
    ticks.push(Number(v.toFixed(12)));
  return ticks;
}

/**
 * Largest-Triangle-Three-Buckets down-sampling (FR-CHART-05): keeps the visual shape of a long
 * series in `threshold` points, always keeping the first and last.
 */
export function lttb(
  points: [number, number][],
  threshold: number,
): [number, number][] {
  const n = points.length;
  if (threshold >= n || threshold < 3) return points;
  const P = (i: number): [number, number] => points[i]!;
  const out: [number, number][] = [P(0)];
  const every = (n - 2) / (threshold - 2);
  let a = 0;
  for (let i = 0; i < threshold - 2; i++) {
    const nextStart = Math.floor((i + 1) * every) + 1;
    const nextEnd = Math.min(Math.floor((i + 2) * every) + 1, n);
    let avgX = 0;
    let avgY = 0;
    const len = nextEnd - nextStart;
    for (let j = nextStart; j < nextEnd; j++) {
      avgX += P(j)[0];
      avgY += P(j)[1];
    }
    avgX /= len;
    avgY /= len;
    const start = Math.floor(i * every) + 1;
    const end = Math.floor((i + 1) * every) + 1;
    let best = -1;
    let pick = start;
    for (let j = start; j < end; j++) {
      const area = Math.abs(
        (P(a)[0] - avgX) * (P(j)[1] - P(a)[1]) -
          (P(a)[0] - P(j)[0]) * (avgY - P(a)[1]),
      );
      if (area > best) {
        best = area;
        pick = j;
      }
    }
    out.push(P(pick));
    a = pick;
  }
  out.push(P(n - 1));
  return out;
}

/** Linear scale mapping a domain to a range. */
export function linear(
  d0: number,
  d1: number,
  r0: number,
  r1: number,
): (v: number) => number {
  const span = d1 - d0 || 1;
  return (v) => r0 + ((v - d0) / span) * (r1 - r0);
}

/** Compact number formatting for axis labels (1.2k, 3M). */
export function compactNumber(n: number, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}
