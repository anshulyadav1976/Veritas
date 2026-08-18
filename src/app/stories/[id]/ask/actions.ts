"use server";

import { z } from "zod";

import { resolveOpenAiCredential } from "@/lib/credentials";
import { askGroundedStory } from "@/lib/grounded-answer";
import { isOwner } from "@/lib/owner-session";
import { getStory } from "@/lib/stories";

export type AskState = { answer?: string; citations?: Array<{ id: number; sourceName: string; title: string; url: string }>; error?: string };
export async function askStory(_previous: AskState, formData: FormData): Promise<AskState> {
  if (!(await isOwner())) return { error: "Owner access is required." };
  const value = z.object({ storyId: z.string().uuid(), question: z.string().trim().min(3).max(500) }).safeParse(Object.fromEntries(formData));
  if (!value.success) return { error: "Enter a question between 3 and 500 characters." };
  const story = getStory(value.data.storyId);
  const credential = resolveOpenAiCredential();
  if (!story || !credential?.model) return { error: "Configure an OpenAI-compatible credential and model before asking." };
  const evidence = story.articles.map((article, index) => ({ id: index + 1, sourceName: article.sourceName, title: article.title, url: article.canonicalUrl, excerpt: article.excerpt }));
  const result = await askGroundedStory(credential, value.data.question, evidence);
  return result ? { answer: result.answer, citations: result.citations.map(({ id, sourceName, title, url }) => ({ id, sourceName, title, url })) } : { error: "No grounded answer was available from the configured provider." };
}
