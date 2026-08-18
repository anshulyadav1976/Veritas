import Link from "next/link";
import { cookies, headers } from "next/headers";

import { readerLanguage, readerLocale, t } from "@/lib/i18n";
import { listStories } from "@/lib/stories";
import { FollowingNotifications } from "./following-notifications";
import { FollowingStoryList } from "./following-story-list";

export const dynamic = "force-dynamic";

export default async function FollowingPage() {
  const locale = readerLocale((await cookies()).get("veritas:language")?.value, (await headers()).get("accept-language"));
  const language = readerLanguage(locale); const stories = listStories(100);
  return <main id="main-content" className="shell"><header className="masthead"><Link className="wordmark" href="/">VERITAS</Link><p>{t(language, "localBrief")}</p></header><section className="brief"><p className="eyebrow">{t(language, "followedStories")}</p><h1>{t(language, "followingTitle")}</h1><p className="lede">{t(language, "followingDescription")}</p></section><FollowingNotifications stories={stories} language={language}/><FollowingStoryList stories={stories} language={language}/></main>;
}
