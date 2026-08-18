import Link from "next/link";
import { notFound } from "next/navigation";

import { describeMembership } from "@/lib/provenance";
import { isOwner } from "@/lib/owner-session";
import { getStory } from "@/lib/stories";
import { SaveStoryButton } from "../../saved/save-story-button";

export const dynamic = "force-dynamic";

function formatTime(timestamp: string | null) {
  if (!timestamp) return "Publication time unavailable";
  const value = new Date(timestamp);
  return Number.isNaN(value.valueOf()) ? "Publication time unavailable" : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}
const statusLabel = (status: string) => status.replaceAll("_", " ");

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const story = getStory((await params).id);
  if (!story) notFound();
  const owner = await isOwner();
  return <main id="main-content" className="shell">
    <header className="masthead"><Link className="wordmark" href="/">VERITAS</Link><p>Evidence-first news</p></header>
    <article className="story-detail">
      <p className="eyebrow">{story.state} · {story.articleCount} reports · {story.sourceCount} publications</p>
      <h1>{story.headline}</h1>
      {story.summary && <p className="lede">{story.summary}</p>}
      <SaveStoryButton storyId={story.id}/>
      <section className="evidence-intro" aria-labelledby="reporting-heading">
        <div><p className="eyebrow">Evidence trail</p><h2 id="reporting-heading">Original reporting</h2></div>
        <p>This is a source list, not a credibility verdict. Each entry links to the publisher’s original page and shows why this report was included.</p>
      </section>
      <ol className="report-list">
        {story.articles.map((article) => <li key={article.id} className="report">
          <div className="report-meta"><Link href={`/sources/${encodeURIComponent(article.sourceDomain)}`}>{article.sourceName}</Link><span>{article.sourceCountry ?? article.sourceLanguage ?? article.sourceDomain}</span></div>
          <h2><a href={article.canonicalUrl} target="_blank" rel="noreferrer">{article.title}<span aria-hidden="true"> ↗</span></a></h2>
          {article.excerpt && <p>{article.excerpt}</p>}
          <p className="metrics">{formatTime(article.publishedAt)} · {article.decision} join · {describeMembership(article.reasonJson, article.algorithmVersion)}</p>
        </li>)}
      </ol>
      <section className="timeline" aria-labelledby="timeline-heading"><div className="section-heading"><h2 id="timeline-heading">Reporting timeline</h2><span>{story.articles.length} dated reports</span></div><p className="empty-copy">This timeline records publication dates, not a reconstruction of real-world events.</p><ol className="timeline-list">{story.articles.map((article) => <li key={article.id}><time>{formatTime(article.publishedAt)}</time><p><a href={article.canonicalUrl} target="_blank" rel="noreferrer">{article.sourceName} reported: {article.title} ↗</a></p></li>)}</ol></section>
      <section className="diversity" aria-labelledby="diversity-heading"><div className="section-heading"><h2 id="diversity-heading">Reporting diversity</h2><span>record coverage</span></div><dl><div><dt>Publications</dt><dd>{story.diversity.sourceCount}</dd></div><div><dt>With ownership records</dt><dd>{story.diversity.sourcesWithOwnership} of {story.diversity.sourceCount}</dd></div><div><dt>Recorded owner groups</dt><dd>{story.diversity.recordedOwnerGroups || "None"}</dd></div></dl><p className="empty-copy">Independent reporting chains, political perspective balance, and blindspot signals are not calculated until reviewed lineage and classification data exists.</p></section>
      <section className="claims" aria-labelledby="claims-heading">
        <div className="section-heading"><h2 id="claims-heading">Claims & evidence</h2>{owner && <span className="owner-tools"><Link href={`/stories/${story.id}/ask`}>Ask story</Link><Link href={`/stories/${story.id}/review`}>Add evidence</Link></span>}</div>
        {story.claims.length === 0 ? <p className="empty-copy">No reviewed claim records have been published. Reports above are the available evidence trail.</p> : <ol className="claim-list">{story.claims.map((claim) => <li key={claim.id}><p className="eyebrow">{statusLabel(claim.status)} · {claim.analysisVersion}</p><h3>{claim.text}</h3><p>{claim.stance}: <a href={claim.articleUrl} target="_blank" rel="noreferrer">{claim.sourceName} — {claim.articleTitle}</a></p><blockquote>{claim.note}</blockquote></li>)}</ol>}
      </section>
      {story.operations.length > 0 && <section className="operations" aria-labelledby="operations-heading"><div className="section-heading"><h2 id="operations-heading">Story history</h2><span>{story.operations.length} operations</span></div><ol className="plain-list">{story.operations.map((operation) => <li key={operation.id}><span>{operation.action} · {operation.reason}</span><span className="metrics">{operation.createdAt}</span></li>)}</ol></section>}
    </article>
  </main>;
}
