import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { canAutoJoinStory } from "./clustering";

type Fixture = { left: string; right: string; sameStory: boolean };
const fixtures = JSON.parse(readFileSync(resolve(process.cwd(), "evals/clustering.json"), "utf8")) as Fixture[];

describe("clustering evaluation baseline", () => {
  it("matches the labelled conservative pair set", () => {
    expect(fixtures).not.toHaveLength(0);
    for (const fixture of fixtures) expect(canAutoJoinStory(fixture.left, fixture.right)).toBe(fixture.sameStory);
  });
});
