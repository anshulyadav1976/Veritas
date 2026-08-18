import { describe, expect, it } from "vitest";

import { verifyOpenAiCredential } from "./provider-test";

const credential = { secret: "not-real", baseUrl: "https://models.example/v1", origin: "environment" as const };

describe("OpenAI-compatible connection check", () => {
  it("uses a server-side bearer request to the models endpoint", async () => {
    let request: Request | undefined;
    const result = await verifyOpenAiCredential(credential, async (input, init) => { request = new Request(input, init); return Response.json({ data: [{ id: "model-a" }] }); });
    expect(result).toEqual({ ok: true, modelCount: 1 });
    expect(request?.url).toBe("https://models.example/v1/models");
    expect(request?.headers.get("authorization")).toBe("Bearer not-real");
  });
  it("does not expose a provider error body", async () => {
    await expect(verifyOpenAiCredential(credential, async () => new Response("sensitive provider detail", { status: 401 }))).resolves.toEqual({ ok: false });
  });
});
