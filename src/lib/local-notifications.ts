import { z } from "zod";

const update = z.object({ id: z.string().uuid(), updatedAt: z.string().min(1) });
export type StoryUpdate = z.infer<typeof update> & { headline: string };

export function parseNotificationUpdates(value: string): Record<string, string> {
  try {
    const parsed = z.record(z.string(), z.string()).safeParse(JSON.parse(value));
    return parsed.success ? Object.fromEntries(Object.entries(parsed.data).filter(([id, updatedAt]) => update.safeParse({ id, updatedAt }).success && !Number.isNaN(Date.parse(updatedAt)))) : {};
  } catch {
    return {};
  }
}

export function notificationUpdateState(stories: StoryUpdate[], followedIds: Iterable<string>, previous: Record<string, string>) {
  const followed = new Set(followedIds);
  const visible = stories.filter((story) => followed.has(story.id));
  return { changed: visible.filter((story) => previous[story.id] !== undefined && previous[story.id] !== story.updatedAt), next: Object.fromEntries(visible.map((story) => [story.id, story.updatedAt])) };
}
