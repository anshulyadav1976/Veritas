import Link from "next/link";

import { listStories } from "@/lib/stories";
import { FollowingStoryList } from "./following-story-list";

export const dynamic = "force-dynamic";

export default function FollowingPage() {
  return <main id="main-content" className="shell"><header className="masthead"><Link className="wordmark" href="/">VERITAS</Link><p>Local daily brief</p></header><section className="brief"><p className="eyebrow">Followed stories</p><h1>A brief you control, stored on this device.</h1><p className="lede">Following does not make an account, call a provider, send your list to Veritas, or generate notifications. This page simply filters the current public reader in your browser.</p></section><FollowingStoryList stories={listStories(100)}/></main>;
}
