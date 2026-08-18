"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { followedStoriesSnapshot, parseFollowedStoryIds, subscribeFollowedStories } from "./storage";

type Story = { id: string; headline: string; summary: string | null; state: string; articleCount: number; sourceCount: number; updatedAt: string };
const formatTime = (timestamp: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));

export function FollowingStoryList({ stories }: { stories: Story[] }) {
  const snapshot = useSyncExternalStore(subscribeFollowedStories, followedStoriesSnapshot, () => "[]");
  const followed = new Set(parseFollowedStoryIds(snapshot)); const visible = stories.filter((story) => followed.has(story.id));
  if (visible.length === 0) return <div className="empty"><p className="eyebrow">Nothing followed</p><h2>Follow a story to include it here.</h2><p>Only current public stories are shown. Superseded or no-longer-indexed stories are not retained as a private server record.</p></div>;
  return <ol className="story-list">{visible.map((story) => <li key={story.id}><article className="story"><p className="eyebrow">{story.state} · Updated {formatTime(story.updatedAt)}</p><h2><Link href={`/stories/${story.id}`}>{story.headline}</Link></h2>{story.summary && <p>{story.summary}</p>}<p className="metrics">{story.articleCount} reports · {story.sourceCount} publications</p></article></li>)}</ol>;
}
