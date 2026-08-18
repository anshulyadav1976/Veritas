import { describe, expect, it } from "vitest";

import { primaryMaterialInput } from "./primary-materials";

const record = { storyId: "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70", title: "Bridge safety order", materialType: "official_record", url: "https://agency.example.gov/orders/bridge-safety", relevanceNote: "The order records the agency decision and stated safety basis.", publishedAt: "2026-08-18T12:00:00.000Z" };

describe("primary material input", () => {
  it("requires a bounded HTTPS evidence record", () => expect(primaryMaterialInput.parse(record)).toMatchObject(record));
  it("refuses non-HTTPS or credential-bearing outbound links", () => {
    expect(primaryMaterialInput.safeParse({ ...record, url: "http://agency.example.gov/order" }).success).toBe(false);
    expect(primaryMaterialInput.safeParse({ ...record, url: "https://key@agency.example.gov/order" }).success).toBe(false);
  });
});
