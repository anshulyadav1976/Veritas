"use client";
import { useEffect } from "react";
const enabledKey = "veritas:media-diet-enabled"; const visitsKey = "veritas:story-visits";
export function RecordStoryVisit({ storyId }: { storyId: string }) { useEffect(() => { try { if (localStorage.getItem(enabledKey) !== "true") return; const visits = JSON.parse(localStorage.getItem(visitsKey) ?? "[]") as Array<{ id: string; at: string }>; localStorage.setItem(visitsKey, JSON.stringify([{ id: storyId, at: new Date().toISOString() }, ...visits].slice(0, 200))); } catch { /* Local privacy mode can disable storage. */ } }, [storyId]); return null; }
