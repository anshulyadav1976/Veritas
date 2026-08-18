const fallbackLocale = "en";

export function preferredLocale(header: string | null): string {
  for (const part of (header ?? "").split(",")) {
    const candidate = part.split(";", 1)[0]?.trim();
    if (!candidate || candidate === "*") continue;
    try { return Intl.getCanonicalLocales(candidate)[0] ?? fallbackLocale; } catch { /* Try the next preference. */ }
  }
  return fallbackLocale;
}

export function formatDateTime(value: string | null, locale: string, options: Intl.DateTimeFormatOptions) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : new Intl.DateTimeFormat(locale, options).format(date);
}
