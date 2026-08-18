"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { t, type ReaderLanguage } from "@/lib/i18n";
import { followedStoriesSnapshot, parseFollowedStoryIds, subscribeFollowedStories } from "./storage";

type Story = { id: string; headline: string; summary: string | null; state: string; articleCount: number; sourceCount: number; updatedAt: string };
const formatTime = (timestamp: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));

export function FollowingStoryList({ stories, language }: { stories: Story[]; language: ReaderLanguage }) {
  const snapshot = useSyncExternalStore(subscribeFollowedStories, followedStoriesSnapshot, () => "[]");
  const followed = new Set(parseFollowedStoryIds(snapshot)); const visible = stories.filter((story) => followed.has(story.id));
  if (visible.length === 0) return <div className="empty"><p className="eyebrow">{t(language, "nothingFollowed")}</p><h2>{t(language, "followToInclude")}</h2><p>{t(language, "followedDescription")}</p></div>;
  return <ol className="story-list">{visible.map((story) => <li key={story.id}><article className="story"><p className="eyebrow">{story.state} · {t(language, "updated")} {formatTime(story.updatedAt)}</p><h2><Link href={`/stories/${story.id}`}>{story.headline}</Link></h2>{story.summary && <p>{story.summary}</p>}<p className="metrics">{story.articleCount} {t(language, "reports")} · {story.sourceCount} {t(language, "publications")}</p></article></li>)}</ol>;
}
