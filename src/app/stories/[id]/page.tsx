import Link from "next/link";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

import { formatDateTime } from "@/lib/locale";
import { readerLabel, readerLanguage, readerLocale, t } from "@/lib/i18n";
import { describeMembership } from "@/lib/provenance";
import { isOwner } from "@/lib/owner-session";
import { getStory } from "@/lib/stories";
import { SaveStoryButton } from "../../saved/save-story-button";
import { RecordStoryVisit } from "../../media-diet/record-story-visit";
import { FollowStoryButton } from "../../following/follow-story-button";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const story = getStory((await params).id);
  if (!story) notFound();
  const owner = await isOwner();
  const locale = readerLocale((await cookies()).get("veritas:language")?.value, (await headers()).get("accept-language"));
  const language = readerLanguage(locale);
  const formatTime = (timestamp: string | null) => formatDateTime(timestamp, locale, { dateStyle: "medium", timeStyle: "short" }) ?? "Publication time unavailable";
  return <main id="main-content" className="shell">
    <RecordStoryVisit storyId={story.id}/>
    <header className="masthead"><Link className="wordmark" href="/">VERITAS</Link><p>Evidence-first news</p></header>
    <article className="story-detail">
      <p className="eyebrow">{readerLabel(language, story.state)} · {story.articleCount} {t(language, "reports")} · {story.sourceCount} {t(language, "publications")}</p>
      <h1>{story.headline}</h1>
      {story.summary && <><p className="summary-label">{story.summaryRecord ? `Reviewed summary · ${story.summaryRecord.methodVersion}` : "Initial feed excerpt · not a reviewed summary"}</p><p className="lede">{story.summary}</p></>}
      <div className="story-controls"><SaveStoryButton storyId={story.id}/><FollowStoryButton storyId={story.id} language={language}/></div>
      <section className="evidence-intro" aria-labelledby="reporting-heading">
        <div><p className="eyebrow">{t(language, "evidenceTrail")}</p><h2 id="reporting-heading">{t(language, "originalReporting")}</h2></div>
        <p>{t(language, "trailDescription")}</p>
      </section>
      <ol className="report-list">
        {story.articles.map((article) => <li key={article.id} className="report">
          <div className="report-meta"><Link href={`/sources/${encodeURIComponent(article.sourceDomain)}`}>{article.sourceName}</Link><span>{article.sourceCountry ?? article.sourceLanguage ?? article.sourceDomain}</span></div>
          <h2><a href={article.canonicalUrl} target="_blank" rel="noreferrer">{article.title}<span aria-hidden="true"> ↗</span></a></h2>
          {article.excerpt && <p>{article.excerpt}</p>}
          <p className="metrics">{formatTime(article.publishedAt)} · {readerLabel(language, article.decision)} join · {describeMembership(article.reasonJson, article.algorithmVersion)}</p>
        </li>)}
      </ol>
      <section className="primary-materials" aria-labelledby="materials-heading"><div className="section-heading"><h2 id="materials-heading">{t(language, "primaryMaterials")}</h2><span>{t(language, "reviewedLinks", { count: story.primaryMaterials.length })}</span></div>{story.primaryMaterials.length === 0 ? <p className="empty-copy">{t(language, "noMaterials")}</p> : <ol className="plain-list">{story.primaryMaterials.map((material) => <li key={material.id}><div><p className="eyebrow">{readerLabel(language, material.materialType)} · {material.methodVersion}</p><a href={material.url} target="_blank" rel="noreferrer">{material.title} ↗</a><p>{material.relevanceNote}</p></div><span className="metrics">{formatTime(material.publishedAt)}</span></li>)}</ol>}<p className="empty-copy">{t(language, "materialsCaveat")}</p></section>
      <section className="timeline" aria-labelledby="timeline-heading"><div className="section-heading"><h2 id="timeline-heading">{t(language, "reportingTimeline")}</h2><span>{t(language, "datedReports", { count: story.articles.length })}</span></div><p className="empty-copy">{t(language, "timelineCaveat")}</p><ol className="timeline-list">{story.articles.map((article) => <li key={article.id}><time>{formatTime(article.publishedAt)}</time><p><a href={article.canonicalUrl} target="_blank" rel="noreferrer">{article.sourceName} reported: {article.title} ↗</a></p></li>)}</ol></section>
      <section className="diversity" aria-labelledby="diversity-heading"><div className="section-heading"><h2 id="diversity-heading">{t(language, "diversity")}</h2><span>record coverage</span></div><dl><div><dt>{t(language, "publications")}</dt><dd>{story.diversity.sourceCount}</dd></div><div><dt>With ownership records</dt><dd>{story.diversity.sourcesWithOwnership} of {story.diversity.sourceCount}</dd></div><div><dt>Recorded owner groups</dt><dd>{story.diversity.recordedOwnerGroups || "None"}</dd></div><div><dt>Documented reporting chains</dt><dd>{story.diversity.reportingChainCount}</dd></div><div><dt>Reports without a chain record</dt><dd>{story.diversity.unclassifiedArticles}</dd></div></dl><p className="empty-copy">A chain record documents a reviewed shared origin; unclassified reports are not assumed independent. Political perspective balance and blindspot signals are not calculated until reviewed classification data exists.</p></section>
      <section className="diversity" aria-labelledby="coverage-heading"><div className="section-heading"><h2 id="coverage-heading">{t(language, "coverage")}</h2><span>{story.topic ? `${readerLabel(language, story.topic)} · ${readerLabel(language, "reviewed")}` : "topic unclassified"}</span></div>{story.coverageRecords.length === 0 ? <p className="empty-copy">No coverage-form records have been reviewed. Veritas does not infer a publication’s political perspective from its identity.</p> : <><dl>{["direct_reporting","analysis","opinion","unknown"].map((form)=><div key={form}><dt>{readerLabel(language, form)}</dt><dd>{story.coverageRecords.filter((record)=>record.coverageForm===form).length}</dd></div>)}</dl><p className="empty-copy">{story.coverageRecords.length} of {story.articles.length} reports have a reviewed form record. Counts describe this sample only; they do not measure political balance, truthfulness, or source quality.</p></>}</section>
      <section className="diversity" aria-labelledby="blindspot-heading"><div className="section-heading"><h2 id="blindspot-heading">Geographic coverage-gap check</h2><span>{readerLabel(language, story.blindspot.state)}</span></div><dl><div><dt>Reviewed reports</dt><dd>{story.blindspot.reviewedCount} of {story.blindspot.reportCount}</dd></div><div><dt>Publications</dt><dd>{story.blindspot.sourceCount}</dd></div><div><dt>Source countries</dt><dd>{story.blindspot.countryCount}</dd></div><div><dt>Comparison target</dt><dd>{story.blindspot.expectedCountryCode ?? "Not set"}</dd></div></dl>{story.blindspot.rationale && <p className="metrics">Review rationale: {story.blindspot.rationale}</p>}<p className="empty-copy">{story.blindspot.message} It compares only this reviewed story sample and cannot establish why other outlets did or did not publish.</p></section>
      <section className="claims" aria-labelledby="claims-heading">
        <div className="section-heading"><h2 id="claims-heading">{t(language, "claimsEvidence")}</h2>{owner && <span className="owner-tools"><Link href={`/stories/${story.id}/ask`}>Ask story</Link><Link href={`/stories/${story.id}/review`}>Add evidence</Link></span>}</div>
        {story.claims.length === 0 ? <p className="empty-copy">{t(language, "noClaims")}</p> : <ol className="claim-list">{story.claims.map((claim) => <li key={claim.id}><p className="eyebrow">{readerLabel(language, claim.status)} · {readerLabel(language, claim.claimType)} · {claim.analysisVersion}</p><h3>{claim.text}</h3>{claim.evidence.map((evidence) => <div key={evidence.id}><p>Publisher report · {readerLabel(language, evidence.stance)}: <a href={evidence.articleUrl} target="_blank" rel="noreferrer">{evidence.sourceName} — {evidence.articleTitle}</a></p>{evidence.evidenceSpan && <blockquote>{evidence.evidenceSpan}</blockquote>}<p className="metrics">Review note: {evidence.note}</p></div>)}{claim.primaryMaterials.map((material)=><p key={material.id}>Primary material · {readerLabel(language, material.stance)}: <a href={material.url} target="_blank" rel="noreferrer">{material.title} ↗</a><br/><span className="metrics">{material.note}</span></p>)}</li>)}</ol>}
      </section>
      {story.corrections.length > 0 && <section className="operations" aria-labelledby="corrections-heading"><div className="section-heading"><h2 id="corrections-heading">{t(language, "corrections")}</h2><span>{t(language, "auditRecords", { count: story.corrections.length })}</span></div><p className="empty-copy">A correction adds context to a reviewed evidence record without erasing the original. Derived story counts are recomputed in the same transaction.</p><ol className="plain-list">{story.corrections.map((correction) => <li key={correction.id}><span>{readerLabel(language, correction.targetType)} · {correction.note}</span><span className="metrics">{formatTime(correction.createdAt)}</span></li>)}</ol></section>}
      {story.operations.length > 0 && <section className="operations" aria-labelledby="operations-heading"><div className="section-heading"><h2 id="operations-heading">{t(language, "storyHistory")}</h2><span>{t(language, "operations", { count: story.operations.length })}</span></div><ol className="plain-list">{story.operations.map((operation) => <li key={operation.id}><span>{operation.action} · {operation.reason}</span><span className="metrics">{operation.createdAt}</span></li>)}</ol></section>}
    </article>
  </main>;
}
