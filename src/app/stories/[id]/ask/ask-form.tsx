"use client";

import { useActionState } from "react";

import { askStory, type AskState } from "./actions";

const initial: AskState = {};
export function AskForm({ storyId }: { storyId: string }) {
  const [state, action, pending] = useActionState(askStory, initial);
  return <form action={action} className="credential-form"><input type="hidden" name="storyId" value={storyId}/><label>Question<input name="question" required minLength={3} maxLength={500} autoComplete="off" placeholder="What do the reports agree on?…" /></label><button type="submit" disabled={pending}>{pending ? "Checking evidence…" : "Ask from evidence"}</button>{state.error && <p role="alert">{state.error}</p>}{state.answer && <section className="answer" aria-live="polite"><h2>Grounded answer</h2><p>{state.answer}</p><h3>Sources used</h3><ol>{state.citations?.map((citation) => <li key={citation.id}><a href={citation.url} target="_blank" rel="noreferrer">[{citation.id}] {citation.sourceName} — {citation.title}</a></li>)}</ol></section>}</form>;
}
