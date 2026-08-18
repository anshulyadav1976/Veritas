import { describe, expect, it } from "vitest";

import { readerLanguage, readerLocale, t } from "./i18n";

describe("reader localization", () => {
  it("uses the local preference before browser language and falls back safely", () => {
    expect(readerLocale("en", "es-MX,es;q=0.9")).toBe("en");
    expect(readerLanguage(readerLocale(undefined, "es-MX,es;q=0.9"))).toBe("es");
    expect(readerLanguage(readerLocale(undefined, "zz-invalid"))).toBe("en");
  });
  it("formats translated copy with bounded variables", () => expect(t("es", "indexed", { count: 2 })).toBe("2 indexadas"));
});
