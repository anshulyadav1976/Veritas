import Link from "next/link";

import { listStories } from "@/lib/stories";
import { SavedStoryList } from "./saved-story-list";

export const dynamic = "force-dynamic";

export default function SavedPage() {
  return <main id="main-content" className="shell">
    <header className="masthead"><Link className="wordmark" href="/">VERITAS</Link><p>Local reading list</p></header>
    <section className="brief"><p className="eyebrow">Saved stories</p><h1>Your reading list stays on this device.</h1><p className="lede">Veritas does not create an account or send this list to the server.</p></section>
    <SavedStoryList stories={listStories(100)}/>
  </main>;
}
