export const savedStoriesKey = "veritas:saved-story-ids";
const changed = "veritas:saved-stories-changed";

export function savedStoriesSnapshot() { try { return localStorage.getItem(savedStoriesKey) ?? "[]"; } catch { return "[]"; } }
export function subscribeSavedStories(listener: () => void) {
  window.addEventListener(changed, listener); window.addEventListener("storage", listener);
  return () => { window.removeEventListener(changed, listener); window.removeEventListener("storage", listener); };
}
export function writeSavedStories(value: string) { localStorage.setItem(savedStoriesKey, value); window.dispatchEvent(new Event(changed)); }
