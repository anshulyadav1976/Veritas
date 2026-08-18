import Link from "next/link";
import { notFound } from "next/navigation";

import { getSourceProfile } from "@/lib/stories";
import { isOwner } from "@/lib/owner-session";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Date unavailable" : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default async function SourcePage({ params }: { params: Promise<{ domain: string }> }) {
  const source = getSourceProfile(decodeURIComponent((await params).domain));
  if (!source) notFound();
  const owner = await isOwner();
  return <main id="main-content" className="shell">
    <header className="masthead"><Link className="wordmark" href="/">VERITAS</Link><p>Source profile</p></header>
    <section className="brief"><p className="eyebrow">Publisher identity</p><h1>{source.name}</h1><p className="lede">{source.domain} · {source.countryCode ?? "Country unrecorded"} · {source.languageTag ?? "Language unrecorded"} · {source.sourceType ?? "Type unrecorded"}</p><p className="metrics">{source.articleCount} indexed articles · {source.storyCount} linked stories</p></section>
    <section className="profile-section" aria-labelledby="assessment-heading"><div className="section-heading"><h2 id="assessment-heading">Historical assessment</h2><span className="owner-tools">{owner && <Link href={`/sources/${encodeURIComponent(source.domain)}/review`}>Review source</Link>}<span>{source.assessment?.status ?? "unassessed"}</span></span></div>{source.assessment ? <><p>{source.assessment.rationale ?? "No rationale has been published."}</p>{source.assessment.evidenceUrl && <p><a href={source.assessment.evidenceUrl} target="_blank" rel="noreferrer">Assessment evidence ↗</a></p>}<p className="metrics">{source.assessment.methodVersion} · reviewed {formatDate(source.assessment.reviewedAt)}</p></> : <p className="empty-copy">No historical orientation or reliability assessment has been published. This is not a verdict on any individual report.</p>}</section>
    <section className="profile-section" aria-labelledby="ownership-heading"><div className="section-heading"><h2 id="ownership-heading">Ownership records</h2><span>{source.owners.length} recorded</span></div>{source.owners.length === 0 ? <p className="empty-copy">No ownership assertion has been reviewed for this source.</p> : <ul className="plain-list">{source.owners.map((owner) => <li key={`${owner.ownerName}:${owner.evidenceUrl}`}><a href={owner.evidenceUrl} target="_blank" rel="noreferrer">{owner.ownerName} ↗</a><span className="metrics"> asserted {formatDate(owner.assertedAt)} · {Math.round(owner.confidence * 100)}% record confidence</span></li>)}</ul>}</section>
    <section className="profile-section" aria-labelledby="articles-heading"><div className="section-heading"><h2 id="articles-heading">Recent reporting</h2><span>up to 50</span></div><ol className="story-list">{source.articles.map((article) => <li key={article.id}><article className="story"><p className="eyebrow">{formatDate(article.publishedAt)}</p><h3><a href={article.canonicalUrl} target="_blank" rel="noreferrer">{article.title} ↗</a></h3>{article.storyId && article.storyHeadline && <p><Link href={`/stories/${article.storyId}`}>In story: {article.storyHeadline}</Link></p>}</article></li>)}</ol></section>
  </main>;
}
