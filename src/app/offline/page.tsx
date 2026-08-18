import Link from "next/link";
import { cookies, headers } from "next/headers";

import { readerLanguage, readerLocale, t } from "@/lib/i18n";

export default async function OfflinePage() {
  const locale = readerLocale((await cookies()).get("veritas:language")?.value, (await headers()).get("accept-language"));
  const language = readerLanguage(locale);
  return <main id="main-content" className="shell"><header className="masthead"><span className="wordmark">VERITAS</span><p>{t(language, "offline")}</p></header><section className="brief"><p className="eyebrow">{t(language, "connectionUnavailable")}</p><h1>{t(language, "offlineTitle")}</h1><p className="lede">{t(language, "offlineDescription")}</p><Link href="/">{t(language, "tryAgain")}</Link></section></main>;
}
