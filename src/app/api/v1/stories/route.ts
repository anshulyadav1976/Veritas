import { z } from "zod";

import { listStories } from "@/lib/stories";

export const dynamic = "force-dynamic";
const query = z.object({ limit: z.coerce.number().int().min(1).max(100).default(30) });

export async function GET(request: Request) {
  const result = query.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!result.success) return Response.json({ error: "limit must be an integer from 1 to 100" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  const stories = listStories(result.data.limit);
  return Response.json({ data: stories, meta: { count: stories.length } }, { headers: { "Cache-Control": "no-store" } });
}
