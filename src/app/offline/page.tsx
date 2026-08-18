import Link from "next/link";

export default function OfflinePage() {
  return <main id="main-content" className="shell"><header className="masthead"><span className="wordmark">VERITAS</span><p>Offline</p></header><section className="brief"><p className="eyebrow">Connection unavailable</p><h1>Veritas will not guess at stale evidence.</h1><p className="lede">Reconnect to load current reporting, sources, and citations. Saved story IDs remain in your browser, but reports are not cached for offline reading.</p><Link href="/">Try again</Link></section></main>;
}
