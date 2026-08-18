import Link from "next/link";
import { notFound } from "next/navigation";

import { claimStatuses } from "@/lib/claims";
import { dashboardIsConfigured, isOwner } from "@/lib/owner-session";
import { getStory } from "@/lib/stories";
import { addClaim, addReportingChain, mergeStory, publishSummary, splitStory } from "./actions";

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
    <section className="operator-section"><h2>Publish reviewed summary</h2><form action={publishSummary} className="credential-form"><input type="hidden" name="storyId" value={id}/><label>Evidence report<select name="articleId">{story.articles.map((article) => <option key={article.id} value={article.id}>{article.sourceName} — {article.title}</option>)}</select></label><label>Summary<input name="text" required minLength={20} maxLength={1000} autoComplete="off" defaultValue={story.summaryRecord?.text ?? ""}/></label><button type="submit">Publish reviewed summary</button></form></section>
    <section className="operator-section"><h2>Split a misclustered report</h2><form action={splitStory} className="credential-form"><input type="hidden" name="sourceStoryId" value={id}/><label>Report<select name="articleId">{story.articles.map((article) => <option key={article.id} value={article.id}>{article.sourceName} — {article.title}</option>)}</select></label><label>New story headline<input name="headline" required minLength={8} maxLength={300} autoComplete="off" /></label><label>Reason<input name="reason" required minLength={8} maxLength={500} autoComplete="off" /></label><button type="submit">Split into new story</button></form></section>
    <section className="operator-section"><h2>Merge this story into another</h2><form action={mergeStory} className="credential-form"><input type="hidden" name="sourceStoryId" value={id}/><label>Target story ID<input name="targetStoryId" required pattern="[0-9a-fA-F-]{36}" autoComplete="off" /></label><label>Reason<input name="reason" required minLength={8} maxLength={500} autoComplete="off" /></label><button type="submit">Merge stories</button></form></section>
    <section className="operator-section"><h2>Record reporting chain</h2><form action={addReportingChain} className="credential-form"><input type="hidden" name="storyId" value={id}/><label>Evidence report<select name="articleId">{story.articles.map((article) => <option key={article.id} value={article.id}>{article.sourceName} — {article.title}</option>)}</select></label><label>Chain label<input name="label" required minLength={3} maxLength={160} autoComplete="off" placeholder="Named wire service…" /></label><label>Evidence basis<input name="basis" required minLength={8} maxLength={500} autoComplete="off" /></label><label>Confidence (0–1)<input name="confidence" type="number" min="0" max="1" step="0.1" defaultValue="0.5" required/></label><button type="submit">Publish reporting chain</button></form></section>
  </main>;
}
