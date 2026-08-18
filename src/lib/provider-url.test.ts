import { describe, expect, it } from "vitest";

import { safeProviderBaseUrl, safePublicHttpsUrl } from "./provider-url";

const publicResolver = async () => [{ address: "93.184.216.34" }];

describe("custom provider endpoint validation", () => {
  it("accepts a public HTTPS endpoint after resolution", async () => {
    await expect(safeProviderBaseUrl("https://models.example/v1", publicResolver)).resolves.toBe("https://models.example/v1");
  });
  it("rejects local, private, and non-HTTPS targets", async () => {
    await expect(safeProviderBaseUrl("http://models.example/v1", publicResolver)).rejects.toThrow("public HTTPS");
    await expect(safeProviderBaseUrl("https://127.0.0.1/v1", publicResolver)).rejects.toThrow("public addresses");
    await expect(safeProviderBaseUrl("https://models.example/v1", async () => [{ address: "10.0.0.7" }])).rejects.toThrow("public addresses");
  });
  it("shares the public-address policy with feed acquisition", async () => {
    await expect(safePublicHttpsUrl("https://feed.example/rss.xml", publicResolver)).resolves.toBe("https://feed.example/rss.xml");
    await expect(safePublicHttpsUrl("https://feed.example/rss.xml", async () => [{ address: "127.0.0.1" }])).rejects.toThrow("public addresses");
  });
});
