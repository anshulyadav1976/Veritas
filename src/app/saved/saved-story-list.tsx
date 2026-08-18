"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { savedStoriesSnapshot, subscribeSavedStories } from "./storage";

type Story = { id: string; headline: string; summary: string | null; articleCount: number; sourceCount: number };
const idsFor = (value: string) => { try { return new Set<string>(JSON.parse(value)); } catch { return new Set<string>(); } };

export function SavedStoryList({ stories }: { stories: Story[] }) {
  const snapshot = useSyncExternalStore(subscribeSavedStories, savedStoriesSnapshot, () => "[]");
  const saved = idsFor(snapshot);
  const visible = stories.filter((story) => saved.has(story.id));
  if (visible.length === 0) return <div className="empty"><p className="eyebrow">Nothing saved</p><h2>Save a story to keep it nearby.</h2><p>Saved stories stay in this browser only. Clearing browser storage removes them.</p></div>;
  return <ol className="story-list">{visible.map((story) => <li key={story.id}><article className="story"><p className="eyebrow">Saved · {story.articleCount} reports · {story.sourceCount} publications</p><h2><Link href={`/stories/${story.id}`}>{story.headline}</Link></h2>{story.summary && <p>{story.summary}</p>}</article></li>)}</ol>;
}
