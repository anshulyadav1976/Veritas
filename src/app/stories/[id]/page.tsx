import Link from "next/link";
import { notFound } from "next/navigation";

import { describeMembership } from "@/lib/provenance";
import { getStory } from "@/lib/stories";

export const dynamic = "force-dynamic";

function formatTime(timestamp: string | null) {
  if (!timestamp) return "Publication time unavailable";
  const value = new Date(timestamp);
  return Number.isNaN(value.valueOf()) ? "Publication time unavailable" : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const story = getStory((await params).id);
  if (!story) notFound();
  return <main id="main-content" className="shell">
    <header className="masthead"><Link className="wordmark" href="/">VERITAS</Link><p>Evidence-first news</p></header>
    <article className="story-detail">
      <p className="eyebrow">{story.state} · {story.articleCount} reports · {story.sourceCount} publications</p>
      <h1>{story.headline}</h1>
      {story.summary && <p className="lede">{story.summary}</p>}
      <section className="evidence-intro" aria-labelledby="reporting-heading">
        <div><p className="eyebrow">Evidence trail</p><h2 id="reporting-heading">Original reporting</h2></div>
        <p>This is a source list, not a credibility verdict. Each entry links to the publisher’s original page and shows why this report was included.</p>
      </section>
      <ol className="report-list">
        {story.articles.map((article) => <li key={article.id} className="report">
          <div className="report-meta"><span>{article.sourceName}</span><span>{article.sourceCountry ?? article.sourceLanguage ?? article.sourceDomain}</span></div>
          <h2><a href={article.canonicalUrl} target="_blank" rel="noreferrer">{article.title}<span aria-hidden="true"> ↗</span></a></h2>
          {article.excerpt && <p>{article.excerpt}</p>}
          <p className="metrics">{formatTime(article.publishedAt)} · {article.decision} join · {describeMembership(article.reasonJson, article.algorithmVersion)}</p>
        </li>)}
      </ol>
    </article>
  </main>;
}
