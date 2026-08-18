"use client";

import { useSyncExternalStore } from "react";

type Story = { id: string; headline: string; sourceCount: number };
const enabledKey = "veritas:media-diet-enabled"; const visitsKey = "veritas:story-visits"; const changed = "veritas:media-diet-changed";
const snapshot = () => { try { return `${localStorage.getItem(enabledKey) ?? "false"}|${localStorage.getItem(visitsKey) ?? "[]"}`; } catch { return "false|[]"; } };
const subscribe = (listener: () => void) => { window.addEventListener(changed, listener); return () => window.removeEventListener(changed, listener); };
const emit = () => window.dispatchEvent(new Event(changed));

export function MediaDietPanel({ stories }: { stories: Story[] }) {
  const value = useSyncExternalStore(subscribe, snapshot, () => "false|[]"); const [enabled, raw] = value.split("|", 2); const visits = (() => { try { return JSON.parse(raw) as Array<{ id: string; at: string }>; } catch { return []; } })();
  if (enabled !== "true") return <section className="empty"><p className="eyebrow">Disabled by default</p><h2>Keep media-diet history in this browser.</h2><p>Veritas will record only story IDs and local timestamps. Nothing is sent to the server.</p><button type="button" onClick={() => { localStorage.setItem(enabledKey, "true"); emit(); }}>Enable local tracking</button></section>;
  const viewed = stories.filter((story) => visits.some((visit) => visit.id === story.id)); const publications = viewed.reduce((total, story) => total + story.sourceCount, 0);
  return <section><div className="diversity"><dl><div><dt>Stories read</dt><dd>{visits.length}</dd></div><div><dt>Distinct saved history</dt><dd>{viewed.length}</dd></div><div><dt>Publisher appearances</dt><dd>{publications}</dd></div></dl></div><p className="empty-copy">Counts describe local reading history, not source independence, political balance, or a quality score.</p><button type="button" className="quiet" onClick={() => { localStorage.removeItem(visitsKey); localStorage.removeItem(enabledKey); emit(); }}>Clear local history</button></section>;
}
