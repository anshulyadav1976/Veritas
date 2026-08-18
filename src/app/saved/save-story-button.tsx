"use client";

import { useSyncExternalStore } from "react";

import { savedStoriesSnapshot, subscribeSavedStories, writeSavedStories } from "./storage";

const idsFor = (value: string) => { try { return new Set<string>(JSON.parse(value)); } catch { return new Set<string>(); } };

export function SaveStoryButton({ storyId }: { storyId: string }) {
  const snapshot = useSyncExternalStore(subscribeSavedStories, savedStoriesSnapshot, () => "[]");
  const saved = idsFor(snapshot).has(storyId);
  function toggle() {
    const ids = idsFor(snapshot);
    if (ids.has(storyId)) ids.delete(storyId); else ids.add(storyId);
    try { writeSavedStories(JSON.stringify([...ids])); } catch { /* Storage may be disabled by the browser. */ }
  }
  return <button type="button" className="quiet save-story" onClick={toggle}>{saved ? "Remove saved story" : "Save story"}</button>;
}
