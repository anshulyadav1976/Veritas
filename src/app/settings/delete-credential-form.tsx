"use client";

import { deleteProvider } from "./actions";

export function DeleteCredentialForm({ provider }: { provider: string }) {
  return <form action={deleteProvider} onSubmit={(event) => { if (!window.confirm(`Delete the ${provider} credential? This cannot be undone.`)) event.preventDefault(); }}>
    <input type="hidden" name="provider" value={provider}/>
    <button className="quiet" type="submit">Delete credential</button>
  </form>;
}
