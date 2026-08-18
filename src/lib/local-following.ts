import { z } from "zod";

const storyId = z.string().uuid();
const maxFollowedStories = 100;

export function parseFollowedStoryIds(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((item): item is string => typeof item === "string" && storyId.safeParse(item).success))].slice(0, maxFollowedStories);
  } catch { return []; }
}

export function serializeFollowedStoryIds(ids: Iterable<string>) {
  return JSON.stringify(parseFollowedStoryIds(JSON.stringify([...ids])));
}
