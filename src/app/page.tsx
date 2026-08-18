import Link from "next/link";

import { listStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}

export default function HomePage() {
  const stories = listStories();

  return (
    <main className="shell">
      <header className="masthead">
        <Link className="wordmark" href="/" aria-label="Veritas home">VERITAS</Link>
        <p>Evidence-first news</p>
      </header>
      <section className="brief" aria-labelledby="brief-heading">
        <p className="eyebrow">Morning brief</p>
        <h1 id="brief-heading">See the reporting behind the story.</h1>
        <p className="lede">Veritas is ready for sources. Add feeds in the next ingestion milestone; every story will retain its original reporting and provenance.</p>
      </section>
      <section aria-labelledby="stories-heading">
        <div className="section-heading">
          <h2 id="stories-heading">Top stories</h2>
          <span>{stories.length} indexed</span>
        </div>
        {stories.length === 0 ? (
          <div className="empty" role="status">
            <p className="eyebrow">No stories yet</p>
            <h2>Ingestion has not run.</h2>
            <p>Once RSS and GDELT discovery are configured, this is where deduplicated, source-linked story clusters appear.</p>
          </div>
        ) : (
          <ol className="story-list">
            {stories.map((story) => (
              <li key={story.id}>
                <article className="story">
                  <p className="eyebrow">{story.state} · {formatTime(story.updatedAt)}</p>
                  <h3>{story.headline}</h3>
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
