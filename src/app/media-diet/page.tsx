import Link from "next/link";
import { listStories } from "@/lib/stories";
import { MediaDietPanel } from "./media-diet-panel";

export const dynamic = "force-dynamic";
export default function MediaDietPage() { return <main id="main-content" className="shell"><header className="masthead"><Link className="wordmark" href="/">VERITAS</Link><p>Local media diet</p></header><section className="brief"><p className="eyebrow">Private by default</p><h1>Understand what you have read, locally.</h1><p className="lede">This optional feature never creates an account or sends viewing history to Veritas.</p></section><MediaDietPanel stories={listStories(100)}/></main>; }
