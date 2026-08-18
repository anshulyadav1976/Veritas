"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { t, type ReaderLanguage } from "@/lib/i18n";
import { notificationUpdateState, parseNotificationUpdates, type StoryUpdate } from "@/lib/local-notifications";

import { followedStoriesSnapshot, parseFollowedStoryIds, subscribeFollowedStories } from "./storage";

const enabledKey = "veritas:following-notifications-enabled";
const updatesKey = "veritas:following-notification-updates";
const changed = "veritas:following-notifications-changed";

function enabledSnapshot() { try { return localStorage.getItem(enabledKey) ?? "false"; } catch { return "false"; } }
function subscribeEnabled(listener: () => void) { window.addEventListener(changed, listener); window.addEventListener("storage", listener); return () => { window.removeEventListener(changed, listener); window.removeEventListener("storage", listener); }; }
function writeEnabled(value: boolean) { try { if (value) localStorage.setItem(enabledKey, "true"); else localStorage.removeItem(enabledKey); window.dispatchEvent(new Event(changed)); return true; } catch { return false; } }
function readUpdates() { try { return parseNotificationUpdates(localStorage.getItem(updatesKey) ?? "{}"); } catch { return {}; } }
function writeUpdates(value: Record<string, string>) { try { localStorage.setItem(updatesKey, JSON.stringify(value)); } catch { /* Browser privacy settings can disable storage. */ } }

export function FollowingNotifications({ stories, language }: { stories: StoryUpdate[]; language: ReaderLanguage }) {
  const snapshot = useSyncExternalStore(subscribeFollowedStories, followedStoriesSnapshot, () => "[]");
  const enabled = useSyncExternalStore(subscribeEnabled, enabledSnapshot, () => "false") === "true";
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!enabled || !("Notification" in window) || Notification.permission !== "granted") return;
    const state = notificationUpdateState(stories, parseFollowedStoryIds(snapshot), readUpdates());
    if (state.changed.length > 0) try { new Notification(t(language, "notificationTitle"), { body: t(language, "notificationBody", { count: state.changed.length, suffix: state.changed.length === 1 ? "y" : "ies" }) }); } catch { /* Browser notification policy can reject a granted permission. */ }
    writeUpdates(state.next);
  }, [enabled, language, snapshot, stories]);

  async function enable() {
    if (!("Notification" in window)) { setNotice(t(language, "notificationsUnsupported")); return; }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") { setNotice(t(language, "notificationsDenied")); return; }
    const state = notificationUpdateState(stories, parseFollowedStoryIds(snapshot), {});
    writeUpdates(state.next); if (!writeEnabled(true)) { setNotice(t(language, "notificationsUnsupported")); return; } setNotice(t(language, "notificationsEnabled"));
  }
  function disable() { writeEnabled(false); try { localStorage.removeItem(updatesKey); } catch { /* Browser privacy settings can disable storage. */ } setNotice(t(language, "notificationsDisabled")); }

  return <section className="notification-panel" aria-labelledby="notification-heading"><div className="section-heading"><h2 id="notification-heading">{t(language, "notifications")}</h2><span>{enabled ? t(language, "notificationsEnabled") : t(language, "notificationsDisabled")}</span></div><p className="empty-copy">{t(language, "notificationsDescription")}</p>{notice && <p role="status">{notice}</p>}<div className="story-controls">{enabled ? <><button className="quiet" type="button" onClick={disable}>{t(language, "disableNotifications")}</button><button type="button" onClick={() => window.location.reload()}>{t(language, "checkUpdates")}</button></> : <button type="button" onClick={() => void enable()}>{t(language, "enableNotifications")}</button>}</div></section>;
}
