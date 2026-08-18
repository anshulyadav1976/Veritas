import { describe, expect, it } from "vitest";

import { formatDateTime, preferredLocale } from "./locale";

describe("request locale", () => {
  it("uses the first valid language preference and a stable fallback", () => {
    expect(preferredLocale("fr-CA,fr;q=0.9,en;q=0.8")).toBe("fr-CA");
    expect(preferredLocale("bad_tag,en")).toBe("en");
  });
  it("does not format invalid dates", () => expect(formatDateTime("not-a-date", "en", { dateStyle: "medium" })).toBeNull());
});
