import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { formatDateTime, preferredLocale } from "@/lib/locale";
import { describeMembership } from "@/lib/provenance";
import { isOwner } from "@/lib/owner-session";
import { getStory } from "@/lib/stories";
import { SaveStoryButton } from "../../saved/save-story-button";
import { RecordStoryVisit } from "../../media-diet/record-story-visit";
import { FollowStoryButton } from "../../following/follow-story-button";

export const dynamic = "force-dynamic";

const statusLabel = (status: string) => status.replaceAll("_", " ");

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const story = getStory((await params).id);
  if (!story) notFound();
  const owner = await isOwner();
  const locale = preferredLocale((await headers()).get("accept-language"));
  const formatTime = (timestamp: string | null) => formatDateTime(timestamp, locale, { dateStyle: "medium", timeStyle: "short" }) ?? "Publication time unavailable";
  return <main id="main-content" className="shell">
    <RecordStoryVisit storyId={story.id}/>
    <header className="masthead"><Link className="wordmark" href="/">VERITAS</Link><p>Evidence-first news</p></header>
    <article className="story-detail">
      <p className="eyebrow">{story.state} · {story.articleCount} reports · {story.sourceCount} publications</p>
      <h1>{story.headline}</h1>
      {story.summary && <><p className="summary-label">{story.summaryRecord ? `Reviewed summary · ${story.summaryRecord.methodVersion}` : "Initial feed excerpt · not a reviewed summary"}</p><p className="lede">{story.summary}</p></>}
      <div className="story-controls"><SaveStoryButton storyId={story.id}/><FollowStoryButton storyId={story.id}/></div>
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
      <section className="primary-materials" aria-labelledby="materials-heading"><div className="section-heading"><h2 id="materials-heading">Primary materials & fact checks</h2><span>{story.primaryMaterials.length} reviewed links</span></div>{story.primaryMaterials.length === 0 ? <p className="empty-copy">No primary-material or fact-check records have been reviewed for this story.</p> : <ol className="plain-list">{story.primaryMaterials.map((material) => <li key={material.id}><div><p className="eyebrow">{statusLabel(material.materialType)} · {material.methodVersion}</p><a href={material.url} target="_blank" rel="noreferrer">{material.title} ↗</a><p>{material.relevanceNote}</p></div><span className="metrics">{formatTime(material.publishedAt)}</span></li>)}</ol>}<p className="empty-copy">These are reviewed links to relevant records. Their presence does not by itself confirm every claim in the story.</p></section>
      <section className="timeline" aria-labelledby="timeline-heading"><div className="section-heading"><h2 id="timeline-heading">Reporting timeline</h2><span>{story.articles.length} dated reports</span></div><p className="empty-copy">This timeline records publication dates, not a reconstruction of real-world events.</p><ol className="timeline-list">{story.articles.map((article) => <li key={article.id}><time>{formatTime(article.publishedAt)}</time><p><a href={article.canonicalUrl} target="_blank" rel="noreferrer">{article.sourceName} reported: {article.title} ↗</a></p></li>)}</ol></section>
      <section className="diversity" aria-labelledby="diversity-heading"><div className="section-heading"><h2 id="diversity-heading">Reporting diversity</h2><span>record coverage</span></div><dl><div><dt>Publications</dt><dd>{story.diversity.sourceCount}</dd></div><div><dt>With ownership records</dt><dd>{story.diversity.sourcesWithOwnership} of {story.diversity.sourceCount}</dd></div><div><dt>Recorded owner groups</dt><dd>{story.diversity.recordedOwnerGroups || "None"}</dd></div><div><dt>Documented reporting chains</dt><dd>{story.diversity.reportingChainCount}</dd></div><div><dt>Reports without a chain record</dt><dd>{story.diversity.unclassifiedArticles}</dd></div></dl><p className="empty-copy">A chain record documents a reviewed shared origin; unclassified reports are not assumed independent. Political perspective balance and blindspot signals are not calculated until reviewed classification data exists.</p></section>
      <section className="diversity" aria-labelledby="coverage-heading"><div className="section-heading"><h2 id="coverage-heading">Coverage comparison</h2><span>{story.topic ? `${statusLabel(story.topic)} · reviewed` : "topic unclassified"}</span></div>{story.coverageRecords.length === 0 ? <p className="empty-copy">No coverage-form records have been reviewed. Veritas does not infer a publication’s political perspective from its identity.</p> : <><dl>{["direct_reporting","analysis","opinion","unknown"].map((form)=><div key={form}><dt>{statusLabel(form)}</dt><dd>{story.coverageRecords.filter((record)=>record.coverageForm===form).length}</dd></div>)}</dl><p className="empty-copy">{story.coverageRecords.length} of {story.articles.length} reports have a reviewed form record. Counts describe this sample only; they do not measure political balance, truthfulness, or source quality.</p></>}</section>
      <section className="claims" aria-labelledby="claims-heading">
        <div className="section-heading"><h2 id="claims-heading">Claims & evidence</h2>{owner && <span className="owner-tools"><Link href={`/stories/${story.id}/ask`}>Ask story</Link><Link href={`/stories/${story.id}/review`}>Add evidence</Link></span>}</div>
        {story.claims.length === 0 ? <p className="empty-copy">No reviewed claim records have been published. Reports above are the available evidence trail.</p> : <ol className="claim-list">{story.claims.map((claim) => <li key={claim.id}><p className="eyebrow">{statusLabel(claim.status)} · {claim.analysisVersion}</p><h3>{claim.text}</h3><p>Publisher report · {claim.stance}: <a href={claim.articleUrl} target="_blank" rel="noreferrer">{claim.sourceName} — {claim.articleTitle}</a></p><blockquote>{claim.note}</blockquote>{claim.primaryMaterials.map((material)=><p key={material.id}>Primary material · {material.stance}: <a href={material.url} target="_blank" rel="noreferrer">{material.title} ↗</a><br/><span className="metrics">{material.note}</span></p>)}</li>)}</ol>}
      </section>
      {story.corrections.length > 0 && <section className="operations" aria-labelledby="corrections-heading"><div className="section-heading"><h2 id="corrections-heading">Corrections</h2><span>{story.corrections.length} audit records</span></div><p className="empty-copy">A correction adds context to a reviewed evidence record without erasing the original. Derived story counts are recomputed in the same transaction.</p><ol className="plain-list">{story.corrections.map((correction) => <li key={correction.id}><span>{statusLabel(correction.targetType)} · {correction.note}</span><span className="metrics">{formatTime(correction.createdAt)}</span></li>)}</ol></section>}
      {story.operations.length > 0 && <section className="operations" aria-labelledby="operations-heading"><div className="section-heading"><h2 id="operations-heading">Story history</h2><span>{story.operations.length} operations</span></div><ol className="plain-list">{story.operations.map((operation) => <li key={operation.id}><span>{operation.action} · {operation.reason}</span><span className="metrics">{operation.createdAt}</span></li>)}</ol></section>}
    </article>
  </main>;
}
