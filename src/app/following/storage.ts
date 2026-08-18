import { parseFollowedStoryIds, serializeFollowedStoryIds } from "@/lib/local-following";

export const followedStoriesKey = "veritas:followed-story-ids";
const changed = "veritas:followed-stories-changed";

export function followedStoriesSnapshot() { try { return localStorage.getItem(followedStoriesKey) ?? "[]"; } catch { return "[]"; } }
export function subscribeFollowedStories(listener: () => void) {
  window.addEventListener(changed, listener); window.addEventListener("storage", listener);
  return () => { window.removeEventListener(changed, listener); window.removeEventListener("storage", listener); };
}
export function writeFollowedStories(ids: Iterable<string>) { localStorage.setItem(followedStoriesKey, serializeFollowedStoryIds(ids)); window.dispatchEvent(new Event(changed)); }
export { parseFollowedStoryIds };
