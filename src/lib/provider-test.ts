import { z } from "zod";

import type { OpenAiCredential } from "./credentials";
import { safeProviderBaseUrl } from "./provider-url";

const modelResponse = z.object({ data: z.array(z.object({ id: z.string() })).optional() });
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function verifyOpenAiCredential(credential: OpenAiCredential, fetcher: Fetcher = fetch) {
  try {
    const baseUrl = credential.origin === "dashboard" ? await safeProviderBaseUrl(credential.baseUrl) : credential.baseUrl;
    const url = new URL("models", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    const response = await fetcher(url, { headers: { Authorization: `Bearer ${credential.secret}`, Accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return { ok: false as const };
    const body = modelResponse.safeParse(await response.json());
    return { ok: true as const, modelCount: body.success ? body.data.data?.length ?? 0 : 0 };
  } catch { return { ok: false as const }; }
}
