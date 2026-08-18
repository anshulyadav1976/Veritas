"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { t, type ReaderLanguage } from "@/lib/i18n";
import { followedStoriesSnapshot, parseFollowedStoryIds, subscribeFollowedStories, writeFollowedStories } from "./storage";

export function FollowStoryButton({ storyId, language = "en" }: { storyId: string; language?: ReaderLanguage }) {
  const snapshot = useSyncExternalStore(subscribeFollowedStories, followedStoriesSnapshot, () => "[]");
  const followed = new Set(parseFollowedStoryIds(snapshot));
  const active = followed.has(storyId);
  function toggle() {
    const next = new Set(parseFollowedStoryIds(snapshot));
    if (next.has(storyId)) next.delete(storyId); else next.add(storyId);
    try { writeFollowedStories(next); } catch { /* Browser privacy settings can disable storage. */ }
  }
  return <><button type="button" className="quiet save-story" onClick={toggle}>{active ? t(language, "unfollowStory") : t(language, "followStory")}</button>{active && <Link className="quiet-link" href="/following">{t(language, "viewBrief")}</Link>}</>;
}
