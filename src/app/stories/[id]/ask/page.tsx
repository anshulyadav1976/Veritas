import Link from "next/link";
import { notFound } from "next/navigation";

import { dashboardIsConfigured, isOwner } from "@/lib/owner-session";
import { getStory } from "@/lib/stories";
import { AskForm } from "./ask-form";

export default async function AskStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  if (!dashboardIsConfigured() || !(await isOwner()) || !getStory(id)) notFound();
  return <main id="main-content" className="shell"><header className="masthead"><Link className="wordmark" href={`/stories/${id}`}>VERITAS</Link><p>Owner tool</p></header><section className="brief"><p className="eyebrow">Ask this story</p><h1>Ask only from the reports we have.</h1><p className="lede">This sends the stored excerpts to your configured provider. Answers must cite those excerpts; if the evidence cannot support an answer, Veritas shows no answer.</p></section><AskForm storyId={id}/></main>;
}
