import Link from "next/link";
import { cookies, headers } from "next/headers";

import { formatDateTime } from "@/lib/locale";
import { readerLanguage, readerLocale, t } from "@/lib/i18n";
import { listStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

const regions = [{ code: undefined, label: "global" }, { code: "US", label: "unitedStates" }, { code: "GB", label: "unitedKingdom" }, { code: "IN", label: "india" }];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const selectedRegion = (await searchParams).region?.toUpperCase();
  const region = regions.some((item) => item.code === selectedRegion) ? selectedRegion : undefined;
  const stories = listStories(30, region);
  const locale = readerLocale((await cookies()).get("veritas:language")?.value, (await headers()).get("accept-language"));
  const language = readerLanguage(locale);

  return (
    <main id="main-content" className="shell">
      <header className="masthead">
        <Link className="wordmark" href="/" aria-label="Veritas home">VERITAS</Link>
        <p>{t(language, "evidenceFirst")}</p>
      </header>
      <section className="brief" aria-labelledby="brief-heading">
        <p className="eyebrow">{t(language, "morningBrief")}</p>
        <h1 id="brief-heading">{t(language, "homeTitle")}</h1>
        <p className="lede">{t(language, "homeDescription")}</p>
      </section>
      <section aria-labelledby="stories-heading">
        <div className="section-heading">
          <h2 id="stories-heading">{region ? `${t(language, regions.find((item) => item.code === region)?.label ?? "global")} ${t(language, "stories")}` : t(language, "topStories")}</h2>
          <span>{t(language, "indexed", { count: stories.length })}</span>
        </div>
        <nav className="region-nav" aria-label="Story region">{regions.map((item) => <Link aria-current={item.code === region ? "page" : undefined} key={item.label} href={item.code ? `/?region=${item.code}` : "/"}>{t(language, item.label)}</Link>)}</nav>
        {stories.length === 0 ? (
          <div className="empty" role="status">
            <p className="eyebrow">{t(language, "noStories")}</p>
            <h2>{t(language, "ingestionNotRun")}</h2>
            <p>{t(language, "ingestionInstructions")}</p>
          </div>
        ) : (
          <ol className="story-list">
            {stories.map((story) => (
              <li key={story.id}>
                <article className="story">
                  <p className="eyebrow">{story.state} · {formatDateTime(story.updatedAt, locale, { dateStyle: "medium", timeStyle: "short" }) ?? t(language, "updateUnavailable")}</p>
                  <h3><Link href={`/stories/${story.id}`}>{story.headline}</Link></h3>
                  {story.summary && <p>{story.summary}</p>}
                  <p className="metrics">{story.articleCount} {t(language, "articles")} · {story.sourceCount} {t(language, "publications")}</p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
