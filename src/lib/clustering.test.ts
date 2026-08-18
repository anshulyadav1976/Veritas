import { describe, expect, it } from "vitest";
import { canAutoJoinStory } from "./clustering";

describe("headline clustering", () => {
  it("joins strongly overlapping reports", () => {
    expect(canAutoJoinStory("Kestrel bridge closes after vessel strike", "Vessel strike closes Kestrel bridge overnight")).toBe(true);
  });
  it("does not join stories that only share a subject", () => {
    expect(canAutoJoinStory("Senator announces transport funding plan", "Senator faces inquiry over election donation")).toBe(false);
  });
});
