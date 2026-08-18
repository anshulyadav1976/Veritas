import { z } from "zod";

import type { OpenAiCredential } from "./credentials";

const modelResponse = z.object({ data: z.array(z.object({ id: z.string() })).optional() });
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function verifyOpenAiCredential(credential: OpenAiCredential, fetcher: Fetcher = fetch) {
  const url = new URL("models", credential.baseUrl.endsWith("/") ? credential.baseUrl : `${credential.baseUrl}/`);
  try {
    const response = await fetcher(url, { headers: { Authorization: `Bearer ${credential.secret}`, Accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return { ok: false as const };
    const body = modelResponse.safeParse(await response.json());
    return { ok: true as const, modelCount: body.success ? body.data.data?.length ?? 0 : 0 };
  } catch { return { ok: false as const }; }
}
