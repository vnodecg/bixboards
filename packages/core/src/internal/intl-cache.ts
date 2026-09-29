// Shared `Intl` formatter cache (docs/features/core/format-bytes.md FR-FORMAT-BYTES-01,
// format-number.md FR-FORMAT-NUMBER-01, format-date.md). `Intl.*Format` construction is
// comparatively expensive, so every `bx-format-*` component (and the future `bx-number-input`,
// per FR-FORMAT-NUMBER-01) resolves formatters through this module instead of constructing its
// own, keyed by locale + options so repeated instances with the same shape reuse one formatter.

function createCache<T, O extends object>(
  Ctor: new (locale?: string | string[], options?: O) => T,
): (locale: string | undefined, options: O) => T {
  const cache = new Map<string, T>();
  return (locale, options) => {
    const key = `${locale ?? ''}|${JSON.stringify(options)}`;
    let formatter = cache.get(key);
    if (!formatter) {
      formatter = new Ctor(locale, options);
      cache.set(key, formatter);
    }
    return formatter;
  };
}

export const getNumberFormatter = createCache<
  Intl.NumberFormat,
  Intl.NumberFormatOptions
>(Intl.NumberFormat);

export const getDateTimeFormatter = createCache<
  Intl.DateTimeFormat,
  Intl.DateTimeFormatOptions
>(Intl.DateTimeFormat);
