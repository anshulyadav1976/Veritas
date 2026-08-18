import Link from "next/link";
import { notFound } from "next/navigation";

import { claimStatuses } from "@/lib/claims";
import { dashboardIsConfigured, isOwner } from "@/lib/owner-session";
import { getStory } from "@/lib/stories";
import { addClaim } from "./actions";

const label = (value: string) => value.replaceAll("_", " ");

export default async function ReviewStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  if (!dashboardIsConfigured() || !(await isOwner())) notFound();
  const story = getStory(id);
  if (!story) notFound();
  return <main id="main-content" className="shell">
    <header className="masthead"><Link className="wordmark" href={`/stories/${id}`}>VERITAS</Link><p>Operator review</p></header>
    <section className="brief"><p className="eyebrow">Grounded evidence</p><h1>Add a claim with a source note.</h1><p className="lede">This does not verify the claim. It records a reviewable statement and the report that supports, contradicts, or contextualizes it.</p></section>
    <form action={addClaim} className="credential-form"><input type="hidden" name="storyId" value={id}/><label>Claim<input name="text" required minLength={8} maxLength={500} autoComplete="off" /></label><label>Status<select name="status" defaultValue="unverified">{claimStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></label><label>Evidence report<select name="articleId">{story.articles.map((article) => <option key={article.id} value={article.id}>{article.sourceName} — {article.title}</option>)}</select></label><label>How this report relates<select name="stance" defaultValue="context"><option value="supports">Supports</option><option value="contradicts">Contradicts</option><option value="context">Provides context</option></select></label><label>Attributed evidence note<input name="note" required minLength={8} maxLength={500} autoComplete="off" /></label><button type="submit">Publish evidence record</button></form>
  </main>;
}
