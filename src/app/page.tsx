import Link from "next/link";
import { headers } from "next/headers";

import { formatDateTime, preferredLocale } from "@/lib/locale";
import { listStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

const regions = [{ code: undefined, label: "Global" }, { code: "US", label: "United States" }, { code: "GB", label: "United Kingdom" }, { code: "IN", label: "India" }];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const selectedRegion = (await searchParams).region?.toUpperCase();
  const region = regions.some((item) => item.code === selectedRegion) ? selectedRegion : undefined;
  const stories = listStories(30, region);
  const locale = preferredLocale((await headers()).get("accept-language"));

  return (
    <main id="main-content" className="shell">
      <header className="masthead">
        <Link className="wordmark" href="/" aria-label="Veritas home">VERITAS</Link>
        <p>Evidence-first news</p>
      </header>
      <section className="brief" aria-labelledby="brief-heading">
        <p className="eyebrow">Morning brief</p>
        <h1 id="brief-heading">See the reporting behind the story.</h1>
        <p className="lede">A transparent reader for the reporting behind a story: original links, source counts, and the decision that grouped each report.</p>
      </section>
      <section aria-labelledby="stories-heading">
        <div className="section-heading">
          <h2 id="stories-heading">{region ? `${regions.find((item) => item.code === region)?.label} stories` : "Top stories"}</h2>
          <span>{stories.length} indexed</span>
        </div>
        <nav className="region-nav" aria-label="Story region">{regions.map((item) => <Link aria-current={item.code === region ? "page" : undefined} key={item.label} href={item.code ? `/?region=${item.code}` : "/"}>{item.label}</Link>)}</nav>
        {stories.length === 0 ? (
          <div className="empty" role="status">
            <p className="eyebrow">No stories yet</p>
            <h2>Ingestion has not run.</h2>
            <p>Add a feed to <code>registry/feeds.json</code> and run <code>pnpm ingest</code>. Deduplicated, source-linked story clusters will appear here.</p>
          </div>
        ) : (
          <ol className="story-list">
            {stories.map((story) => (
              <li key={story.id}>
                <article className="story">
                  <p className="eyebrow">{story.state} · {formatDateTime(story.updatedAt, locale, { dateStyle: "medium", timeStyle: "short" }) ?? "Update time unavailable"}</p>
                  <h3><Link href={`/stories/${story.id}`}>{story.headline}</Link></h3>
                  {story.summary && <p>{story.summary}</p>}
                  <p className="metrics">{story.articleCount} articles · {story.sourceCount} publications</p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
