import { describe, expect, it } from "vitest";

import { retryDelayMs } from "./jobs";

describe("job retry schedule", () => {
  it("backs off and caps retries", () => {
    expect(retryDelayMs(1)).toBe(30_000);
    expect(retryDelayMs(2)).toBe(60_000);
    expect(retryDelayMs(20)).toBe(15 * 60_000);
  });
});
